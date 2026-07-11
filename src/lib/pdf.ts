import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export interface ExtractedPdf {
  text: string;
  numPages: number;
  chunks: string[];
}

export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;

/** Split raw text into overlapping chunks suitable for embedding + retrieval. */
export async function splitIntoChunks(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  const docs = await splitter.createDocuments([text]);
  return docs.map((d) => d.pageContent.trim()).filter((c) => c.length > 0);
}

/** Extract text from a PDF buffer and split it into embedding-ready chunks. */
export async function pdfBufferToChunks(buffer: Buffer): Promise<ExtractedPdf> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const text = (result.text ?? "").trim();
    const chunks = await splitIntoChunks(text);
    return { text, numPages: result.total, chunks };
  } finally {
    await parser.destroy();
  }
}
