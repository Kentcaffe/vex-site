"use client";

import { useActionState, useState } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { registerUser, type RegisterState } from "@/app/actions/auth";
import { Link, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export type OauthAvailability = {
  google: boolean;
  facebook: boolean;
};

type Props = {
  oauth?: OauthAvailability;
};

export function AuthForms({ oauth }: Props) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const router = useRouter();
  const [regState, regAction, regPending] = useActionState(registerUser, undefined as RegisterState | undefined);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginPending, setLoginPending] = useState(false);

  /** Homepage after sign-in (all methods). */
  const callbackUrl = locale === routing.defaultLocale ? "/" : `/${locale}`;

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError(null);
    setLoginPending(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    setLoginPending(false);
    if (res?.error) {
      setLoginError(t("loginInvalid"));
      return;
    }
    if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  const showGoogle = oauth?.google;
  const showFacebook = oauth?.facebook;
  const showOAuth = showGoogle || showFacebook;

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">{t("loginTitle")}</h2>

        {showOAuth ? (
          <div className="mt-4 space-y-3">
            {showGoogle ? (
              <button
                type="button"
                onClick={() => void signIn("google", { callbackUrl })}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white py-2.5 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <span aria-hidden className="text-lg font-bold text-[#4285F4]">
                  G
                </span>
                {t("continueGoogle")}
              </button>
            ) : null}
            {showFacebook ? (
              <button
                type="button"
                onClick={() => void signIn("facebook", { callbackUrl })}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-[#1877F2] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#166fe5]"
              >
                <span aria-hidden className="text-lg font-bold">
                  f
                </span>
                {t("continueFacebook")}
              </button>
            ) : null}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900">{t("oauthDivider")}</span>
              </div>
            </div>
          </div>
        ) : null}

        <form className={`space-y-3 ${showOAuth ? "mt-2" : "mt-4"}`} onSubmit={onLogin}>
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
            <p className="mt-2 text-right">
              <Link href="/cont/forgot-password" className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                {t("forgotPassword")}
              </Link>
            </p>
          </div>
          {loginError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {loginError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loginPending}
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loginPending ? t("loginPending") : t("loginEmail")}
          </button>
        </form>
        {!showOAuth ? <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("oauthConfigureHint")}</p> : null}
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
