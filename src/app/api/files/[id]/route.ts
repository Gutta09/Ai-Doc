import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

// Fetch a single file (used to poll upload/processing status).
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const file = await db.file.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!file) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(file);
}

// Delete a file (chunks + messages cascade via the schema relations).
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const file = await db.file.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!file) return new NextResponse("Not found", { status: 404 });

  await db.file.delete({ where: { id: file.id } });

  return NextResponse.json({ success: true });
}
