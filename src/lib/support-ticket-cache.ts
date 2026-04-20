export type CachedSupportTicket = {
  id: string;
  feedbackAt: string | null;
};

const TTL_MS = 120_000;

type Entry = { ticket: CachedSupportTicket; fetchedAt: number };

let entry: Entry | null = null;
let inflight: Promise<Entry | null> | null = null;

export function getCachedSupportTicket(): CachedSupportTicket | null {
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.fetchedAt > TTL_MS) {
    entry = null;
    return null;
  }
  return entry.ticket;
}

export function setSupportTicketCache(ticket: CachedSupportTicket): void {
  entry = { ticket, fetchedAt: Date.now() };
}

export function invalidateSupportTicketCache(): void {
  entry = null;
  inflight = null;
}

/** Prefetch în fundal — deschidere modal instant dacă răspunsul e deja în cache. */
export function prefetchSupportTicket(): Promise<CachedSupportTicket | null> {
  if (inflight) {
    return inflight.then((e) => e?.ticket ?? null);
  }
  inflight = (async (): Promise<Entry | null> => {
    try {
      const res = await fetch("/api/support/ticket", { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as {
        ticket?: { id: string; feedbackAt?: string | null };
      };
      if (!res.ok || !data.ticket?.id) {
        return null;
      }
      const ticket: CachedSupportTicket = {
        id: data.ticket.id,
        feedbackAt: data.ticket.feedbackAt ?? null,
      };
      setSupportTicketCache(ticket);
      return { ticket, fetchedAt: Date.now() };
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();
  return inflight.then((e) => e?.ticket ?? null);
}
