"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Headphones, MessageCircle, Sparkles, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";
import { SupportLiveChat } from "@/components/support/SupportLiveChat";

export function SupportContactLauncher() {
  const t = useTranslations("Support");
  const { status } = useAuthSession();
  const [open, setOpen] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [ticketError, setTicketError] = useState(false);
  /** Mesaj Prisma/DB din `debug` când `SUPPORT_API_DEBUG=1` pe server (sau dev). */
  const [ticketErrorDetail, setTicketErrorDetail] = useState<string | null>(null);

  const ensureTicket = useCallback(async () => {
    setLoadingTicket(true);
    setTicketError(false);
    setTicketErrorDetail(null);
    try {
      const res = await fetch("/api/support/ticket", { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as {
        ticket?: { id: string };
        debug?: { message?: string };
      };
      if (!res.ok) {
        const msg = typeof data.debug?.message === "string" ? data.debug.message : null;
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

  async function handleOpen() {
    setOpen(true);
    if (status === "authenticated" && !ticketId) {
      await ensureTicket();
    }
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <section
        className="relative mt-12 overflow-hidden rounded-3xl border border-orange-200/60 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/50 p-6 shadow-[0_20px_50px_-12px_rgba(234,88,12,0.2)] sm:p-8"
        aria-labelledby="support-live-heading"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-400/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" aria-hidden />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25">
              <Headphones className="h-7 w-7" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-700 ring-1 ring-orange-200/80">
                <Sparkles className="h-3 w-3" aria-hidden />
                {t("liveBadge")}
              </p>
              <h2 id="support-live-heading" className="mt-2 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                {t("contactSectionTitle")}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">{t("contactSectionLead")}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col xl:flex-row">
            {status === "loading" ? (
              <div className="h-12 w-full animate-pulse rounded-2xl bg-zinc-200/80 sm:w-48" />
            ) : status === "authenticated" ? (
              <button
                type="button"
                onClick={() => void handleOpen()}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                {t("openChat")}
              </button>
            ) : (
              <Link
                href="/cont"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-orange-200 bg-white px-6 text-base font-semibold text-orange-800 shadow-sm transition hover:border-orange-300 hover:bg-orange-50/80"
              >
                {t("loginToChat")}
              </Link>
            )}
            <p className="text-center text-xs text-zinc-500 sm:max-w-[14rem] sm:text-left lg:text-center xl:text-left">
              {t("contactSectionHint")}
            </p>
          </div>
        </div>
      </section>

      {open && status === "authenticated" ? (
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
      ) : null}
    </>
  );
}
