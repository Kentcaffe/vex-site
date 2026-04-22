import { NextResponse } from "next/server";
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/cont?error=missing_code", baseUrl));
  }

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    logRouteError("GET /api/auth/callback createSupabaseServerClient", error);
    return NextResponse.redirect(new URL("/cont?error=supabase_env_missing", baseUrl));
  }
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    logRouteError("GET /api/auth/callback exchangeCodeForSession", error);
    return NextResponse.redirect(new URL("/cont?error=oauth_callback", baseUrl));
  }

  try {
    await syncAuthenticatedUserToPrisma();
  } catch (error) {
    logRouteError("GET /api/auth/callback syncAuthenticatedUserToPrisma", error);
    return NextResponse.redirect(new URL("/cont?error=user_sync_failed", baseUrl));
  }
  return NextResponse.redirect(new URL(next, baseUrl));
}
