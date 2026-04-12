"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitOtherContentReport, type SubmitOtherReportResult } from "@/app/actions/reports";
import { REPORT_REASONS } from "@/lib/report-reasons";

export function ReportOtherContentForm() {
  const t = useTranslations("ReportOther");
  const tr = useTranslations("Report");
  const [state, action, pending] = useActionState(submitOtherContentReport, undefined as SubmitOtherReportResult | undefined);

  return (
    <form action={action} className="mx-auto max-w-lg space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="subject">
          {t("subjectLabel")}
        </label>
        <input
          id="subject"
          name="subject"
          required
          minLength={3}
          maxLength={200}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          placeholder={t("subjectPlaceholder")}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="contextUrl">
          {t("urlLabel")}
        </label>
        <input
          id="contextUrl"
          name="contextUrl"
          type="url"
          inputMode="url"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          placeholder="https://…"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="reason">
          {tr("reasonLabel")}
        </label>
        <select
          id="reason"
          name="reason"
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        >
          {REPORT_REASONS.map((r) => (
            <option key={r.id} value={r.id}>
              {tr(r.labelKey)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="details">
          {tr("detailsLabel")}
        </label>
        <textarea
          id="details"
          name="details"
          rows={4}
          maxLength={2000}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          placeholder={tr("detailsPlaceholder")}
        />
      </div>
      {state?.ok === false ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {t("errorValidation")}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {t("success")}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || state?.ok === true}
        className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
