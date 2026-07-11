import { describe, expect, it } from "vitest";
import { splitIntoChunks, CHUNK_SIZE, CHUNK_OVERLAP } from "../pdf";

describe("splitIntoChunks", () => {
  it("returns a single chunk for short text", async () => {
    const chunks = await splitIntoChunks("A short paragraph.");
    expect(chunks).toEqual(["A short paragraph."]);
  });

  it("returns no chunks for empty text", async () => {
    expect(await splitIntoChunks("")).toEqual([]);
    expect(await splitIntoChunks("   \n\n  ")).toEqual([]);
  });

  it("splits long text into bounded, overlapping chunks", async () => {
    const paragraph = "The quarterly report shows steady growth in all segments. ";
    const text = paragraph.repeat(200); // ~11k chars
    const chunks = await splitIntoChunks(text);

    expect(chunks.length).toBeGreaterThan(5);
    for (const c of chunks) {
      expect(c.length).toBeLessThanOrEqual(CHUNK_SIZE);
      expect(c.length).toBeGreaterThan(0);
    }
    // Consecutive chunks share overlapping text (retrieval context continuity)
    const tail = chunks[0].slice(-Math.floor(CHUNK_OVERLAP / 4));
    expect(chunks[1]).toContain(tail.trim().split(" ").slice(1).join(" "));
  });
});
