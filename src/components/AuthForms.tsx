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

function GoogleGlyph() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20";

export function AuthForms({ oauth }: Props) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const router = useRouter();
  const [regState, regAction, regPending] = useActionState(registerUser, undefined as RegisterState | undefined);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginPending, setLoginPending] = useState(false);
  const [regClientError, setRegClientError] = useState<string | null>(null);

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

  function onRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
    setRegClientError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const phoneDigits = String(fd.get("phone") ?? "").replace(/\D/g, "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.preventDefault();
      setRegClientError(t("invalidEmail"));
      return;
    }
    if (password.length < 8) {
      e.preventDefault();
      setRegClientError(t("invalidPassword"));
      return;
    }
    if (phoneDigits.length < 8) {
      e.preventDefault();
      setRegClientError(t("phoneInvalid"));
      return;
    }
  }

  const showGoogle = oauth?.google;
  const showFacebook = oauth?.facebook;
  const showOAuth = showGoogle || showFacebook;

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
      {/* Login */}
      <section className="flex flex-col rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:border-zinc-700/80 dark:bg-zinc-900 sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("loginTitle")}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("loginLead")}</p>

        {showOAuth ? (
          <div className="mt-6 space-y-3">
            {showGoogle ? (
              <button
                type="button"
                onClick={() => void signIn("google", { callbackUrl })}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 active:scale-[0.99] dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <GoogleGlyph />
                {t("continueGoogle")}
              </button>
            ) : null}
            {showFacebook ? (
              <button
                type="button"
                onClick={() => void signIn("facebook", { callbackUrl })}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#1877F2] bg-[#1877F2] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#166fe5] active:scale-[0.99]"
              >
                <span className="text-lg font-bold" aria-hidden>
                  f
                </span>
                {t("continueFacebook")}
              </button>
            ) : null}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
                <span className="bg-white px-3 text-zinc-500 dark:bg-zinc-900">{t("dividerOr")}</span>
              </div>
            </div>
          </div>
        ) : null}

        <form className={`space-y-4 ${showOAuth ? "mt-2" : "mt-6"}`} onSubmit={onLogin}>
          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="login-email">
              {t("email")}
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="login-password">
              {t("password")}
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
            <p className="mt-2 text-right">
              <Link
                href="/cont/forgot-password"
                className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline dark:text-emerald-400"
              >
                {t("forgotPassword")}
              </Link>
            </p>
          </div>
          {loginError ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
              {loginError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loginPending}
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-60 dark:focus-visible:ring-offset-zinc-900"
          >
            {loginPending ? t("loginPending") : t("loginEmail")}
          </button>
        </form>
        {!showOAuth ? <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("oauthConfigureHint")}</p> : null}
      </section>

      {/* Register */}
      <section className="flex flex-col rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:border-zinc-700/80 dark:bg-zinc-900 sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("registerTitle")}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("registerLead")}</p>

        <form className="mt-6 flex flex-1 flex-col space-y-4" action={regAction} onSubmit={onRegisterSubmit}>
          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="reg-email">
              {t("email")}
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="reg-password">
              {t("passwordMin")}
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="reg-name">
              {t("nameOptional")}
            </label>
            <input id="reg-name" name="name" type="text" maxLength={80} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="reg-phone">
              {t("phone")} <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              placeholder={t("phonePlaceholder")}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-zinc-500">{t("phoneHint")}</p>
          </div>

          {regClientError ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
              {regClientError}
            </p>
          ) : null}
          {regState?.ok === false ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
              {regState.error === "emailTaken"
                ? t("emailTaken")
                : regState.error === "phoneInvalid"
                  ? t("phoneInvalid")
                  : t("validationError")}
            </p>
          ) : null}
          {regState?.ok === true ? (
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400" role="status">
              {t("registerSuccess")}
            </p>
          ) : null}

          <div className="pt-2">
            <button
              type="submit"
              disabled={regPending}
              className="w-full rounded-xl bg-zinc-200 py-3.5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900"
            >
              {regPending ? t("registerPending") : t("register")}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
