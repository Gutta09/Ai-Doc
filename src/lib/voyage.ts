// Thin wrapper around the Voyage AI embeddings REST API.
// Voyage is Anthropic's recommended embedding provider. voyage-3.5 outputs
// 1024-dimensional vectors by default, matching the `vector(1024)` column in
// the Prisma schema.

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const MODEL = "voyage-3.5";
export const EMBEDDING_DIMENSIONS = 1024;

type VoyageResponse = {
  data: { embedding: number[]; index: number }[];
};

async function callVoyage(
  input: string[],
  inputType: "document" | "query"
): Promise<number[][]> {
  if (!process.env.VOYAGE_API_KEY) {
    throw new Error("VOYAGE_API_KEY is not set");
  }

  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      input,
      input_type: inputType,
      output_dimension: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Voyage embeddings request failed (${res.status}): ${detail}`);
  }

  const json = (await res.json()) as VoyageResponse;
  // Voyage returns results out of order occasionally — sort by `index`.
  return json.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

/** Embed document chunks (batched to stay within Voyage request limits). */
export async function embedDocuments(chunks: string[]): Promise<number[][]> {
  const BATCH_SIZE = 64;
  const out: number[][] = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const vectors = await callVoyage(batch, "document");
    out.push(...vectors);
  }
  return out;
}

/** Embed a single user query. */
export async function embedQuery(query: string): Promise<number[]> {
  const [vector] = await callVoyage([query], "query");
  return vector;
}

/** Format a JS number[] as a pgvector literal, e.g. "[0.1,0.2,...]". */
export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
