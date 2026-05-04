"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TesterBugReportForm } from "@/components/tester/dashboard/TesterBugReportForm";
import { TesterWelcomeHero } from "@/components/tester/dashboard/TesterWelcomeHero";
import { useTesterBugFormCopy } from "@/components/tester/useTesterBugFormCopy";

export function TesterReportView() {
  const t = useTranslations("TesterDashboard");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const formCopy = useTesterBugFormCopy();

  return (
    <>
      <TesterWelcomeHero title={t("subpages.reportTitle")} subtitle={t("subpages.reportSubtitle")} badge={t("hero.badge")} />
      <TesterBugReportForm copy={formCopy} formRef={formRef} onSuccessAction={() => router.refresh()} />
      <p className="text-center text-sm text-slate-500">
        <Link
          href="/tester/reports"
          className="cursor-pointer font-medium text-violet-300 underline-offset-2 transition hover:text-violet-200 hover:underline"
        >
          {t("subpages.backToReports")}
        </Link>
      </p>
    </>
  );
}
