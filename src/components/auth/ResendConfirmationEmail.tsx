"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { getEmailConfirmationRedirectUrl } from "@/lib/auth-email-redirect";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const COOLDOWN_SEC = 60;

type Props = {
  email: string;
  /** Path după login (ex. `/` sau `/en`) — la fel ca la signUp */
  callbackPath: string;
};

/**
 * Retrimite emailul de confirmare Supabase, cu cooldown anti-spam.
 */
export function ResendConfirmationEmail({ email, callbackPath }: Props) {
  const t = useTranslations("Auth");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<null | { kind: "ok" | "err"; text: string }>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || loading || cooldown > 0) return;

    setLoading(true);
    setFeedback(null);

    const supabase = createSupabaseBrowserClient();
    const emailRedirectTo = getEmailConfirmationRedirectUrl(callbackPath);

    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email: trimmed,
      options: { emailRedirectTo },
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[auth resend signup]", { data, error, emailRedirectTo });
    }

    setLoading(false);

    if (error) {
      setFeedback({ kind: "err", text: t("resendConfirmError") });
      setCooldown(COOLDOWN_SEC);
      return;
    }
    setFeedback({ kind: "ok", text: t("resendConfirmSuccess") });
    setCooldown(COOLDOWN_SEC);
  }, [email, callbackPath, cooldown, loading, t]);

  const disabled = loading || cooldown > 0;
  const label =
    cooldown > 0 ? t("resendConfirmCooldown", { seconds: cooldown }) : t("resendConfirmButton");

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void handleResend()}
        disabled={disabled}
        aria-busy={loading}
        className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-[14px] font-semibold text-white shadow-md shadow-orange-900/10 transition hover:from-orange-600 hover:to-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 dark:focus-visible:ring-offset-zinc-900"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
            <span>{t("resendConfirmSending")}</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </button>

      {feedback ? (
        <p
          role="status"
          className={`text-center text-[13px] font-medium ${
            feedback.kind === "ok"
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
