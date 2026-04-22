import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MISSING_PUBLIC_ENV_MESSAGE =
  "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Supabase features are unavailable.";

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[supabase] ${MISSING_PUBLIC_ENV_MESSAGE}`);
  }
}

export function hasSupabasePublicEnv(): boolean {
  return Boolean(supabaseUrl?.trim() && supabaseAnonKey?.trim());
}

export function createSupabaseBrowserClient() {
  if (!hasSupabasePublicEnv()) {
    throw new Error(MISSING_PUBLIC_ENV_MESSAGE);
  }
  return createBrowserClient(
    supabaseUrl as string,
    supabaseAnonKey as string,
  );
}

export function tryCreateSupabaseBrowserClient() {
  try {
    return createSupabaseBrowserClient();
  } catch (error) {
    console.error("[supabase] createSupabaseBrowserClient failed", error);
    return null;
  }
}
