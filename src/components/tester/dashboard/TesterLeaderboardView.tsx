"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function TesterLeaderboardView() {
  const t = useTranslations("TesterDashboard");

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-bold text-white sm:text-2xl">{t("subpages.leaderboardTitle")}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("subpages.leaderboardSubtitle")}</p>
      <p className="mt-6 text-sm">
        <Link
          href="/tester/dashboard"
          className="cursor-pointer font-medium text-violet-300 underline-offset-2 transition hover:text-violet-200 hover:underline"
        >
          {t("subpages.backToDashboard")}
        </Link>
      </p>
    </div>
  );
}
