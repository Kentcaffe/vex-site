/**
 * Mentenanță controlată din env (Render / Docker).
 * Setează MAINTENANCE_MODE=true pentru redirect global la /maintenance
 * (exceptând cookie-ul de bypass setat prin POST /api/beta-access).
 *
 * Folosește Web Crypto API (compatibil Edge middleware + Node API routes).
 */
const BYPASS_PEPPER = "vex:maintenance:bypass:v1";

export function isMaintenanceMode(): boolean {
  const v = process.env.MAINTENANCE_MODE?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/** Chunk-uri Next, imagini optimizate, public/ — fără redirect la mentenanță. */
export function isMiddlewareStaticBypass(pathname: string): boolean {
  if (pathname.startsWith("/_next")) {
    return true;
  }
  if (pathname === "/favicon.ico") {
    return true;
  }
  const base = pathname.split("/").pop() ?? "";
  return base.includes(".") && !pathname.startsWith("/api/");
}

/** Nume cookie HTTP-only pentru bypass mentenanță (valoare derivată pe server, nu parola). */
export const MAINTENANCE_BYPASS_COOKIE = "vex_maint_bypass_v1";

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let x = 0;
  for (let i = 0; i < a.length; i++) {
    x |= a[i]! ^ b[i]!;
  }
  return x === 0;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]!);
  }
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array | null {
  try {
    let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) {
      b64 += "=";
    }
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      out[i] = bin.charCodeAt(i);
    }
    return out;
  } catch {
    return null;
  }
}

/** HMAC-SHA256(password, pepper) ca base64url — același algoritm ca în API la setarea cookie-ului. */
export async function computeMaintenanceBypassToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(BYPASS_PEPPER));
  return bytesToBase64Url(new Uint8Array(sig));
}

export async function getExpectedMaintenanceBypassToken(): Promise<string | null> {
  const p = process.env.BETA_PASSWORD?.trim();
  if (!p) {
    return null;
  }
  return computeMaintenanceBypassToken(p);
}

export async function isValidMaintenanceBypassCookie(value: string | undefined | null): Promise<boolean> {
  const expected = await getExpectedMaintenanceBypassToken();
  if (!expected || value == null || value === "") {
    return false;
  }
  const expBytes = base64UrlToBytes(expected);
  const gotBytes = base64UrlToBytes(value);
  if (!expBytes || !gotBytes) {
    return false;
  }
  return timingSafeEqualBytes(expBytes, gotBytes);
}

export function isBetaAccessApiPath(pathname: string): boolean {
  return pathname === "/api/beta-access" || pathname.startsWith("/api/beta-access/");
}
