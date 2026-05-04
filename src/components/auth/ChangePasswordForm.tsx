"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";
import { authInputClass, IconField } from "@/components/auth/IconField";
import { tryCreateSupabaseBrowserClient } from "@/lib/supabase";

export function ChangePasswordForm() {
  const t = useTranslations("ChangePassword");
  const router = useRouter();
  const { refresh } = useAuthSession();
  const supabase = tryCreateSupabaseBrowserClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const p1 = String(fd.get("password") ?? "");
    const p2 = String(fd.get("password2") ?? "");
    if (p1.length < 10) {
      setError(t("weak"));
      return;
    }
    if (p1 !== p2) {
      setError(t("mismatch"));
      return;
    }
    if (!supabase) {
      setError(t("noClient"));
      return;
    }
    setPending(true);
    const { error: upErr } = await supabase.auth.updateUser({ password: p1 });
    if (upErr) {
      setPending(false);
      setError(upErr.message || t("failed"));
      return;
    }
    const res = await fetch("/api/auth/password-changed", { method: "POST", credentials: "include" });
    setPending(false);
    if (!res.ok) {
      setError(t("syncFailed"));
      return;
    }
    await refresh();
    router.push("/tester/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t("title")}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      </div>
      <IconField id="cp1" label={t("newLabel")} icon={Lock}>
        <input id="cp1" name="password" type="password" autoComplete="new-password" className={authInputClass} required minLength={10} />
      </IconField>
      <IconField id="cp2" label={t("repeatLabel")} icon={Lock}>
        <input id="cp2" name="password2" type="password" autoComplete="new-password" className={authInputClass} required minLength={10} />
      </IconField>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? t("saving") : t("submit")}
      </button>
    </form>
  );
}
