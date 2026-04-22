/**
 * Destinație pentru `emailRedirectTo` la signUp / resend confirmare.
 * Redirect fix, fără query params: https://vex.md/confirm
 */
export function getEmailConfirmationRedirectUrl(_nextPath?: string): string {
  void _nextPath;
  const baseRaw =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin)
      : (process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://vex.md");
  const base = baseRaw.replace(/\/$/, "");
  return `${base}/confirm`;
}
