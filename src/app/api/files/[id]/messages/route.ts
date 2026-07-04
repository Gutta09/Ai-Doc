import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_LIMIT = 10;

// Paginated message history for a file (newest first, cursor-based).
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const file = await db.file.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!file) return new NextResponse("Not found", { status: 404 });

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit")) || DEFAULT_LIMIT;
  const cursor = searchParams.get("cursor") ?? undefined;

  const messages = await db.message.findMany({
    where: { fileId: params.id },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      isUserMessage: true,
      createdAt: true,
      text: true,
    },
  });

  let nextCursor: string | undefined;
  if (messages.length > limit) {
    const next = messages.pop();
    nextCursor = next?.id;
  }

  return NextResponse.json({ messages, nextCursor });
}
