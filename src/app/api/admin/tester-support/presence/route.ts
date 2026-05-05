import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-roles";
import {
  isAdminSupportOnline,
  markAdminSupportPresenceNow,
} from "@/lib/tester-support-chat";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ ok: true, online: isAdminSupportOnline() });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  markAdminSupportPresenceNow();
  return NextResponse.json({ ok: true });
}
