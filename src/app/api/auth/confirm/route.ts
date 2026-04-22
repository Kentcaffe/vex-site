import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { syncAuthenticatedUserToPrisma } from "@/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logRouteError } from "@/lib/server-log";

function safeNextPath(next: string | null): string {
  if (!next) {
    return "/";
  }
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/";
  }
  return trimmed;
}

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value === "signup" || value === "invite" || value === "magiclink" || value === "recovery" || value === "email_change";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const typeRaw = url.searchParams.get("type");
  const next = safeNextPath(url.searchParams.get("next"));
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!tokenHash || !isEmailOtpType(typeRaw)) {
    return NextResponse.redirect(new URL("/cont?error=missing_confirmation_token", baseUrl));
  }

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    logRouteError("GET /api/auth/confirm createSupabaseServerClient", error);
    return NextResponse.redirect(new URL("/cont?error=supabase_env_missing", baseUrl));
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: typeRaw,
  });
  if (error) {
    logRouteError("GET /api/auth/confirm verifyOtp", error);
    return NextResponse.redirect(new URL("/cont?error=confirm_verify_failed", baseUrl));
  }

  if (typeRaw !== "recovery") {
    try {
      await syncAuthenticatedUserToPrisma();
    } catch (error) {
      logRouteError("GET /api/auth/confirm syncAuthenticatedUserToPrisma", error);
    }
  }

  return NextResponse.redirect(new URL(next, baseUrl));
}
