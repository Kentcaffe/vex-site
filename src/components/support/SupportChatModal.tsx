"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Star, X } from "lucide-react";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";
import { SupportLiveChat } from "@/components/support/SupportLiveChat";
import { getCachedSupportTicket, setSupportTicketCache } from "@/lib/support-ticket-cache";

type Props = {
  open: boolean;
  onDismissAction: () => void;
};

/** Modal live support reutilizabil (Contact + Cont). */
export function SupportChatModal({ open, onDismissAction }: Props) {
  const t = useTranslations("Support");
  const { status } = useAuthSession();
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [ticketError, setTicketError] = useState(false);
  const [ticketErrorDetail, setTicketErrorDetail] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [threadHasMessages, setThreadHasMessages] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [satisfied, setSatisfied] = useState<boolean | null>(null);
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackThanks, setFeedbackThanks] = useState(false);

  const ensureTicket = useCallback(async () => {
    const cached = getCachedSupportTicket();
    if (cached) {
      setTicketId(cached.id);
      setFeedbackSubmitted(Boolean(cached.feedbackAt));
      setTicketError(false);
      setTicketErrorDetail(null);
      setLoadingTicket(false);
      return;
    }

    setLoadingTicket(true);
    setTicketError(false);
    setTicketErrorDetail(null);
    try {
      const res = await fetch("/api/support/ticket", { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as {
        ticket?: { id: string; feedbackAt?: string | null };
        message?: string;
        debug?: { message?: string };
      };
      if (!res.ok) {
        const msg =
          typeof data.message === "string"
            ? data.message
            : typeof data.debug?.message === "string"
              ? data.debug.message
              : null;
        setTicketErrorDetail(msg);
        throw new Error("ticket");
      }
      if (!data.ticket?.id) throw new Error("ticket");
      setSupportTicketCache({
        id: data.ticket.id,
        feedbackAt: data.ticket.feedbackAt ?? null,
      });
      setTicketId(data.ticket.id);
      setFeedbackSubmitted(Boolean(data.ticket.feedbackAt));
    } catch {
      setTicketId(null);
      setTicketError(true);
    } finally {
      setLoadingTicket(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setTicketId(null);
      setTicketError(false);
      setTicketErrorDetail(null);
      setShowFeedback(false);
      setThreadHasMessages(false);
      setFeedbackSubmitted(false);
      setRating(0);
      setSatisfied(null);
      setFeedbackSending(false);
      setFeedbackError(null);
      setFeedbackThanks(false);
      setLoadingTicket(true);
    }
  }, [open]);

  async function submitFeedback() {
    if (!ticketId || rating < 1 || satisfied === null) {
      setFeedbackError(t("feedbackValidationError"));
      return;
    }
    setFeedbackSending(true);
    setFeedbackError(null);
    try {
      const res = await fetch("/api/support/feedback", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, rating, satisfied }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        throw new Error(typeof data.message === "string" ? data.message : "feedback_failed");
      }
      setFeedbackSubmitted(true);
      setFeedbackThanks(true);
      window.setTimeout(() => {
        setShowFeedback(false);
        onDismissAction();
      }, 400);
    } catch (err) {
      const msg = err instanceof Error && err.message !== "feedback_failed" ? err.message : t("feedbackError");
      setFeedbackError(msg);
    } finally {
      setFeedbackSending(false);
    }
  }

  function handleClose() {
    if (ticketId && threadHasMessages && !feedbackSubmitted && !showFeedback) {
      setShowFeedback(true);
      return;
    }
    onDismissAction();
  }

  useLayoutEffect(() => {
    if (!open || status !== "authenticated") {
      return;
    }
    const cached = getCachedSupportTicket();
    if (cached) {
      setTicketId(cached.id);
      setFeedbackSubmitted(Boolean(cached.feedbackAt));
      setTicketError(false);
      setTicketErrorDetail(null);
      setLoadingTicket(false);
      return;
    }
    setLoadingTicket(true);
  }, [open, status]);

  useEffect(() => {
    if (!open || status !== "authenticated") return;
    if (ticketError) return;
    if (getCachedSupportTicket()) return;
    void ensureTicket();
  }, [open, status, ticketError, ensureTicket]);

  if (!open || status !== "authenticated") {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-zinc-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-dialog-title"
    >
      <div className="flex h-[min(100dvh,720px)] w-full max-w-lg flex-col sm:max-h-[85vh] sm:rounded-2xl sm:shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 sm:rounded-t-2xl">
          <h3 id="support-dialog-title" className="text-sm font-semibold text-zinc-900">
            {t("dialogTitle")}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden bg-zinc-100/80 p-2 sm:p-3">
          {loadingTicket ? (
            <div className="flex h-full min-h-[280px] flex-col justify-center gap-4 rounded-xl bg-white px-4 py-6">
              <div className="h-4 w-40 animate-pulse rounded-md bg-zinc-200" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-100" />
              <div className="h-12 max-w-[75%] animate-pulse rounded-xl bg-orange-100/80" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-100" />
            </div>
          ) : ticketError ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-4 rounded-xl bg-white px-4 text-center">
              <p className="text-sm text-zinc-700">{t("ticketLoadError")}</p>
              {ticketErrorDetail ? (
                <pre className="max-h-32 max-w-full overflow-auto rounded-lg bg-zinc-100 px-3 py-2 text-left text-[11px] leading-snug text-zinc-800">
                  {ticketErrorDetail}
                </pre>
              ) : null}
              <button
                type="button"
                onClick={() => void ensureTicket()}
                className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                {t("retryTicket")}
              </button>
            </div>
          ) : ticketId && showFeedback ? (
            <div className="flex h-full min-h-[280px] flex-col rounded-xl bg-white p-4 sm:p-5">
              <h4 className="text-base font-semibold text-zinc-900">{t("feedbackTitle")}</h4>
              <p className="mt-1 text-sm text-zinc-600">{t("feedbackBody")}</p>

              <p className="mt-4 text-sm font-medium text-zinc-800">{t("feedbackRatingLabel")}</p>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100"
                    aria-label={t("feedbackStarAria", { count: value })}
                  >
                    <Star
                      className={`h-6 w-6 ${value <= rating ? "fill-amber-400 text-amber-500" : "text-zinc-300"}`}
                    />
                  </button>
                ))}
              </div>

              <p className="mt-4 text-sm font-medium text-zinc-800">{t("feedbackSatisfiedLabel")}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSatisfied(true)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    satisfied === true
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-zinc-200 bg-white text-zinc-700"
                  }`}
                >
                  {t("feedbackSatisfiedYes")}
                </button>
                <button
                  type="button"
                  onClick={() => setSatisfied(false)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    satisfied === false
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-zinc-200 bg-white text-zinc-700"
                  }`}
                >
                  {t("feedbackSatisfiedNo")}
                </button>
              </div>

              {feedbackError ? <p className="mt-3 text-xs text-red-600">{feedbackError}</p> : null}
              {feedbackThanks ? <p className="mt-3 text-xs text-emerald-700">{t("feedbackThanks")}</p> : null}

              <div className="mt-auto flex gap-2 pt-6">
                <button
                  type="button"
                  onClick={onDismissAction}
                  className="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-700"
                >
                  {t("feedbackSkip")}
                </button>
                <button
                  type="button"
                  onClick={() => void submitFeedback()}
                  disabled={feedbackSending}
                  className="flex-1 rounded-xl bg-orange-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {feedbackSending ? t("feedbackSending") : t("feedbackSubmit")}
                </button>
              </div>
            </div>
          ) : ticketId ? (
            <SupportLiveChat variant="user" ticketId={ticketId} onThreadHasMessagesAction={setThreadHasMessages} />
          ) : (
            <div className="flex h-full min-h-[280px] flex-col justify-center gap-4 rounded-xl bg-white px-4 py-6">
              <div className="h-4 w-36 animate-pulse rounded-md bg-zinc-200" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-100" />
              <div className="h-12 max-w-[70%] animate-pulse rounded-xl bg-zinc-100" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
