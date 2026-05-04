"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TesterBugsTable } from "@/components/tester/dashboard/TesterBugsTable";
import { useTesterBugsTableCopy } from "@/components/tester/useTesterBugsTableCopy";
import { useTesterWorkspace } from "@/contexts/tester-workspace-context";

export function TesterReportsView() {
  const t = useTranslations("TesterDashboard");
  const { bugs } = useTesterWorkspace();
  const tableCopy = useTesterBugsTableCopy();

  return (
    <>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 sm:px-5">
        <h1 className="text-lg font-bold text-white sm:text-xl">{t("subpages.reportsTitle")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("subpages.reportsSubtitle")}</p>
        <p className="mt-3 text-sm">
          <Link
            href="/tester/test"
            className="cursor-pointer font-medium text-violet-300 underline-offset-2 transition hover:text-violet-200 hover:underline"
          >
            {t("subpages.newReport")}
          </Link>
          {" · "}
          <Link
            href="/tester/dashboard"
            className="cursor-pointer font-medium text-slate-400 underline-offset-2 transition hover:text-slate-200 hover:underline"
          >
            {t("subpages.backToDashboard")}
          </Link>
        </p>
      </div>
      <TesterBugsTable bugs={bugs} copy={tableCopy} />
    </>
  );
}
