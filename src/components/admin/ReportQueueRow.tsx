"use client";

import type { ReportStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { deleteListingFromReport, setReportStatus } from "@/app/actions/admin-reports";
import { Link, useRouter } from "@/i18n/navigation";

function reasonLabel(t: (key: string) => string, code: string): string {
  const map: Record<string, string> = {
    spam: "reason_spam",
    fraud: "reason_fraud",
    inappropriate: "reason_inappropriate",
    duplicate: "reason_duplicate",
    other: "reason_other",
  };
  const k = map[code];
  return k ? t(k) : code;
}

type RowProps = {
  locale: string;
  report: {
    id: string;
    status: ReportStatus;
    reason: string;
    details: string | null;
    createdAt: string;
    listing: { id: string; title: string };
    reporterEmail: string;
  };
};

export function ReportQueueRow({ report: initial, locale }: RowProps) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean }>) {
    setErr(null);
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) {
        setErr(t("reportActionError"));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
              initial.status === "PENDING"
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200"
                : initial.status === "REVIEWED"
                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
                  : "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
            }`}
          >
            {initial.status === "PENDING"
              ? t("status_PENDING")
              : initial.status === "REVIEWED"
                ? t("status_REVIEWED")
                : t("status_DISMISSED")}
          </span>
          <span className="text-xs text-zinc-500">
            {new Date(initial.createdAt).toLocaleString(locale)}
          </span>
        </div>
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          <Link href={`/anunturi/${initial.listing.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
            {initial.listing.title}
          </Link>
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">{t("reportFrom")}:</span> {initial.reporterEmail}
        </p>
        <p className="text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("reportReason")}:</span>{" "}
          {reasonLabel(t, initial.reason)}
        </p>
        {initial.details ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">{t("reportDetails")}:</span> {initial.details}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {initial.status === "PENDING" ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setReportStatus(initial.id, "REVIEWED"))}
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
              {t("markReviewed")}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setReportStatus(initial.id, "DISMISSED"))}
              className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {t("dismiss")}
            </button>
          </>
        ) : null}
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(t("confirmDeleteListingFromReport"))) {
              return;
            }
            run(() => deleteListingFromReport(initial.id));
          }}
          className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:opacity-60 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {t("deleteListing")}
        </button>
      </div>
      {err ? <p className="w-full text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
