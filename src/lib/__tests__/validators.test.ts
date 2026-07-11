import { describe, expect, it } from "vitest";
import { messageBodySchema } from "../validators";

describe("messageBodySchema", () => {
  it("accepts a valid chat payload", () => {
    const result = messageBodySchema.safeParse({
      fileId: "abc123",
      messages: [
        { role: "user", content: "What is this document about?" },
        { role: "assistant", content: "It is a report." },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown roles", () => {
    const result = messageBodySchema.safeParse({
      fileId: "abc123",
      messages: [{ role: "tool", content: "hax" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fileId and non-string content", () => {
    expect(
      messageBodySchema.safeParse({ messages: [] }).success
    ).toBe(false);
    expect(
      messageBodySchema.safeParse({
        fileId: "x",
        messages: [{ role: "user", content: 42 }],
      }).success
    ).toBe(false);
  });
});
