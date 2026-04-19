"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";
import { SupportLiveChat } from "@/components/support/SupportLiveChat";

type Props = {
  open: boolean;
  onDismissAction: () => void;
};

/** Modal live support reutilizabil (Contact + Cont). */
export function SupportChatModal({ open, onDismissAction }: Props) {
  const t = useTranslations("Support");
  const { status } = useAuthSession();
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [ticketError, setTicketError] = useState(false);
  const [ticketErrorDetail, setTicketErrorDetail] = useState<string | null>(null);

  const ensureTicket = useCallback(async () => {
    setLoadingTicket(true);
    setTicketError(false);
    setTicketErrorDetail(null);
    try {
      const res = await fetch("/api/support/ticket", { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as {
        ticket?: { id: string };
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
      setTicketId(data.ticket.id);
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
    }
  }, [open]);

  useEffect(() => {
    if (!open || status !== "authenticated") return;
    if (ticketId) return;
    if (ticketError) return;
    void ensureTicket();
  }, [open, status, ticketId, ticketError, ensureTicket]);

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
            onClick={onDismissAction}
            className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden bg-zinc-100/80 p-2 sm:p-3">
          {loadingTicket ? (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-xl bg-white">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" aria-hidden />
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
          ) : ticketId ? (
            <SupportLiveChat variant="user" ticketId={ticketId} />
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-xl bg-white">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" aria-hidden />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
