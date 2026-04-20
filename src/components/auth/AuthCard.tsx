"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { loadAuthTab, saveAuthTab } from "@/lib/auth-form-persist";
import { routing } from "@/i18n/routing";
import { LoginTab } from "@/components/auth/LoginTab";
import { RegisterTab } from "@/components/auth/RegisterTab";
import type { OauthAvailability } from "@/components/auth/types";

type Props = {
  oauth?: OauthAvailability;
  callbackError?: string;
};

const CALLBACK_ERROR_KEYS: Record<string, "callbackError_missing_code" | "callbackError_oauth" | "callbackError_supabase_env"> = {
  missing_code: "callbackError_missing_code",
  oauth_callback: "callbackError_oauth",
  supabase_env_missing: "callbackError_supabase_env",
};

export function AuthCard({ oauth, callbackError }: Props) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [tab, setTab] = useState<"login" | "register">("login");
  const callbackUrl = locale === routing.defaultLocale ? "/" : `/${locale}`;

  const callbackMessageKey = useMemo(() => {
    if (!callbackError?.trim()) {
      return null;
    }
    const raw = callbackError.trim();
    return CALLBACK_ERROR_KEYS[raw] ?? "callbackError_generic";
  }, [callbackError]);

  useEffect(() => {
    const saved = loadAuthTab();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restabilire din sessionStorage după hidratare (evită mismatch SSR)
      setTab(saved);
    }
  }, []);

  function setTabPersist(next: "login" | "register") {
    setTab(next);
    saveAuthTab(next);
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="surface-card p-8 sm:p-9">
        <header className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("cardTitle")}</h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-500 dark:text-zinc-400">{t("cardSubtitle")}</p>
        </header>

        {callbackMessageKey ? (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-left text-[13px] font-medium leading-snug text-red-900 dark:border-red-900/60 dark:bg-red-950/35 dark:text-red-100"
          >
            {t(callbackMessageKey)}
          </p>
        ) : null}

        <div
          className="surface-muted mt-8 flex p-1"
          role="tablist"
          aria-label={t("cardTitle")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "login"}
            onClick={() => setTabPersist("login")}
            className={`relative flex-1 rounded-lg py-2.5 text-[14px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 ${
              tab === "login"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {t("tabSignIn")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "register"}
            onClick={() => setTabPersist("register")}
            className={`relative flex-1 rounded-lg py-2.5 text-[14px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 ${
              tab === "register"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {t("tabCreateAccount")}
          </button>
        </div>

        <div className="mt-8">
          <div
            key={tab}
            className="animate-auth-tab"
            role="tabpanel"
            id={`auth-panel-${tab}`}
          >
            {tab === "login" ? <LoginTab callbackUrl={callbackUrl} oauth={oauth} /> : null}
            {tab === "register" ? <RegisterTab oauth={oauth} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
