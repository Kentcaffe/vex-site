import { NextResponse } from "next/server";
import { syncAuthenticatedUserToPrisma } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable } from "@/lib/api-error";
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
  return NextResponse.json({ ok: true, user: session.user });
}
