import type { SupportMessageSenderRole } from "@/lib/support-enums";

/** Corp mesaj SYSTEM: cheie i18n rezolvată în UI (`systemTicketRegistered`). */
export const SUPPORT_SYSTEM_BODY_TICKET_REGISTERED = "SYSTEM_TICKET_REGISTERED" as const;

export type SupportMessageDTO = {
  id: string;
  ticketId: string;
  body: string;
  createdAt: string;
  senderRole: SupportMessageSenderRole;
  senderName: string | null;
};
