import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  embedDocuments,
  embedQuery,
  toVectorLiteral,
  EMBEDDING_DIMENSIONS,
} from "../voyage";

function mockVoyageFetch() {
  return vi.fn(async (_url: unknown, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body));
    // Echo back one embedding per input — deliberately OUT of order to prove
    // the client re-sorts by index.
    const data = body.input
      .map((_: string, i: number) => ({ index: i, embedding: [i, i, i] }))
      .reverse();
    return {
      ok: true,
      json: async () => ({ data }),
    } as Response;
  });
}

describe("voyage client", () => {
  beforeEach(() => {
    vi.stubEnv("VOYAGE_API_KEY", "test-key");
    vi.stubGlobal("fetch", mockVoyageFetch());
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("re-sorts out-of-order responses by index", async () => {
    const out = await embedDocuments(["a", "b", "c"]);
    expect(out).toEqual([[0, 0, 0], [1, 1, 1], [2, 2, 2]]);
  });

  it("batches large inputs into requests of at most 64", async () => {
    const fetchMock = mockVoyageFetch();
    vi.stubGlobal("fetch", fetchMock);

    const chunks = Array.from({ length: 130 }, (_, i) => `chunk ${i}`);
    const out = await embedDocuments(chunks);

    expect(fetchMock).toHaveBeenCalledTimes(3); // 64 + 64 + 2
    expect(out).toHaveLength(130);
    const firstBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(firstBody.input).toHaveLength(64);
    expect(firstBody.input_type).toBe("document");
    expect(firstBody.output_dimension).toBe(EMBEDDING_DIMENSIONS);
  });

  it("embeds queries with input_type=query", async () => {
    const fetchMock = mockVoyageFetch();
    vi.stubGlobal("fetch", fetchMock);
    await embedQuery("what is this?");
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.input_type).toBe("query");
    expect(body.input).toEqual(["what is this?"]);
  });

  it("throws a descriptive error on non-2xx responses", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false,
      status: 401,
      text: async () => "bad key",
    }) as unknown as Response));
    await expect(embedQuery("q")).rejects.toThrow(/401[\s\S]*bad key/);
  });

  it("throws immediately when the API key is missing", async () => {
    vi.stubEnv("VOYAGE_API_KEY", "");
    await expect(embedQuery("q")).rejects.toThrow(/VOYAGE_API_KEY/);
  });

  it("formats vectors as pgvector literals", () => {
    expect(toVectorLiteral([0.1, -2, 3])).toBe("[0.1,-2,3]");
  });
});
