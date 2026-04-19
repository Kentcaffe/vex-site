import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrCreateActiveSupportTicket } from "@/lib/support-chat";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const ticket = await getOrCreateActiveSupportTicket(session.user.id);
    return NextResponse.json({
      ticket: {
        id: ticket.id,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString(),
        lastMessageAt: ticket.lastMessageAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error("[GET /api/support/ticket]", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "service_unavailable", message }, { status: 503 });
  }
}
