import { NextResponse } from "next/server";
import { syncAuthenticatedUserToPrisma } from "@/auth";
import { logRouteError } from "@/lib/server-log";

export async function POST() {
  let session = null;
  try {
    session = await syncAuthenticatedUserToPrisma();
  } catch (error) {
    logRouteError("POST /api/auth/sync-user", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user: session.user });
}
