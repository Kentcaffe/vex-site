import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import { applyTesterActivityUpdate } from "@/lib/tester-activity-server";
import { logRouteError } from "@/lib/server-log";

type Body = {
  type?: string;
  path?: string;
  secondsDelta?: number;
};

export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    try {
      const text = await request.text();
      body = text ? (JSON.parse(text) as Body) : {};
    } catch {
      body = {};
    }
  }

  try {
    const session = await auth();
    if (!session?.user?.id || !canAccessTesterDashboard(session.user.role)) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    if (session.user.mustChangePassword) {
      return NextResponse.json({ ok: false, error: "password_change_required" }, { status: 403 });
    }
    const type = body.type === "heartbeat" || body.type === "session_end" ? body.type : null;
    if (!type) {
      return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 });
    }
    await applyTesterActivityUpdate(session.user.id, {
      type,
      path: body.path,
      secondsDelta: body.secondsDelta,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logRouteError("POST /api/tester/activity", error);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
