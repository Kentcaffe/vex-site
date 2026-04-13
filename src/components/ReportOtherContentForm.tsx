"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { submitOtherContentReport, type SubmitOtherReportResult } from "@/app/actions/reports";
import {
  LISTING_REPORT_REASONS,
  REPORT_KIND,
  SITE_REPORT_REASONS,
  type ReportCenterKind,
} from "@/lib/other-report-center";

export function ReportOtherContentForm() {
  const t = useTranslations("ReportOther");
  const [tab, setTab] = useState<ReportCenterKind>(REPORT_KIND.listing);
  const [state, action, pending] = useActionState(submitOtherContentReport, undefined as SubmitOtherReportResult | undefined);

  const reasons = tab === REPORT_KIND.listing ? LISTING_REPORT_REASONS : SITE_REPORT_REASONS;

  return (
    <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xl shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/20 sm:p-8 lg:p-10">
      {/* Tabs */}
      <div
        className="flex flex-col gap-2 sm:flex-row sm:rounded-2xl sm:bg-zinc-100/90 sm:p-1.5 dark:sm:bg-zinc-800/80"
        role="tablist"
        aria-label={t("tabsAria")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === REPORT_KIND.listing}
          onClick={() => setTab(REPORT_KIND.listing)}
          className={`rounded-xl px-4 py-3.5 text-center text-sm font-semibold transition-all sm:flex-1 ${
            tab === REPORT_KIND.listing
              ? "bg-white text-[#0b57d0] shadow-md ring-1 ring-zinc-200/80 dark:bg-zinc-950 dark:text-blue-400 dark:ring-zinc-700"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          {t("tabListing")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === REPORT_KIND.site}
          onClick={() => setTab(REPORT_KIND.site)}
          className={`rounded-xl px-4 py-3.5 text-center text-sm font-semibold transition-all sm:flex-1 ${
            tab === REPORT_KIND.site
              ? "bg-white text-[#0b57d0] shadow-md ring-1 ring-zinc-200/80 dark:bg-zinc-950 dark:text-blue-400 dark:ring-zinc-700"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          {t("tabSite")}
        </button>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {tab === REPORT_KIND.listing ? t("introListing") : t("introSite")}
      </p>

      <form action={action} className="mt-8 space-y-6">
        <input type="hidden" name="reportKind" value={tab} />

        <div>
          <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100" htmlFor="subject">
            {t("subjectLabel")}
          </label>
          <input
            id="subject"
            name="subject"
            required
            minLength={3}
            maxLength={200}
            disabled={state?.ok === true}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0b57d0] focus:bg-white focus:ring-2 focus:ring-[#0b57d0]/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            placeholder={tab === REPORT_KIND.listing ? t("subjectPlaceholderListing") : t("subjectPlaceholderSite")}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100" htmlFor="contextUrl">
            {tab === REPORT_KIND.listing ? t("listingUrlLabel") : t("siteUrlLabel")}
            {tab === REPORT_KIND.listing ? (
              <span className="ml-1 font-normal text-red-600 dark:text-red-400">*</span>
            ) : null}
          </label>
          <input
            id="contextUrl"
            name="contextUrl"
            type="url"
            inputMode="url"
            required={tab === REPORT_KIND.listing}
            disabled={state?.ok === true}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0b57d0] focus:bg-white focus:ring-2 focus:ring-[#0b57d0]/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            placeholder={tab === REPORT_KIND.listing ? t("listingUrlPlaceholder") : t("siteUrlPlaceholder")}
          />
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-500">
            {tab === REPORT_KIND.listing ? t("listingUrlHint") : t("siteUrlHint")}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100" htmlFor={`reason-${tab}`}>
            {t("reasonLabel")}
          </label>
          <select
            id={`reason-${tab}`}
            key={tab}
            name="reason"
            required
            disabled={state?.ok === true}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-[#0b57d0] focus:bg-white focus:ring-2 focus:ring-[#0b57d0]/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500"
          >
            {reasons.map((r) => (
              <option key={r.id} value={r.id}>
                {(t as (key: string) => string)(`reasons.${r.id}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100" htmlFor="details">
            {t("detailsLabel")}
          </label>
          <textarea
            id="details"
            name="details"
            rows={5}
            maxLength={2000}
            disabled={state?.ok === true}
            className="mt-2 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0b57d0] focus:bg-white focus:ring-2 focus:ring-[#0b57d0]/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500"
            placeholder={tab === REPORT_KIND.listing ? t("detailsPlaceholderListing") : t("detailsPlaceholderSite")}
          />
        </div>

        {state?.ok === false ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200" role="alert">
            {state.error === "bad_kind" ? t("errorKind") : t("errorValidation")}
          </p>
        ) : null}

        {state?.ok === true ? (
          <div
            className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-4 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100"
            role="status"
          >
            {state.kind === REPORT_KIND.listing ? t("successListing") : t("successSite")}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending || state?.ok === true}
          className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-500 hover:to-emerald-600 hover:shadow-emerald-600/35 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? t("sending") : t("submit")}
        </button>
      </form>
    </div>
  );
}
