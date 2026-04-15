import { NextResponse } from "next/server";
import { syncAuthenticatedUserToPrisma } from "@/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/cont?error=missing_code", baseUrl));
  }

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    console.error("[auth] Supabase callback misconfigured:", error);
    return NextResponse.redirect(new URL("/cont?error=supabase_env_missing", baseUrl));
  }
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth] OAuth callback exchange failed:", error.message);
    return NextResponse.redirect(new URL("/cont?error=oauth_callback", baseUrl));
  }

  await syncAuthenticatedUserToPrisma();
  return NextResponse.redirect(new URL(next, baseUrl));
}
