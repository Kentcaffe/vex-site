"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { TesterBugReportFormCopy } from "@/components/tester/dashboard/TesterBugReportForm";

export function useTesterBugFormCopy(): TesterBugReportFormCopy {
  const t = useTranslations("TesterDashboard");
  return useMemo(
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
      imagesRequired: t("form.imagesRequired"),
    }),
    [t],
  );
}
