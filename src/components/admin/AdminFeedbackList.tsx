"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { adminReplyToFeedback } from "@/app/actions/admin-feedback";
import { useToast } from "@/components/ui/SimpleToast";

export type AdminFeedbackRow = {
  id: string;
  message: string;
  createdAt: string;
  email: string | null;
  userLabel: string;
  replies: { id: string; reply: string; createdAt: string; adminLabel: string }[];
};

type Props = {
  items: AdminFeedbackRow[];
};

export function AdminFeedbackList({ items }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const { toast } = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function sendReply(feedbackId: string) {
    const text = (draft[feedbackId] ?? "").trim();
    if (!text) return;
    startTransition(async () => {
      const r = await adminReplyToFeedback(feedbackId, text);
      if (r.ok) {
        toast("success", t("feedbackReplySent"));
        setDraft((d) => ({ ...d, [feedbackId]: "" }));
        setOpenId(null);
        router.refresh();
      } else {
        toast("error", t("feedbackReplyError"));
      }
    });
  }

  if (items.length === 0) {
    return <p className="text-sm text-zinc-600">{t("feedbackEmpty")}</p>;
  }

  return (
    <ul className="space-y-6">
      {items.map((fb) => (
        <li key={fb.id} className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/40 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-zinc-200/80 pb-3 dark:border-zinc-700">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("feedbackColFrom")}</p>
              <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{fb.userLabel}</p>
              {fb.email ? (
                <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{fb.email}</p>
              ) : null}
            </div>
            <time className="shrink-0 text-xs text-zinc-500" dateTime={fb.createdAt}>
              {new Date(fb.createdAt).toLocaleString()}
            </time>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{fb.message}</p>

          {fb.replies.length > 0 ? (
            <div className="mt-4 space-y-3 border-t border-zinc-200/80 pt-4 dark:border-zinc-700">
              {fb.replies.map((r) => (
                <div key={r.id} className="rounded-xl border border-emerald-200/80 bg-white p-3 text-sm dark:border-emerald-900/50 dark:bg-zinc-950/40">
                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    {r.adminLabel} · {new Date(r.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{r.reply}</p>
                </div>
              ))}
            </div>
          ) : null}

          {openId === fb.id ? (
            <div className="mt-4 space-y-3">
              <label className="sr-only" htmlFor={`reply-${fb.id}`}>
                {t("feedbackReplyPlaceholder")}
              </label>
              <textarea
                id={`reply-${fb.id}`}
                value={draft[fb.id] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [fb.id]: e.target.value }))}
                rows={4}
                placeholder={t("feedbackReplyPlaceholder")}
                className="field-input min-h-[100px] w-full resize-y"
                disabled={pending}
                maxLength={8000}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary min-h-[44px]"
                  disabled={pending || !(draft[fb.id] ?? "").trim()}
                  onClick={() => sendReply(fb.id)}
                >
                  {t("feedbackSendReply")}
                </button>
                <button type="button" className="btn-secondary min-h-[44px]" disabled={pending} onClick={() => setOpenId(null)}>
                  {t("feedbackCancel")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn-secondary mt-4 min-h-[44px]"
              onClick={() => setOpenId(fb.id)}
            >
              {t("feedbackReply")}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
