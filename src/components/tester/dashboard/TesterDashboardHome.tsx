"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TesterBugReportForm } from "@/components/tester/dashboard/TesterBugReportForm";
import { TesterBugsTable } from "@/components/tester/dashboard/TesterBugsTable";
import { TesterWelcomeHero } from "@/components/tester/dashboard/TesterWelcomeHero";
import { useTesterBugFormCopy } from "@/components/tester/useTesterBugFormCopy";
import { useTesterBugsTableCopy } from "@/components/tester/useTesterBugsTableCopy";
import { useTesterWorkspace } from "@/contexts/tester-workspace-context";

export function TesterDashboardHome() {
  const t = useTranslations("TesterDashboard");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { bugs } = useTesterWorkspace();
  const formCopy = useTesterBugFormCopy();
  const tableCopy = useTesterBugsTableCopy();

  return (
    <>
      <TesterWelcomeHero title={t("hero.title")} subtitle={t("hero.subtitle")} badge={t("hero.badge")} />
      <TesterBugReportForm copy={formCopy} formRef={formRef} onSuccessAction={() => router.refresh()} />
      <TesterBugsTable bugs={bugs} copy={tableCopy} />
    </>
  );
}
