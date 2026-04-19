import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isStaff } from "@/lib/auth-roles";
import { supportTicket } from "@/lib/prisma-delegates";
import {
  appendSupportMessage,
  assertTicketAccess,
  listSupportMessages,
  normalizeSupportBody,
} from "@/lib/support-chat";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const ticketId = searchParams.get("ticketId")?.trim();
  if (!ticketId) {
    return NextResponse.json({ error: "missing_ticket" }, { status: 400 });
  }
  const staff = isStaff(session.user.role);
  try {
    const access = await assertTicketAccess(ticketId, session.user.id, staff);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.error === "not_found" ? 404 : 403 });
    }
    const messages = await listSupportMessages(ticketId);
    return NextResponse.json({ messages });
  } catch (e) {
    console.error("[GET /api/support/messages]", e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "service_unavailable", message }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const ticketId = typeof body === "object" && body && "ticketId" in body ? String((body as { ticketId?: unknown }).ticketId ?? "").trim() : "";
  const text = typeof body === "object" && body && "body" in body ? String((body as { body?: unknown }).body ?? "") : "";
  if (!ticketId) {
    return NextResponse.json({ error: "missing_ticket" }, { status: 400 });
  }
  const norm = normalizeSupportBody(text);
  if (!norm.ok) {
    return NextResponse.json({ error: norm.error }, { status: 400 });
  }

  const staff = isStaff(session.user.role);
  try {
    const access = await assertTicketAccess(ticketId, session.user.id, staff);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.error === "not_found" ? 404 : 403 });
    }

    const full = await supportTicket.findUnique({
      where: { id: ticketId },
      select: { status: true, userId: true },
    });
    if (full?.status === "CLOSED" && !staff) {
      return NextResponse.json({ error: "ticket_closed" }, { status: 400 });
    }

    const senderRole = staff ? "ADMIN" : "USER";
    if (!staff && full?.userId !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    await appendSupportMessage({
      ticketId,
      senderId: session.user.id,
      senderRole,
      body: norm.body,
    });

    const messages = await listSupportMessages(ticketId);
    return NextResponse.json({ ok: true, messages });
  } catch (e) {
    console.error("[POST /api/support/messages]", e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "service_unavailable", message }, { status: 503 });
  }
}
