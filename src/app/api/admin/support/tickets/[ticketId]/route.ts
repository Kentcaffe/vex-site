import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isStaff } from "@/lib/auth-roles";
import { supportTicket } from "@/lib/prisma-delegates";
import { setTicketStatus } from "@/lib/support-chat";
import { isSupportTicketStatus } from "@/lib/support-enums";

type Props = { params: Promise<{ ticketId: string }> };

export async function PATCH(req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { ticketId } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const status =
    typeof body === "object" && body && "status" in body
      ? String((body as { status?: unknown }).status ?? "").trim()
      : "";
  if (!isSupportTicketStatus(status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }
  const ticket = await supportTicket.findUnique({ where: { id: ticketId }, select: { id: true } });
  if (!ticket) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  await setTicketStatus(ticketId, status);
  return NextResponse.json({ ok: true });
}
