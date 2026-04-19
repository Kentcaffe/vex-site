import { prisma } from "@/lib/prisma";
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
  const existing = await prisma.supportTicket.findFirst({
    where: {
      userId,
      status: { in: ["OPEN", "PENDING"] },
    },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return existing;
  return prisma.supportTicket.create({
    data: { userId, status: "OPEN" },
  });
}

export async function assertTicketAccess(ticketId: string, userId: string, isStaff: boolean) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { id: true, userId: true, status: true, createdAt: true, lastMessageAt: true },
  });
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
  const rows = await prisma.supportMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { name: true, email: true } },
    },
  });
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
  const msg = await prisma.$transaction(async (tx) => {
    const created = await tx.supportMessage.create({
      data: {
        ticketId: params.ticketId,
        senderId: params.senderId,
        senderRole: params.senderRole,
        body: params.body,
      },
    });
    await tx.supportTicket.update({
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
}

export async function setTicketStatus(ticketId: string, status: SupportTicketStatus) {
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });
}
