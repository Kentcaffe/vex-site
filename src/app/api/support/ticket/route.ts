import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable } from "@/lib/api-error";
import { getOrCreateActiveSupportTicket } from "@/lib/support-chat";
import { logRouteError } from "@/lib/server-log";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    const ticket = await getOrCreateActiveSupportTicket(session.user.id);
    return NextResponse.json({
      ticket: {
        id: ticket.id,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString(),
        lastMessageAt: ticket.lastMessageAt?.toISOString() ?? null,
        feedbackAt: ticket.feedbackAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    logRouteError("GET /api/support/ticket", err);
    return jsonServiceUnavailable("Support service is temporarily unavailable.", ApiErrorCode.DATABASE);
  }
}
