"use client";

import type { ReportReasonId } from "@/lib/report-reasons";
import { REPORT_REASONS } from "@/lib/report-reasons";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { submitListingReport } from "@/app/actions/reports";
import { useRouter } from "@/i18n/navigation";

type Props = {
  listingId: string;
};

export function ReportListingButton({ listingId }: Props) {
  const t = useTranslations("Report");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReasonId>("spam");
  const [details, setDetails] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    setErr(null);
    startTransition(async () => {
      const r = await submitListingReport(listingId, reason, details.trim() || undefined);
      if (!r.ok) {
        if (r.error === "unauthorized") {
          setErr(t("errorUnauthorized"));
        } else if (r.error === "own_listing") {
          setErr(t("errorOwn"));
        } else if (r.error === "already_reported") {
          setErr(t("errorDuplicate"));
        } else {
          setErr(t("errorGeneric"));
        }
        return;
      }
      setDone(true);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setErr(null);
          setDone(false);
        }}
        className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        {t("cta")}
      </button>
      {done ? <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">{t("success")}</p> : null}

      {open ? (
        <div className="mt-3 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/80">
          <label className="block text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{t("reasonLabel")}</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReasonId)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {t(r.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{t("detailsLabel")}</span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder={t("detailsPlaceholder")}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </label>
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={submit}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {pending ? t("sending") : t("send")}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
