import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

/** Client cu service role — doar pe server (upload / citire Storage când lipsește fișierul local). */
export function getSupabaseServiceClient(): SupabaseClient | null {
  if (cached !== undefined) {
    return cached;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    cached = null;
    return null;
  }
  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}

export function listingsStorageBucket(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "listings";
}

/** Cale obiect în bucket (aliniat la `resolvePublicMediaUrl` pentru `/uploads/listings/:file`). */
export function listingsObjectKey(filename: string): string {
  return `listings/${filename}`;
}
