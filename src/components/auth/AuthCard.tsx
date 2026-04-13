"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { LoginTab } from "@/components/auth/LoginTab";
import { RegisterTab } from "@/components/auth/RegisterTab";
import type { OauthAvailability } from "@/components/auth/types";

type Props = {
  oauth?: OauthAvailability;
};

export function AuthCard({ oauth }: Props) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [tab, setTab] = useState<"login" | "register">("login");
  const callbackUrl = locale === routing.defaultLocale ? "/" : `/${locale}`;

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-8 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)] dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/30 sm:p-9">
        <header className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("cardTitle")}</h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-500 dark:text-zinc-400">{t("cardSubtitle")}</p>
        </header>

        <div
          className="mt-8 flex rounded-xl bg-zinc-100/90 p-1 dark:bg-zinc-800/80"
          role="tablist"
          aria-label={t("cardTitle")}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "login"}
            onClick={() => setTab("login")}
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
            onClick={() => setTab("register")}
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
