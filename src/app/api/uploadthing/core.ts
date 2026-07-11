import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";
import { pdfBufferToChunks } from "@/lib/pdf";
import { embedDocuments, toVectorLiteral } from "@/lib/voyage";

const f = createUploadthing();

// Ingestion cost guards: a 16MB PDF can produce thousands of chunks, and every
// chunk is an embedding API call. Cap both dimensions and fail loudly instead
// of silently running up a bill.
const MAX_PAGES = 150;
const MAX_CHUNKS = 500;

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();
      if (!user || !user.id) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // UploadThing v7 exposes `ufsUrl`; older field is `url`.
      const fileUrl =
        (file as { ufsUrl?: string }).ufsUrl ?? (file as { url: string }).url;

      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: fileUrl,
          uploadStatus: "PROCESSING",
        },
      });

      try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { chunks, numPages } = await pdfBufferToChunks(buffer);

        if (chunks.length === 0) {
          throw new Error("No extractable text found in PDF");
        }
        if (numPages > MAX_PAGES) {
          throw new Error(`PDF has ${numPages} pages — the limit is ${MAX_PAGES}`);
        }
        if (chunks.length > MAX_CHUNKS) {
          throw new Error(`PDF produced ${chunks.length} chunks — the limit is ${MAX_CHUNKS}`);
        }

        const embeddings = await embedDocuments(chunks);

        // Insert each chunk + its embedding via raw SQL (pgvector column is
        // Unsupported in the typed Prisma client).
        await db.$transaction(
          chunks.map((content, i) => {
            const id = crypto.randomUUID();
            const vector = toVectorLiteral(embeddings[i]);
            return db.$executeRaw`
              INSERT INTO "Chunk" ("id", "content", "fileId", "embedding", "createdAt")
              VALUES (${id}, ${content}, ${createdFile.id}, ${vector}::vector, now())
            `;
          })
        );

        await db.file.update({
          where: { id: createdFile.id },
          data: { uploadStatus: "SUCCESS" },
        });
      } catch (err) {
        console.error("PDF ingestion failed:", err);
        await db.file.update({
          where: { id: createdFile.id },
          data: { uploadStatus: "FAILED" },
        });
      }

      return { fileId: createdFile.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
