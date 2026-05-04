import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { syncAuthenticatedUserToPrisma } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable } from "@/lib/api-error";
import { ensureTesterActivityRow, recordTesterLoginSession } from "@/lib/tester-activity-server";
import { logRouteError } from "@/lib/server-log";

export async function POST() {
  let session = null;
  try {
    session = await syncAuthenticatedUserToPrisma();
  } catch (error) {
    logRouteError("POST /api/auth/sync-user", error);
    return jsonServiceUnavailable("User sync is temporarily unavailable.", ApiErrorCode.DATABASE);
  }
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role === UserRole.TESTER) {
    try {
      await ensureTesterActivityRow(session.user.id);
      await recordTesterLoginSession(session.user.id);
    } catch (e) {
      logRouteError("POST /api/auth/sync-user tester activity", e);
    }
  }
  return NextResponse.json({ ok: true, user: session.user });
}
