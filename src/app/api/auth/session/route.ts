import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("[auth] session read failed:", error);
  }
  return NextResponse.json({
    authenticated: Boolean(session?.user?.id),
    session,
  });
}
