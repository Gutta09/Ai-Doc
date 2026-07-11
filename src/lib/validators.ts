import { z } from "zod";

// Body of POST /api/message — kept out of the route file so it can be
// unit-tested (Next.js route files may only export route handlers).
export const messageBodySchema = z.object({
  fileId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
});

export type MessageBody = z.infer<typeof messageBodySchema>;
