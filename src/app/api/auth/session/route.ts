import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logRouteError } from "@/lib/server-log";

export async function GET() {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    logRouteError("GET /api/auth/session", error);
  }
  return NextResponse.json({
    authenticated: Boolean(session?.user?.id),
    session,
  });
}
