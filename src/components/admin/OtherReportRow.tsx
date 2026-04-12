"use client";

import type { ReportStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { setOtherReportStatus } from "@/app/actions/admin-other-reports";
import { useRouter } from "@/i18n/navigation";

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
    subject: string;
    contextUrl: string | null;
    createdAt: string;
    resolutionNote: string | null;
    reporterEmail: string;
  };
};

export function OtherReportRow({ report: initial, locale }: RowProps) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState("");
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
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-900 dark:bg-violet-950/60 dark:text-violet-200">
            {t("complaintTypeOther")}
          </span>
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
        <p className="font-medium text-zinc-900 dark:text-zinc-50">{initial.subject}</p>
        {initial.contextUrl ? (
          <p className="text-sm break-all text-emerald-700 dark:text-emerald-400">
            <a href={initial.contextUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {initial.contextUrl}
            </a>
          </p>
        ) : null}
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
        {initial.resolutionNote ? (
          <p className="rounded-lg bg-zinc-100 px-2 py-1.5 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <span className="font-medium">{t("resolutionNotePublic")}:</span> {initial.resolutionNote}
          </p>
        ) : null}
      </div>
      <div className="flex w-full max-w-sm shrink-0 flex-col gap-2 sm:max-w-xs">
        {initial.status === "PENDING" ? (
          <>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor={`note-o-${initial.id}`}>
              {t("resolutionNoteModerator")}
            </label>
            <textarea
              id={`note-o-${initial.id}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-950"
              placeholder={t("resolutionNotePlaceholder")}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => setOtherReportStatus(initial.id, "REVIEWED", note.trim() || null))}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
              >
                {t("markReviewed")}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => setOtherReportStatus(initial.id, "DISMISSED", note.trim() || null))}
                className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
              >
                {t("dismiss")}
              </button>
            </div>
          </>
        ) : null}
      </div>
      {err ? <p className="w-full text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
