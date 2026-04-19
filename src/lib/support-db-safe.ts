import { supportTicket } from "@/lib/prisma-delegates";

/** Evită crash-ul paginilor admin dacă migrarea `support_*` nu e aplicată în producție. */
export async function countOpenSupportTicketsSafe(): Promise<number> {
  try {
    return await supportTicket.count({
      where: { status: { in: ["OPEN", "PENDING"] } },
    });
  } catch (e) {
    console.error("[countOpenSupportTicketsSafe]", e);
    return 0;
  }
}
