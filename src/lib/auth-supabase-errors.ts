import type { AuthError } from "@supabase/supabase-js";

/** Keys under `Auth` in messages/*.json */
export type LoginErrorMessageKey =
  | "loginInvalid"
  | "loginEmailNotConfirmed"
  | "loginRateLimited";

export function loginErrorMessageKey(error: AuthError): LoginErrorMessageKey {
  const msg = (error.message ?? "").toLowerCase();
  const code = String((error as { code?: string }).code ?? "").toLowerCase();
  const status = (error as { status?: number }).status;

  if (
    code === "email_not_confirmed" ||
    msg.includes("email not confirmed") ||
    msg.includes("confirm your email")
  ) {
    return "loginEmailNotConfirmed";
  }

  if (status === 429 || msg.includes("too many requests") || code === "over_request_rate_limit") {
    return "loginRateLimited";
  }

  return "loginInvalid";
}
