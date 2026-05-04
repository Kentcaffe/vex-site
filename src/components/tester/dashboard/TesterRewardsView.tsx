"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTesterWorkspace } from "@/contexts/tester-workspace-context";

export function TesterRewardsView() {
  const t = useTranslations("TesterDashboard");
  const { bugs } = useTesterWorkspace();
  const accepted = bugs.filter((b) => b.status === "accepted").length;
  const reward = bugs.reduce((s, b) => s + Number(b.reward ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
        <h1 className="text-xl font-bold text-white sm:text-2xl">{t("subpages.rewardsTitle")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("subpages.rewardsSubtitle")}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-200/90">{t("subpages.rewardsAccepted")}</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums text-emerald-100">{accepted}</dd>
          </div>
          <div className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-fuchsia-200/90">{t("subpages.rewardsTotalLei")}</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums text-fuchsia-100">{reward}</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-slate-500">{t("subpages.rewardsRailHint")}</p>
        <p className="mt-4 text-sm">
          <Link
            href="/tester/dashboard"
            className="cursor-pointer font-medium text-violet-300 underline-offset-2 transition hover:text-violet-200 hover:underline"
          >
            {t("subpages.backToDashboard")}
          </Link>
        </p>
      </div>
    </div>
  );
}
