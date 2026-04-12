import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unreadTotalForUser } from "@/lib/chat-actions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const count = await unreadTotalForUser(session.user.id);
  return NextResponse.json({ count });
}
