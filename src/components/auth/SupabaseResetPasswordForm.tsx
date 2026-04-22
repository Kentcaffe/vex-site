"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { tryCreateSupabaseBrowserClient } from "@/lib/supabase";

type Phase = "loading" | "ready" | "noSession" | "success";

/**
 * Reset parolă după link din email Supabase: sesiunea e deja setată de `/api/auth/callback` (exchange code).
 */
export function SupabaseResetPasswordForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const supabase = tryCreateSupabaseBrowserClient();
    if (!supabase) {
      const t = window.setTimeout(() => {
        setPhase("noSession");
      }, 0);
      return () => window.clearTimeout(t);
    }
    let cancelled = false;
    const currentHref = window.location.href;
    const parsedUrl = new URL(currentHref);
    const code = parsedUrl.searchParams.get("code");
    const tokenHash = parsedUrl.searchParams.get("token_hash");
    const type = parsedUrl.searchParams.get("type");

    const tryHydrateRecoverySession = async () => {
      // 1) Try full URL exchange first.
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(currentHref);
        console.info("[reset-password] exchangeCodeForSession(fullUrl)", { href: currentHref, data, error });
        if (!error) {
          return true;
        }
      } catch (error) {
        console.error("[reset-password] exchangeCodeForSession(fullUrl) threw", error);
      }

      // 2) Fallback: `code` only.
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        console.info("[reset-password] exchangeCodeForSession(code)", { code, data, error });
        if (!error) {
          return true;
        }
      }

      // 3) Fallback: token hash + recovery type.
      if (tokenHash && type === "recovery") {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        console.info("[reset-password] verifyOtp(recovery)", { tokenHash, data, error });
        if (!error) {
          return true;
        }
      }

      return false;
    };

    void (async () => {
      const hydrated = await tryHydrateRecoverySession();
      if (hydrated && !cancelled) {
        setPhase("ready");
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) {
        setPhase("ready");
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled || !session) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setPhase("ready");
      }
    });

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setPhase((p) => (p === "loading" ? "noSession" : p));
    }, 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    const p = password.trim();
    const c = confirm.trim();
    if (p.length < 8 || c.length < 8) {
      setSubmitError(t("validationError"));
      return;
    }
    if (p !== c) {
      setSubmitError(t("resetMismatch"));
      return;
    }
    setPending(true);
    const supabase = tryCreateSupabaseBrowserClient();
    if (!supabase) {
      setPending(false);
      setSubmitError(t("resetUpdateFailed"));
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: p });
    setPending(false);
    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[SupabaseResetPasswordForm] updateUser:", error.message);
      }
      setSubmitError(t("resetUpdateFailed"));
      return;
    }
    setPhase("success");
    await supabase.auth.signOut();
    router.refresh();
  }

  if (phase === "loading") {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400" role="status">
        {t("resetSessionLoading")}
      </p>
    );
  }

  if (phase === "noSession") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{t("resetNoRecoverySession")}</p>
        <p className="text-center text-sm">
          <Link href="/cont/forgot-password" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            {t("forgotTitle")}
          </Link>
        </p>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {t("resetPasswordSuccess")}
        </p>
        <p className="text-center text-sm">
          <Link href="/cont" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="supa-new-password">
          {t("passwordMin")}
        </label>
        <input
          id="supa-new-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="supa-confirm-password">
          {t("resetConfirmPassword")}
        </label>
        <input
          id="supa-confirm-password"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>
      {submitError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {submitError}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? t("resetSaving") : t("resetPasswordSubmit")}
      </button>
      <p className="text-center text-sm">
        <Link href="/cont" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
