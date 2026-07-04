import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

// List the signed-in user's files (newest first).
export async function GET() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const files = await db.file.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(files);
}
