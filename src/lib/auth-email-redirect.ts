/**
 * Destinație pentru `emailRedirectTo` la signUp / resend confirmare.
 * Trebuie adăugată în Supabase → Authentication → URL Configuration → Redirect URLs:
 * `https://vex.md/confirm` și `https://vex.md/confirm?next=*` (sau wildcard echivalent).
 *
 * `next` = path după confirmare (ex. `/`, `/en`).
 */
export function getEmailConfirmationRedirectUrl(nextPath: string): string {
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const baseRaw =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin)
      : (process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://vex.md");
  const base = baseRaw.replace(/\/$/, "");
  return `${base}/confirm?next=${encodeURIComponent(next)}`;
}
