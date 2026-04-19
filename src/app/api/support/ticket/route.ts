import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrCreateActiveSupportTicket } from "@/lib/support-chat";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const ticket = await getOrCreateActiveSupportTicket(session.user.id);
  return NextResponse.json({
    ticket: {
      id: ticket.id,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      lastMessageAt: ticket.lastMessageAt?.toISOString() ?? null,
    },
  });
}
