"use client";

import { useActionState, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { registerUser, type RegisterState } from "@/app/actions/auth";

const initialRegister: RegisterState | undefined = undefined;

export function AuthForms() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);
  const [registerState, registerAction, registerPending] = useActionState(registerUser, initialRegister);

  useEffect(() => {
    if (registerState?.ok) {
      setJustRegistered(true);
      setTab("login");
    }
  }, [registerState]);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setLoginError(t("loginError"));
      return;
    }
    router.refresh();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex gap-2 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            tab === "login"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
          }`}
          onClick={() => setTab("login")}
        >
          {t("login")}
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            tab === "register"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
          }`}
          onClick={() => setTab("register")}
        >
          {t("register")}
        </button>
      </div>

      {tab === "login" ? (
        <form onSubmit={onLogin} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {justRegistered ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
              {t("registerSuccess")}
            </p>
          ) : null}
          {loginError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {loginError}
            </p>
          ) : null}
          <div>
            <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400" htmlFor="login-email">
              {t("email")}
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400" htmlFor="login-password">
              {t("password")}
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t("login")}
          </button>
        </form>
      ) : (
        <form action={registerAction} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {registerState?.ok === false && registerState.error === "emailTaken" ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {t("emailTaken")}
            </p>
          ) : null}
          {registerState?.ok === false && registerState.error === "validation" ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {t("validationError")}
            </p>
          ) : null}
          <div>
            <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400" htmlFor="reg-name">
              {t("name")}
            </label>
            <input
              id="reg-name"
              name="name"
              type="text"
              autoComplete="name"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400" htmlFor="reg-email">
              {t("email")}
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400" htmlFor="reg-password">
              {t("password")} <span className="text-zinc-400">({t("passwordHint")})</span>
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            disabled={registerPending}
            className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {registerPending ? "…" : t("register")}
          </button>
        </form>
      )}
    </div>
  );
}
