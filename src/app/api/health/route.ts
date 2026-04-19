import { NextResponse } from "next/server";

/**
 * Health check pentru uptime (Render, Better Stack, Pingdom, etc.).
 * Nu depinde de DB — răspunde dacă procesul Node trăiește.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      status: "healthy",
      service: "vex-web",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}

export const dynamic = "force-dynamic";
