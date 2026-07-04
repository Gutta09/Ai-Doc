import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export interface ExtractedPdf {
  text: string;
  numPages: number;
  chunks: string[];
}

/**
 * Extract text from a PDF buffer and split it into overlapping chunks suitable
 * for embedding + retrieval.
 */
export async function pdfBufferToChunks(buffer: Buffer): Promise<ExtractedPdf> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const text = (result.text ?? "").trim();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await splitter.createDocuments([text]);
    const chunks = docs
      .map((d) => d.pageContent.trim())
      .filter((c) => c.length > 0);

    return { text, numPages: result.total, chunks };
  } finally {
    await parser.destroy();
  }
}
