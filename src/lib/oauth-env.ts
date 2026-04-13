/**
 * OAuth availability must be read at request time — not at static build time when env may be empty.
 * Use these helpers in Server Components instead of inlining process.env in static pages.
 */
export function isGoogleOAuthConfigured(): boolean {
  const id = process.env.AUTH_GOOGLE_ID?.trim();
  const secret = process.env.AUTH_GOOGLE_SECRET?.trim();
  return Boolean(id && secret);
}

export function isFacebookOAuthConfigured(): boolean {
  const id = process.env.AUTH_FACEBOOK_ID?.trim();
  const secret = process.env.AUTH_FACEBOOK_SECRET?.trim();
  return Boolean(id && secret);
}

export function getOAuthAvailability(): { google: boolean; facebook: boolean } {
  return {
    google: isGoogleOAuthConfigured(),
    facebook: isFacebookOAuthConfigured(),
  };
}
