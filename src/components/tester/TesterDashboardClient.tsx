"use client";

import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { BugRow } from "@/lib/tester-bugs";
import type { LeaderboardEntry } from "@/components/tester/dashboard/TesterRightRail";
import { TesterBugReportForm } from "@/components/tester/dashboard/TesterBugReportForm";
import type { TesterBugReportFormCopy } from "@/components/tester/dashboard/TesterBugReportForm";
import { TesterBugsTable } from "@/components/tester/dashboard/TesterBugsTable";
import type { TesterBugsTableCopy } from "@/components/tester/dashboard/TesterBugsTable";
import { TesterRightRail } from "@/components/tester/dashboard/TesterRightRail";
import { TesterSidebar } from "@/components/tester/dashboard/TesterSidebar";
import { TesterWelcomeHero } from "@/components/tester/dashboard/TesterWelcomeHero";
import { useTesterSidebarItems } from "@/components/tester/useTesterSidebarItems";

export function TesterDashboardClient({
  bugs,
  leaderboard,
}: {
  bugs: BugRow[];
  leaderboard: LeaderboardEntry[];
}) {
  const t = useTranslations("TesterDashboard");
  const tChat = useTranslations("TesterChat");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const sidebarItems = useTesterSidebarItems();

  const stats = useMemo(
    () =>
      bugs.reduce(
        (acc, bug) => {
          acc.total += 1;
          if (bug.status === "accepted") acc.accepted += 1;
          else if (bug.status === "rejected") acc.rejected += 1;
          else acc.open += 1;
          acc.reward += Number(bug.reward ?? 0);
          return acc;
        },
        { total: 0, open: 0, accepted: 0, rejected: 0, reward: 0 },
      ),
    [bugs],
  );

  const guideSteps = useMemo(
    () => [t("guide.s1"), t("guide.s2"), t("guide.s3"), t("guide.s4"), t("guide.s5")],
    [t],
  );

  const formCopy: TesterBugReportFormCopy = useMemo(
    () => ({
      title: t("form.title"),
      badge: t("form.badge"),
      tipsTitle: t("form.tipsTitle"),
      tipsBody: t("form.tipsBody"),
      fieldTitle: t("form.fieldTitle"),
      fieldTitlePh: t("form.fieldTitlePh"),
      fieldDescription: t("form.fieldDescription"),
      fieldDescriptionPh: t("form.fieldDescriptionPh"),
      fieldSteps: t("form.fieldSteps"),
      stepPh: t("form.stepPh"),
      addStep: t("form.addStep"),
      removeStepAria: t("form.removeStepAria"),
      fieldExpected: t("form.fieldExpected"),
      fieldExpectedPh: t("form.fieldExpectedPh"),
      fieldActual: t("form.fieldActual"),
      fieldActualPh: t("form.fieldActualPh"),
      fieldPageUrl: t("form.fieldPageUrl"),
      fieldPageUrlPh: t("form.fieldPageUrlPh"),
      fieldRepro: t("form.fieldRepro"),
      reproAlways: t("form.reproAlways"),
      reproSometimes: t("form.reproSometimes"),
      reproOnce: t("form.reproOnce"),
      fieldBrowser: t("form.fieldBrowser"),
      fieldBrowserPh: t("form.fieldBrowserPh"),
      fieldDevice: t("form.fieldDevice"),
      fieldDevicePh: t("form.fieldDevicePh"),
      fieldCategory: t("form.fieldCategory"),
      catUi: t("form.catUi"),
      catFunctional: t("form.catFunctional"),
      catSecurity: t("form.catSecurity"),
      fieldSeverity: t("form.fieldSeverity"),
      sevLow: t("form.sevLow"),
      sevMed: t("form.sevMed"),
      sevHigh: t("form.sevHigh"),
      screenshotsLabel: t("form.screenshotsLabel"),
      screenshotsDrag: t("form.screenshotsDrag"),
      screenshotsBrowse: t("form.screenshotsBrowse"),
      screenshotsCount: t("form.screenshotsCount"),
      termsLabel: t("form.termsLabel"),
      termsError: t("form.termsError"),
      submit: t("form.submit"),
      submitting: t("form.submitting"),
      footerHint: t("form.footerHint"),
    }),
    [t],
  );

  const tableCopy: TesterBugsTableCopy = useMemo(
    () => ({
      title: t("table.title"),
      searchPh: t("table.searchPh"),
      statusAll: t("table.statusAll"),
      statusOpen: t("table.statusOpen"),
      statusAccepted: t("table.statusAccepted"),
      statusRejected: t("table.statusRejected"),
      sevAll: t("table.sevAll"),
      sevLow: t("table.sevLow"),
      sevMed: t("table.sevMed"),
      sevHigh: t("table.sevHigh"),
      empty: t("table.empty"),
      colTitle: t("table.colTitle"),
      colStatus: t("table.colStatus"),
      colMeta: t("table.colMeta"),
      rewardSuffix: t("table.rewardSuffix"),
      statusLabelOpen: t("table.statusLabelOpen"),
      statusLabelAccepted: t("table.statusLabelAccepted"),
      statusLabelRejected: t("table.statusLabelRejected"),
      sevLabelLow: t("table.sevLabelLow"),
      sevLabelMed: t("table.sevLabelMed"),
      sevLabelHigh: t("table.sevLabelHigh"),
      catUi: t("table.catUi"),
      catFunctional: t("table.catFunctional"),
      catSecurity: t("table.catSecurity"),
    }),
    [t],
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0B0F1A] text-slate-200">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.22),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(56,189,248,0.12),transparent)]" />

      <div className="relative mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px]">
          <TesterSidebar items={sidebarItems} chatHref="/tester/chat" chatLabel={tChat("dashboardLink")} />

          <div className="flex min-w-0 flex-col gap-8 lg:order-none">
            <TesterWelcomeHero title={t("hero.title")} subtitle={t("hero.subtitle")} badge={t("hero.badge")} />

            <TesterBugReportForm copy={formCopy} formRef={formRef} onSuccessAction={() => router.refresh()} />

            <TesterBugsTable bugs={bugs} copy={tableCopy} />
          </div>

          <div className="hidden xl:block">
            <TesterRightRail
              guideTitle={t("guide.title")}
              guideSteps={guideSteps}
              statsTitle={t("stats.title")}
              statTotalLabel={t("stats.total")}
              statOpenLabel={t("stats.open")}
              statAcceptedLabel={t("stats.accepted")}
              statRewardsLabel={t("stats.rewards")}
              total={stats.total}
              open={stats.open}
              accepted={stats.accepted}
              reward={stats.reward}
              lbTitle={t("lb.title")}
              lbEmpty={t("lb.empty")}
              lbAccepted={t("lb.acceptedLabel")}
              leaderboardFootnote={t("lb.footnote")}
              leaderboard={leaderboard}
            />
          </div>
        </div>

        <div className="mt-8 xl:hidden">
          <TesterRightRail
            guideTitle={t("guide.title")}
            guideSteps={guideSteps}
            statsTitle={t("stats.title")}
            statTotalLabel={t("stats.total")}
            statOpenLabel={t("stats.open")}
            statAcceptedLabel={t("stats.accepted")}
            statRewardsLabel={t("stats.rewards")}
            total={stats.total}
            open={stats.open}
            accepted={stats.accepted}
            reward={stats.reward}
            lbTitle={t("lb.title")}
            lbEmpty={t("lb.empty")}
            lbAccepted={t("lb.acceptedLabel")}
            leaderboardFootnote={t("lb.footnote")}
            leaderboard={leaderboard}
          />
        </div>
      </div>
    </div>
  );
}
