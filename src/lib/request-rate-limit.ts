type Bucket = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Bucket>();

function now() {
  return Date.now();
}

export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true } | { ok: false; retryAfterSec: number } {
  const ts = now();
  const current = store.get(input.key);
  if (!current || ts >= current.resetAt) {
    store.set(input.key, { count: 1, resetAt: ts + input.windowMs });
    return { ok: true };
  }
  if (current.count >= input.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - ts) / 1000));
    return { ok: false, retryAfterSec };
  }
  current.count += 1;
  store.set(input.key, current);
  return { ok: true };
}

