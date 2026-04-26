type PresenceEntry = {
  sid: string;
  userId: string | null;
  lastSeenAt: number;
};

type PresenceStore = {
  entries: Map<string, PresenceEntry>;
  history: Array<{ at: number; total: number; authenticated: number; guests: number }>;
};

const PRESENCE_TTL_MS = 90_000;

function getStore(): PresenceStore {
  const g = globalThis as typeof globalThis & { __vexPresenceStore?: PresenceStore };
  if (!g.__vexPresenceStore) {
    g.__vexPresenceStore = { entries: new Map<string, PresenceEntry>(), history: [] };
  }
  return g.__vexPresenceStore;
}

function prune(now = Date.now()): void {
  const store = getStore();
  for (const [sid, row] of store.entries) {
    if (now - row.lastSeenAt > PRESENCE_TTL_MS) {
      store.entries.delete(sid);
    }
  }
}

export function touchPresence(sid: string, userId: string | null): void {
  const trimmed = sid.trim();
  if (!trimmed) {
    return;
  }
  const now = Date.now();
  prune(now);
  getStore().entries.set(trimmed, { sid: trimmed, userId, lastSeenAt: now });
  pushPresenceSnapshot(now);
}

function pushPresenceSnapshot(now = Date.now()): void {
  const store = getStore();
  const stats = getPresenceStats();
  const last = store.history[store.history.length - 1];
  if (last && now - last.at < 5_000) {
    store.history[store.history.length - 1] = {
      at: now,
      total: stats.total,
      authenticated: stats.authenticated,
      guests: stats.guests,
    };
    return;
  }
  store.history.push({
    at: now,
    total: stats.total,
    authenticated: stats.authenticated,
    guests: stats.guests,
  });
  const cutoff = now - 30 * 60_000;
  store.history = store.history.filter((h) => h.at >= cutoff);
}

export function getPresenceStats(): {
  total: number;
  authenticated: number;
  guests: number;
  heartbeatTtlMs: number;
} {
  prune();
  let authenticated = 0;
  for (const row of getStore().entries.values()) {
    if (row.userId) authenticated += 1;
  }
  const total = getStore().entries.size;
  return {
    total,
    authenticated,
    guests: Math.max(0, total - authenticated),
    heartbeatTtlMs: PRESENCE_TTL_MS,
  };
}

export function getPresenceHistory(minutes = 10): Array<{
  at: number;
  total: number;
  authenticated: number;
  guests: number;
}> {
  prune();
  const now = Date.now();
  const cutoff = now - Math.max(1, minutes) * 60_000;
  return getStore().history.filter((h) => h.at >= cutoff);
}

