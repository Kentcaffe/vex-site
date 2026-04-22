import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable } from "@/lib/api-error";
import { supportTicket } from "@/lib/prisma-delegates";
import { logRouteError } from "@/lib/server-log";

export async function POST(req: Request) {
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

  const ticketId =
    typeof body === "object" && body && "ticketId" in body
      ? String((body as { ticketId?: unknown }).ticketId ?? "").trim()
      : "";
  const ratingRaw =
    typeof body === "object" && body && "rating" in body
      ? Number((body as { rating?: unknown }).rating)
      : NaN;
  const satisfied =
    typeof body === "object" && body && "satisfied" in body
      ? (body as { satisfied?: unknown }).satisfied
      : undefined;

  if (!ticketId) {
    return NextResponse.json({ ok: false, error: "missing_ticket" }, { status: 400 });
  }
  if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return NextResponse.json({ ok: false, error: "invalid_rating" }, { status: 400 });
  }
  if (typeof satisfied !== "boolean") {
    return NextResponse.json({ ok: false, error: "invalid_satisfied" }, { status: 400 });
  }

  try {
    const ticket = await supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true },
    });
    if (!ticket) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    if (ticket.userId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    await supportTicket.update({
      where: { id: ticketId },
      data: {
        feedbackRating: ratingRaw,
        feedbackSatisfied: satisfied,
        feedbackAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logRouteError("POST /api/support/feedback", err);
    return jsonServiceUnavailable("Support feedback is temporarily unavailable.", ApiErrorCode.DATABASE);
  }
}
