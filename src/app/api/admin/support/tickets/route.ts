import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable } from "@/lib/api-error";
import { isStaff } from "@/lib/auth-roles";
import { supportTicket } from "@/lib/prisma-delegates";
import { logRouteError } from "@/lib/server-log";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || !isStaff(session.user.role)) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const tickets = await supportTicket.findMany({
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      take: 150,
      include: {
        user: {
          select: { email: true, name: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { body: true, createdAt: true, senderRole: true },
        },
      },
    });
    type TicketApiRow = (typeof tickets)[number];
    return NextResponse.json({
      tickets: tickets.map((t: TicketApiRow) => ({
        id: t.id,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        lastMessageAt: t.lastMessageAt?.toISOString() ?? null,
        user: { email: t.user.email, name: t.user.name },
        lastPreview: t.messages[0]?.body?.slice(0, 140) ?? null,
      })),
    });
  } catch (e) {
    logRouteError("GET /api/admin/support/tickets", e);
    return jsonServiceUnavailable("Support tickets are temporarily unavailable.", ApiErrorCode.DATABASE);
  }
}
