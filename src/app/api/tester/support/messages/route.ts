import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import {
  insertSupportMessage,
  isAdminSupportOnline,
  listSupportMessagesForUser,
} from "@/lib/tester-support-chat";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.supabaseUserId;
  if (!session?.user?.id || !userId || !canAccessTesterDashboard(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const messages = await listSupportMessagesForUser(userId);
  return NextResponse.json({ ok: true, messages, adminOnline: isAdminSupportOnline() });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.supabaseUserId;
  if (!session?.user?.id || !userId || !canAccessTesterDashboard(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as { message?: string };
  const message = String(body.message ?? "");
  const result = await insertSupportMessage({ userId, message, sender: "user" });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
