/** Aliniat la `schema.prisma` — folosit unde vrem tipuri stabile fără a depinde de regenerarea clientului. */
export const SUPPORT_TICKET_STATUSES = ["OPEN", "RESOLVED", "CLOSED"] as const;
export type SupportTicketStatus = (typeof SUPPORT_TICKET_STATUSES)[number];

export const SUPPORT_MESSAGE_SENDER_ROLES = ["USER", "ADMIN"] as const;
export type SupportMessageSenderRole = (typeof SUPPORT_MESSAGE_SENDER_ROLES)[number];

export function isSupportTicketStatus(s: string): s is SupportTicketStatus {
  return (SUPPORT_TICKET_STATUSES as readonly string[]).includes(s);
}
