import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id || !user.email) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  // Sync the Kinde user into our database on first login.
  await db.user.upsert({
    where: { id: user.id },
    update: { email: user.email },
    create: { id: user.id, email: user.email },
  });

  return NextResponse.json({ success: true });
}
