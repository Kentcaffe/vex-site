import { NextResponse } from "next/server";

/**
 * Link din emailul de confirmare Supabase: `…/confirm?code=…&next=…`
 * → delegă la `/api/auth/callback` (exchangeCodeForSession).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/cont?error=missing_code", baseUrl));
  }

  const dest = new URL("/api/auth/callback", baseUrl);
  dest.searchParams.set("code", code);
  dest.searchParams.set("next", next);
  return NextResponse.redirect(dest);
}
