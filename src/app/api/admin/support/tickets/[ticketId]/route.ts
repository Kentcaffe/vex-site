import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable, safeApiRoute } from "@/lib/api-error";
import { isStaff } from "@/lib/auth-roles";
import { supportTicket } from "@/lib/prisma-delegates";
import { setTicketStatus } from "@/lib/support-chat";
import { isSupportTicketStatus } from "@/lib/support-enums";

type Props = { params: Promise<{ ticketId: string }> };

export const PATCH = safeApiRoute("PATCH /api/admin/support/tickets/[ticketId]", async ({ request }, context) => {
  const { params } = context as Props;
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { ticketId } = await params;
  if (!ticketId.trim()) {
    return NextResponse.json({ ok: false, error: "invalid_ticket_id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const status =
    typeof body === "object" && body && "status" in body
      ? String((body as { status?: unknown }).status ?? "").trim()
      : "";
  if (!isSupportTicketStatus(status)) {
    return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
  }

  try {
    const ticket = await supportTicket.findUnique({ where: { id: ticketId }, select: { id: true } });
    if (!ticket) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    await setTicketStatus(ticketId, status);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonServiceUnavailable("Support tickets are temporarily unavailable.", ApiErrorCode.DATABASE);
  }
});
