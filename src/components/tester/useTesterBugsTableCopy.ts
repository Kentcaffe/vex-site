"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { TesterBugsTableCopy } from "@/components/tester/dashboard/TesterBugsTable";

export function useTesterBugsTableCopy(): TesterBugsTableCopy {
  const t = useTranslations("TesterDashboard");
  return useMemo(
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
}
