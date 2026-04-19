"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { clearLoginFields, loadLoginFields, saveLoginFields } from "@/lib/auth-form-persist";
import { AtSign, Lock } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { authInputClass, IconField } from "@/components/auth/IconField";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import type { OauthAvailability } from "@/components/auth/types";
import { loginErrorMessageKey } from "@/lib/auth-supabase-errors";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type Props = {
  callbackUrl: string;
  oauth?: OauthAvailability;
};

export function LoginTab({ callbackUrl, oauth }: Props) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [identifierErr, setIdentifierErr] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");

  useEffect(() => {
    const saved = loadLoginFields();
    if (saved?.identifier) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restabilire din sessionStorage după hidratare
      setIdentifier(saved.identifier);
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setIdentifierErr(null);
    setPasswordErr(null);
    const fd = new FormData(e.currentTarget);
    const identifier = String(fd.get("identifier") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");
    if (!identifier) {
      setIdentifierErr(t("fieldRequired"));
      return;
    }
    if (!password) {
      setPasswordErr(t("fieldRequired"));
      return;
    }
    if (!identifier.includes("@")) {
      setFormError(t("invalidEmail"));
      return;
    }
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });
    await fetch("/api/auth/sync-user", { method: "POST", credentials: "include" });
    setPending(false);
    if (error) {
      setFormError(t(loginErrorMessageKey(error)));
      return;
    }
    clearLoginFields();
    router.push(callbackUrl);
    router.refresh();
  }

  const showOAuth = oauth?.google || oauth?.facebook;

  return (
    <div className="space-y-6">
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <IconField
          id="auth-identifier"
          label={t("identifierLabel")}
          icon={AtSign}
          error={identifierErr}
          hint={t("identifierHint")}
        >
          <input
            id="auth-identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            className={authInputClass}
            value={identifier}
            onChange={(e) => {
              const v = e.target.value;
              setIdentifier(v);
              saveLoginFields({ identifier: v });
              setIdentifierErr(null);
            }}
          />
        </IconField>
        <div className="space-y-1.5">
          <IconField id="auth-password" label={t("password")} icon={Lock} error={passwordErr}>
            <input
              id="auth-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={authInputClass}
              onChange={() => setPasswordErr(null)}
            />
          </IconField>
          <div className="flex justify-end pt-0.5">
            <Link
              href="/cont/forgot-password"
              className="text-[13px] font-semibold text-[#2563eb] transition hover:text-blue-700 hover:underline dark:text-blue-400"
            >
              {t("forgotPassword")}
            </Link>
          </div>
        </div>

        {formError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-[#2563eb] py-3.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 disabled:opacity-60 dark:focus-visible:ring-offset-zinc-900"
        >
          {pending ? t("loginPending") : t("loginButton")}
        </button>
      </form>

      {showOAuth ? (
        <>
          <AuthDivider>{t("dividerContinueWith")}</AuthDivider>
          <SocialAuthButtons oauth={oauth} callbackUrl={callbackUrl} variant="compact" />
        </>
      ) : (
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">{t("oauthConfigureHint")}</p>
      )}
    </div>
  );
}
