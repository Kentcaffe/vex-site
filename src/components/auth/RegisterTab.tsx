"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Lock, Mail, Phone, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { authInputClass, IconField } from "@/components/auth/IconField";
import { PasswordRulesList } from "@/components/auth/PasswordRulesList";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import type { OauthAvailability } from "@/components/auth/types";
import { routing } from "@/i18n/routing";
import { evaluatePasswordRules, passwordMeetsAllRules } from "@/lib/auth-password-rules";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { clearRegisterFields, loadRegisterFields, saveRegisterFields } from "@/lib/auth-form-persist";

type Props = {
  oauth?: OauthAvailability;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterTab({ oauth }: Props) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const supabase = createSupabaseBrowserClient();
  const callbackUrl = locale === routing.defaultLocale ? "/" : `/${locale}`;
  const [regPending, setRegPending] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerOk, setRegisterOk] = useState(false);
  const [password, setPassword] = useState("");
  const [pwdTouched, setPwdTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const [termsErr, setTermsErr] = useState<string | null>(null);
  const [clientBlock, setClientBlock] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [fieldsHydrated, setFieldsHydrated] = useState(false);

  const rules = useMemo(() => evaluatePasswordRules(password), [password]);

  useEffect(() => {
    const saved = loadRegisterFields();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restabilire din sessionStorage după hidratare
      setName(saved.name);
      setEmail(saved.email);
      setPhone(saved.phone);
    }
    setFieldsHydrated(true);
  }, []);

  useEffect(() => {
    if (!fieldsHydrated) return;
    saveRegisterFields({ name, email, phone });
  }, [fieldsHydrated, name, email, phone]);

  function validateClient(fd: FormData): boolean {
    setRegisterError(null);
    setRegisterOk(false);
    setClientBlock(null);
    setEmailErr(null);
    setPhoneErr(null);
    setTermsErr(null);
    const em = String(fd.get("email") ?? "").trim();
    const ph = String(fd.get("phone") ?? "");
    const pw = String(fd.get("password") ?? "");
    const terms = fd.get("acceptTerms") === "on";
    let ok = true;
    if (!emailRe.test(em)) {
      setEmailErr(t("invalidEmail"));
      ok = false;
    }
    if (ph.replace(/\D/g, "").length < 8) {
      setPhoneErr(t("phoneInvalid"));
      ok = false;
    }
    if (!passwordMeetsAllRules(pw)) {
      setClientBlock(t("passwordWeak"));
      ok = false;
    }
    if (!terms) {
      setTermsErr(t("termsRequired"));
      ok = false;
    }
    return ok;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    if (!validateClient(fd)) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");
    const phone = String(fd.get("phone") ?? "").replace(/\D/g, "");
    const name = String(fd.get("name") ?? "").trim();

    setRegPending(true);
    void supabase.auth
      .signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
          data: {
            full_name: name || null,
            phone: phone || null,
          },
        },
      })
      .then(async ({ error }) => {
        if (error) {
          setRegisterError(t("validationError"));
          return;
        }
        await fetch("/api/auth/sync-user", { method: "POST", credentials: "include" });
        clearRegisterFields();
        setRegisterOk(true);
      })
      .finally(() => {
        setRegPending(false);
      });
  }

  const showOAuth = oauth?.google || oauth?.facebook;

  return (
    <div className="space-y-6">
      <form className="space-y-5" onSubmit={onSubmit}>
        <IconField id="reg-name" label={t("nameOptional")} icon={User}>
          <input
            id="reg-name"
            name="name"
            type="text"
            maxLength={80}
            autoComplete="name"
            className={authInputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </IconField>

        <IconField
          id="reg-email"
          label={t("email")}
          icon={Mail}
          error={emailErr}
        >
          <input
            id="reg-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailErr(null);
            }}
            className={authInputClass}
          />
        </IconField>

        <IconField
          id="reg-phone"
          label={t("phone")}
          icon={Phone}
          error={phoneErr}
          hint={t("phoneHint")}
        >
          <input
            id="reg-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneErr(null);
            }}
            className={authInputClass}
          />
        </IconField>

        <div className="space-y-3">
          <IconField id="reg-password" label={t("password")} icon={Lock}>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPwdTouched(true);
              }}
              onBlur={() => setPwdTouched(true)}
              className={authInputClass}
            />
          </IconField>
          <PasswordRulesList rules={rules} passwordTouched={pwdTouched} />
        </div>

        <div className="space-y-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
            <input
              type="checkbox"
              name="acceptTerms"
              value="on"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-[#2563eb] focus:ring-[#2563eb]"
              onChange={() => setTermsErr(null)}
            />
            <span className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t("termsPrefix")}{" "}
              <Link href="/termeni" className="font-semibold text-[#2563eb] hover:underline dark:text-blue-400">
                {t("termsLink")}
              </Link>{" "}
              {t("termsMiddle")}{" "}
              <Link href="/confidentialitate" className="font-semibold text-[#2563eb] hover:underline dark:text-blue-400">
                {t("privacyLink")}
              </Link>
              {t("termsSuffix")}
            </span>
          </label>
          {termsErr ? (
            <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
              {termsErr}
            </p>
          ) : null}
        </div>

        {clientBlock ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
            {clientBlock}
          </p>
        ) : null}
        {registerError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
            {registerError}
          </p>
        ) : null}
        {registerOk ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" role="status">
            {t("registerSuccess")}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={regPending}
          className="w-full rounded-xl bg-zinc-900 py-3.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:ring-offset-zinc-900"
        >
          {regPending ? t("registerPending") : t("registerButton")}
        </button>
      </form>

      {showOAuth ? (
        <>
          <AuthDivider>{t("dividerRegisterWith")}</AuthDivider>
          <SocialAuthButtons oauth={oauth} callbackUrl={callbackUrl} variant="compact" />
        </>
      ) : null}
    </div>
  );
}
