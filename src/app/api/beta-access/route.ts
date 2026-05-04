import { NextResponse } from "next/server";
import { z } from "zod";
import {
  computeMaintenanceBypassToken,
  getExpectedMaintenanceBypassToken,
  isMaintenanceMode,
  MAINTENANCE_BYPASS_COOKIE,
} from "@/lib/maintenance";
import { checkRateLimit } from "@/lib/request-rate-limit";

const bodySchema = z.object({
  password: z.string(),
});

function cookieSecureFlag(): boolean {
  if (process.env.BETA_COOKIE_SECURE === "false") {
    return false;
  }
  return process.env.NODE_ENV === "production";
}

export async function POST(req: Request) {
  if (!isMaintenanceMode()) {
    return NextResponse.json({ ok: false, error: "maintenance_inactive" }, { status: 400 });
  }

  const expected = await getExpectedMaintenanceBypassToken();
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "server_misconfigured", message: "BETA_PASSWORD is not set on the server." },
      { status: 503 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown";

  const rl = checkRateLimit({
    key: `beta_access:${ip}`,
    limit: 12,
    windowMs: 15 * 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", retryAfterSec: rl.retryAfterSec },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const password = parsed.data.password.trim();
  const serverPassword = process.env.BETA_PASSWORD?.trim() ?? "";
  if (!password || !serverPassword) {
    return NextResponse.json({ ok: false, error: "wrong_password" }, { status: 401 });
  }

  const submittedToken = await computeMaintenanceBypassToken(password);
  if (submittedToken !== expected) {
    return NextResponse.json({ ok: false, error: "wrong_password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(MAINTENANCE_BYPASS_COOKIE, expected, {
    httpOnly: true,
    secure: cookieSecureFlag(),
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
