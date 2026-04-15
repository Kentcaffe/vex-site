/**
 * OAuth availability must be read at request time — not at static build time when env may be empty.
 * Use these helpers in Server Components instead of inlining process.env in static pages.
 */
export function isGoogleOAuthConfigured(): boolean {
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
  const enabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED !== "false";
  return hasSupabase && enabled;
}

export function isFacebookOAuthConfigured(): boolean {
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
  const enabled = process.env.NEXT_PUBLIC_AUTH_FACEBOOK_ENABLED !== "false";
  return hasSupabase && enabled;
}

export function getOAuthAvailability(): { google: boolean; facebook: boolean } {
  return {
    google: isGoogleOAuthConfigured(),
    facebook: isFacebookOAuthConfigured(),
  };
}
