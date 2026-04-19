import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrCreateActiveSupportTicket } from "@/lib/support-chat";
import { serializeSupportDbError, supportApiDebugEnabled } from "@/lib/support-db-log";

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
    const body: Record<string, unknown> = { error: "service_unavailable" };
    if (supportApiDebugEnabled()) {
      body.debug = serializeSupportDbError(e);
    }
    return NextResponse.json(body, { status: 503 });
  }
}
