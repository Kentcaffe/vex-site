"use client";

import { useCallback, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";
import { tryCreateSupabaseBrowserClient } from "@/lib/supabase";

const MIN_LEN = 8;

type Props = {
  /** Cale fără prefix de limbă — `useRouter` din next-intl o localizează. */
  redirectPath: string;
};

export function ChangePasswordForm({ redirectPath }: Props) {
  const t = useTranslations("ChangePassword");
  const router = useRouter();
  const { refresh } = useAuthSession();
  const supabase = tryCreateSupabaseBrowserClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetFieldErrors = useCallback(() => {
    setError(null);
  }, []);

  const validate = useCallback((): string | null => {
    if (password.length < MIN_LEN) {
      return t("weak");
    }
    if (password !== confirm) {
      return t("mismatch");
    }
    return null;
  }, [password, confirm, t]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetFieldErrors();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (!supabase) {
      setError(t("noClient"));
      return;
    }

    setPending(true);
    const { data, error: upErr } = await supabase.auth.updateUser({ password });

    if (upErr) {
      setPending(false);
      const msg = (upErr.message ?? "").toLowerCase();
      if (msg.includes("password") && (msg.includes("6") || msg.includes("least"))) {
        setError(t("weak"));
        return;
      }
      setError(upErr.message?.trim() ? upErr.message : t("failed"));
      return;
    }

    if (!data.user) {
      setPending(false);
      setError(t("failed"));
      return;
    }

    const res = await fetch("/api/auth/password-changed", { method: "POST", credentials: "include" });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setPending(false);

    if (!res.ok || !body.ok) {
      setError(t("syncFailed"));
      return;
    }

    await refresh();
    router.push(redirectPath);
    router.refresh();
  }

  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="relative overflow-hidden rounded-3xl border border-sky-300/25 bg-slate-950/60 p-6 shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_24px_64px_-22px_rgba(37,99,235,0.85)] backdrop-blur-2xl sm:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
          <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-sky-400/25 blur-3xl" />
        </div>

        <div className="relative z-10">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">{t("title")}</h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">{t("subtitle")}</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Lock className="h-3.5 w-3.5 text-sky-300/80" aria-hidden />
                  {t("newLabel")}
                </span>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    resetFieldErrors();
                  }}
                  minLength={MIN_LEN}
                  disabled={pending}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/25 disabled:opacity-60"
                  placeholder="••••••••"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Lock className="h-3.5 w-3.5 text-sky-300/80" aria-hidden />
                  {t("repeatLabel")}
                </span>
                <input
                  type="password"
                  name="password2"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    resetFieldErrors();
                  }}
                  minLength={MIN_LEN}
                  disabled={pending}
                  className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/25 disabled:opacity-60"
                  placeholder="••••••••"
                />
              </label>

              {error ? (
                <p
                  className="rounded-xl border border-red-400/35 bg-red-500/10 px-3 py-2.5 text-sm leading-snug text-red-100"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(56,189,248,0.95)] transition hover:from-sky-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {pending ? t("saving") : t("submit")}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
}
