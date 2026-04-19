import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** True dacă putem apela Auth pe server (reset parolă, etc.). */
export function isSupabaseAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

/**
 * Client anonim fără cookie-uri — pentru acțiuni server (ex. resetPasswordForEmail).
 * Nu păstrează sesiune; emailul de reset e trimis de Supabase Auth.
 */
export function getSupabaseAnonForAuthActions(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    return null;
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
