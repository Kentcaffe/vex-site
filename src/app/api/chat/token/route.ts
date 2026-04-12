import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { signSocketToken } from "@/lib/socket-auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ token: signSocketToken(session.user.id) });
}
