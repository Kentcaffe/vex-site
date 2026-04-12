import { createHmac, timingSafeEqual } from "node:crypto";

type Payload = { userId: string; exp: number };

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    throw new Error("AUTH_SECRET is required for chat socket tokens");
  }
  return s;
}

export function signSocketToken(userId: string, ttlMs = 60 * 60 * 1000): string {
  const payload: Payload = { userId, exp: Date.now() + ttlMs };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifySocketToken(token: string): { userId: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      return null;
    }
    const [payloadB64, sig] = parts;
    const expected = createHmac("sha256", secret()).update(payloadB64).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as Payload;
    if (typeof payload.userId !== "string" || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp < Date.now()) {
      return null;
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
