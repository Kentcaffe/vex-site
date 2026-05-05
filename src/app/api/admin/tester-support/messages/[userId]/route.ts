import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-roles";
import {
  insertSupportMessage,
  listSupportMessagesForUser,
  markAdminSupportPresenceNow,
} from "@/lib/tester-support-chat";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "invalid_user" }, { status: 400 });
  }
  const messages = await listSupportMessagesForUser(userId);
  return NextResponse.json({ ok: true, messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { userId } = await params;
  const body = (await request.json().catch(() => ({}))) as { message?: string };
  const message = String(body.message ?? "");
  const result = await insertSupportMessage({ userId, message, sender: "admin" });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  markAdminSupportPresenceNow();
  return NextResponse.json({ ok: true });
}
