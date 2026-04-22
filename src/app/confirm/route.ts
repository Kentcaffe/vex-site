import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logRouteError } from "@/lib/server-log";

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value === "signup" || value === "invite" || value === "magiclink" || value === "recovery" || value === "email_change";
}

/**
 * Confirmă email-ul Supabase și creează sesiune.
 * Suportă atât `code` (PKCE), cât și `token_hash + type`.
 * Redirect final: homepage.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const typeRaw = url.searchParams.get("type");
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const successDestination = new URL("/", baseUrl);
  const errorDestination = new URL("/cont", baseUrl);

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    logRouteError("GET /confirm createSupabaseServerClient", error);
    errorDestination.searchParams.set("error", "supabase_env_missing");
    return NextResponse.redirect(errorDestination);
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.info("[confirm] exchangeCodeForSession response", { data, error });
    if (error) {
      logRouteError("GET /confirm exchangeCodeForSession", error);
      errorDestination.searchParams.set("error", "confirm_exchange_failed");
      return NextResponse.redirect(errorDestination);
    }
    return NextResponse.redirect(successDestination);
  }

  if (tokenHash && isEmailOtpType(typeRaw)) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typeRaw,
    });
    console.info("[confirm] verifyOtp response", { data, error, type: typeRaw });
    if (error) {
      logRouteError("GET /confirm verifyOtp", error);
      errorDestination.searchParams.set("error", "confirm_verify_failed");
      return NextResponse.redirect(errorDestination);
    }
    return NextResponse.redirect(successDestination);
  }

  errorDestination.searchParams.set("error", "missing_confirmation_token");
  return NextResponse.redirect(errorDestination);
}
