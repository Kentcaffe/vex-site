"use client";

import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { registerUser, type RegisterState } from "@/app/actions/auth";
import { routing } from "@/i18n/routing";

export function AuthForms() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [regState, regAction, regPending] = useActionState(registerUser, undefined as RegisterState | undefined);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const callbackUrl = locale === routing.defaultLocale ? "/anunturi" : `/${locale}/anunturi`;
    await signIn("credentials", { email, password, redirect: true, callbackUrl });
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">{t("loginTitle")}</h2>
        <form className="mt-4 space-y-3" onSubmit={onLogin}>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="login-email">
              {t("email")}
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="login-password">
              {t("password")}
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {t("login")}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">{t("registerTitle")}</h2>
        <form className="mt-4 space-y-3" action={regAction}>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="reg-email">
              {t("email")}
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="reg-password">
              {t("passwordMin")}
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="reg-name">
              {t("nameOptional")}
            </label>
            <input
              id="reg-name"
              name="name"
              type="text"
              maxLength={80}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          {regState?.ok === false ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {regState.error === "emailTaken" ? t("emailTaken") : t("validationError")}
            </p>
          ) : null}
          {regState?.ok === true ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
              {t("registerSuccess")}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={regPending}
            className="w-full rounded-lg border border-zinc-300 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {t("register")}
          </button>
        </form>
      </section>
    </div>
  );
}
