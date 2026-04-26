import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable } from "@/lib/api-error";
import { isStaff } from "@/lib/auth-roles";
import { checkRateLimit } from "@/lib/request-rate-limit";
import { supportTicket } from "@/lib/prisma-delegates";
import { logRouteError } from "@/lib/server-log";
import { isLiveSupportOpen, liveSupportScheduleLabel, SUPPORT_EMAIL } from "@/lib/support-hours";
import {
  appendSupportMessage,
  assertTicketAccess,
  createActiveSupportTicket,
  getActiveSupportTicket,
  listSupportMessages,
  normalizeSupportBody,
} from "@/lib/support-chat";

const supportMessagePayloadSchema = z.object({
  ticketId: z.string().trim().optional().nullable(),
  body: z.string(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId")?.trim();
    if (!ticketId) {
      return NextResponse.json({ ok: false, error: "missing_ticket" }, { status: 400 });
    }
    const staff = isStaff(session.user.role);

    const access = await assertTicketAccess(ticketId, session.user.id, staff);
    if (!access.ok) {
      return NextResponse.json({ ok: false, error: access.error }, { status: access.error === "not_found" ? 404 : 403 });
    }
    const messages = await listSupportMessages(ticketId);
    return NextResponse.json({ messages });
  } catch (e) {
    logRouteError("GET /api/support/messages", e);
    return jsonServiceUnavailable("Support messages are temporarily unavailable.", ApiErrorCode.DATABASE);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }
    const parsed = supportMessagePayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    const ticketIdRaw = String(parsed.data.ticketId ?? "").trim();
    const text = parsed.data.body;
    const norm = normalizeSupportBody(text);
    if (!norm.ok) {
      return NextResponse.json({ ok: false, error: norm.error }, { status: 400 });
    }

    const staff = isStaff(session.user.role);
    const rl = checkRateLimit({
      key: `support_msg:${session.user.id}:${staff ? "staff" : "user"}`,
      limit: staff ? 60 : 20,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "rate_limited", message: `Prea multe mesaje. Reîncearcă în ${rl.retryAfterSec}s.` },
        { status: 429 },
      );
    }
    let ticketId = ticketIdRaw;

    if (!ticketId) {
      if (staff) {
        return NextResponse.json({ ok: false, error: "missing_ticket" }, { status: 400 });
      }
      if (!isLiveSupportOpen()) {
        return NextResponse.json(
          {
            ok: false,
            error: "outside_schedule",
            message: `Live chat este disponibil în programul ${liveSupportScheduleLabel()}. Ne poți scrie la ${SUPPORT_EMAIL}.`,
          },
          { status: 403 },
        );
      }
      const active = await getActiveSupportTicket(session.user.id);
      if (active) {
        ticketId = active.id;
      } else {
        const created = await createActiveSupportTicket(session.user.id);
        ticketId = created.id;
      }
    }

    const access = await assertTicketAccess(ticketId, session.user.id, staff);
    if (!access.ok) {
      return NextResponse.json({ ok: false, error: access.error }, { status: access.error === "not_found" ? 404 : 403 });
    }

    const full = await supportTicket.findUnique({
      where: { id: ticketId },
      select: { status: true, userId: true },
    });
    if (full?.status === "CLOSED" && !staff) {
      return NextResponse.json({ ok: false, error: "ticket_closed" }, { status: 400 });
    }

    const senderRole = staff ? "ADMIN" : "USER";
    if (!staff && full?.userId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    if (!staff && !isLiveSupportOpen()) {
      return NextResponse.json(
        {
          ok: false,
          error: "outside_schedule",
          message: `Live chat este disponibil în programul ${liveSupportScheduleLabel()}. Ne poți scrie la ${SUPPORT_EMAIL}.`,
        },
        { status: 403 },
      );
    }

    await appendSupportMessage({
      ticketId,
      senderId: session.user.id,
      senderRole,
      body: norm.body,
    });

    const messages = await listSupportMessages(ticketId);
    return NextResponse.json({ ok: true, ticketId, messages });
  } catch (e) {
    logRouteError("POST /api/support/messages", e);
    return jsonServiceUnavailable("Support messages are temporarily unavailable.", ApiErrorCode.DATABASE);
  }
}
