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
  } catch (e) {
    console.error("[GET /api/support/ticket]", e);
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
}
