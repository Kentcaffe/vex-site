import { prisma } from "@/lib/prisma";
import { supportMessage, supportTicket } from "@/lib/prisma-delegates";
import { logSupportDbFailure } from "@/lib/support-db-log";
import type { SupportMessageSenderRole, SupportTicketStatus } from "@/lib/support-enums";

const BODY_MAX = 6000;

export function normalizeSupportBody(raw: string): { ok: true; body: string } | { ok: false; error: string } {
  const body = raw.trim();
  if (!body) return { ok: false, error: "empty" };
  if (body.length > BODY_MAX) return { ok: false, error: "too_long" };
  return { ok: true, body };
}

/** Un singur fir activ (deschis sau în așteptare) per utilizator. */
export async function getOrCreateActiveSupportTicket(userId: string) {
  try {
    const existing = await supportTicket.findFirst({
      where: {
        userId,
        status: { in: ["OPEN", "PENDING"] },
      },
      orderBy: { updatedAt: "desc" },
    });
    if (existing) return existing;
    return await supportTicket.create({
      data: { userId, status: "OPEN" },
    });
  } catch (e) {
    logSupportDbFailure("getOrCreateActiveSupportTicket (SupportTicket findFirst | create)", e);
    throw e;
  }
}

export async function assertTicketAccess(ticketId: string, userId: string, isStaff: boolean) {
  let ticket;
  try {
    ticket = await supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true, status: true, createdAt: true, lastMessageAt: true },
    });
  } catch (e) {
    logSupportDbFailure("SupportTicket.findUnique (assertTicketAccess)", e);
    throw e;
  }
  if (!ticket) return { ok: false as const, error: "not_found" as const };
  if (!isStaff && ticket.userId !== userId) return { ok: false as const, error: "forbidden" as const };
  return { ok: true as const, ticket };
}

export type SupportMessageDTO = {
  id: string;
  ticketId: string;
  body: string;
  createdAt: string;
  senderRole: SupportMessageSenderRole;
  senderName: string | null;
};

export async function listSupportMessages(ticketId: string): Promise<SupportMessageDTO[]> {
  let rows;
  try {
    rows = await supportMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { name: true, email: true } },
      },
    });
  } catch (e) {
    logSupportDbFailure("SupportMessage.findMany", e);
    throw e;
  }
  return rows.map((m: (typeof rows)[number]) => ({
    id: m.id,
    ticketId: m.ticketId,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    senderRole: m.senderRole,
    senderName: m.senderRole === "STAFF" ? m.sender.name ?? m.sender.email : m.sender.name,
  }));
}

export async function appendSupportMessage(params: {
  ticketId: string;
  senderId: string;
  senderRole: SupportMessageSenderRole;
  body: string;
}) {
  try {
    const msg = await prisma.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- delegate-urile pe `tx` lipsesc din unele cache-uri TS (vezi prisma-delegates).
      const t = tx as any;
      const created = await t.supportMessage.create({
        data: {
          ticketId: params.ticketId,
          senderId: params.senderId,
          senderRole: params.senderRole,
          body: params.body,
        },
      });
      await t.supportTicket.update({
        where: { id: params.ticketId },
        data: {
          lastMessageAt: new Date(),
          updatedAt: new Date(),
          status:
            params.senderRole === "USER"
              ? ("PENDING" as SupportTicketStatus)
              : ("OPEN" as SupportTicketStatus),
        },
      });
      return created;
    });
    return msg;
  } catch (e) {
    logSupportDbFailure("appendSupportMessage ($transaction)", e);
    throw e;
  }
}

export async function setTicketStatus(ticketId: string, status: SupportTicketStatus) {
  await supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });
}
