import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-roles";
import { getPresenceHistory, getPresenceStats, touchPresence } from "@/lib/live-presence-store";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { sid?: string };
    const sid = typeof body?.sid === "string" ? body.sid.trim() : "";
    if (!sid) {
      return NextResponse.json({ ok: false, error: "missing_sid" }, { status: 400 });
    }
    const session = await auth();
    touchPresence(sid, session?.user?.id ?? null);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isAdmin(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({
    ok: true,
    stats: getPresenceStats(),
    history: getPresenceHistory(15),
  });
}

