"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TesterRightRail } from "@/components/tester/dashboard/TesterRightRail";
import { TesterSidebar } from "@/components/tester/dashboard/TesterSidebar";
import { useTesterSidebarItems } from "@/components/tester/useTesterSidebarItems";
import { useTesterWorkspace } from "@/contexts/tester-workspace-context";

type Props = {
  children: ReactNode;
};

export function TesterWorkspaceShell({ children }: Props) {
  const t = useTranslations("TesterDashboard");
  const tChat = useTranslations("TesterChat");
  const { bugs, leaderboard } = useTesterWorkspace();
  const sidebarItems = useTesterSidebarItems();

  const stats = useMemo(
    () =>
      bugs.reduce(
        (acc, bug) => {
          acc.total += 1;
          if (bug.status === "accepted") {
            acc.accepted += 1;
          } else if (bug.status === "rejected") {
            acc.rejected += 1;
          } else {
            acc.open += 1;
          }
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

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0B0F1A] text-slate-200">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.22),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(56,189,248,0.12),transparent)]" />

      <div className="relative mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px]">
          <TesterSidebar items={sidebarItems} chatHref="/tester/chat" chatLabel={tChat("dashboardLink")} />

          <div className="flex min-w-0 flex-col gap-8 lg:order-none">{children}</div>

          <div className="col-span-full lg:col-span-2 xl:col-span-1 xl:col-start-3 xl:row-start-1">
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
    </div>
  );
}
