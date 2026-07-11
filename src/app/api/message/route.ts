import { NextRequest } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, type CoreMessage } from "ai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";
import { embedQuery, toVectorLiteral } from "@/lib/voyage";
import { messageBodySchema } from "@/lib/validators";

// Allow streaming responses up to 60 seconds on Vercel.
export const maxDuration = 60;

// Cost guard: cap how many messages a user can send per hour. DB-backed so it
// works across serverless instances (in-memory counters don't survive there).
const HOURLY_MESSAGE_LIMIT = 30;

// Default to Sonnet for a sane cost profile on a public demo; override with
// ANTHROPIC_MODEL (e.g. "claude-opus-4-8" for maximum answer quality).
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

export async function POST(req: NextRequest) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user?.id) return new Response("Unauthorized", { status: 401 });

  const parsed = messageBodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return new Response("Invalid request body", { status: 400 });
  }
  const { fileId, messages } = parsed.data;

  // Ensure the file belongs to the signed-in user.
  const file = await db.file.findFirst({
    where: { id: fileId, userId: user.id },
  });
  if (!file) return new Response("File not found", { status: 404 });

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");
  if (!lastUserMessage) {
    return new Response("No user message provided", { status: 400 });
  }

  // Rate limit: messages sent by this user in the past hour.
  const recentCount = await db.message.count({
    where: {
      userId: user.id,
      isUserMessage: true,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentCount >= HOURLY_MESSAGE_LIMIT) {
    return new Response(
      "Rate limit reached — please wait a while before sending more messages.",
      { status: 429 }
    );
  }

  // Persist the user's message.
  await db.message.create({
    data: {
      text: lastUserMessage.content,
      isUserMessage: true,
      userId: user.id,
      fileId,
    },
  });

  // --- Retrieval: embed the question and find the closest chunks ---
  const queryEmbedding = await embedQuery(lastUserMessage.content);
  const vector = toVectorLiteral(queryEmbedding);
  const results = await db.$queryRaw<{ content: string }[]>`
    SELECT "content"
    FROM "Chunk"
    WHERE "fileId" = ${fileId}
    ORDER BY "embedding" <=> ${vector}::vector
    LIMIT 4
  `;
  const context = results.map((r) => r.content).join("\n\n---\n\n");

  const system = `You are AI Doc, an assistant that answers questions about the user's PDF document.
Answer using ONLY the CONTEXT below, which was extracted from the user's PDF. If the answer is not contained in the context, clearly say you could not find it in the document — do not make things up. Format answers in markdown and keep them concise.

----CONTEXT----
${context || "(no relevant text found)"}
----END CONTEXT----`;

  // Send only the most recent turns to the model to keep token usage bounded.
  const recent: CoreMessage[] = messages
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content }));

  const result = streamText({
    model: anthropic(MODEL),
    system,
    messages: recent,
    onFinish: async ({ text }) => {
      await db.message.create({
        data: {
          text,
          isUserMessage: false,
          userId: user.id,
          fileId,
        },
      });
    },
  });

  return result.toDataStreamResponse();
}
