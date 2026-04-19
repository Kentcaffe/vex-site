"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Headphones, Loader2, Send, Shield } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { SupportMessageDTO } from "@/lib/support-chat";

type Props = {
  variant: "user" | "staff";
  ticketId: string;
  /** Pentru afișare antet admin */
  userEmail?: string | null;
};

function formatTime(iso: string, locale: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function SupportLiveChat({ variant, ticketId, userEmail }: Props) {
  const t = useTranslations("Support");
  const [locale, setLocale] = useState("ro");
  const [messages, setMessages] = useState<SupportMessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [live, setLive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setLocale(document.documentElement.lang || "ro");
    }
  }, []);

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/support/messages?ticketId=${encodeURIComponent(ticketId)}`, {
      credentials: "include",
    });
    const data = (await res.json().catch(() => ({}))) as {
      messages?: SupportMessageDTO[];
      message?: string;
      debug?: { message?: string };
    };
    if (!res.ok) {
      const detail =
        typeof data.message === "string"
          ? data.message
          : typeof data.debug?.message === "string"
            ? data.debug.message
            : null;
      throw new Error(detail ?? "load_failed");
    }
    setMessages(data.messages ?? []);
  }, [ticketId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadMessages();
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error && err.message !== "load_failed" ? err.message : t("loadError");
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMessages, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  /** Realtime + fallback polling */
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`support-ticket-${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        () => {
          void loadMessages();
        },
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("[SupportLiveChat] Supabase Realtime subscribe error:", err.message, err);
        }
        setLive(status === "SUBSCRIBED");
      });

    pollRef.current = setInterval(() => {
      void loadMessages();
    }, 4500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      void supabase.removeChannel(channel);
      setLive(false);
    };
  }, [ticketId, loadMessages]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/support/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, body }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        messages?: SupportMessageDTO[];
        message?: string;
        debug?: { message?: string };
      };
      if (!res.ok) {
        const detail =
          typeof data.message === "string"
            ? data.message
            : typeof data.debug?.message === "string"
              ? data.debug.message
              : null;
        throw new Error(detail ?? "send_failed");
      }
      setMessages(data.messages ?? []);
      setDraft("");
    } catch (err) {
      const msg = err instanceof Error && err.message !== "send_failed" ? err.message : t("sendError");
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-2xl border border-zinc-200/90 bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.18)]">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-orange-50/40 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md">
            <Headphones className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-zinc-900">{t("panelTitle")}</p>
            <p className="truncate text-xs text-zinc-500">
              {variant === "staff" && userEmail ? userEmail : t("panelSubtitle")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 ring-1 ring-zinc-200/80">
          <span
            className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-400"}`}
            aria-hidden
          />
          {live ? t("statusLive") : t("statusSync")}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-zinc-50/50 px-3 py-4 sm:px-4">
        {loading ? (
          <div className="flex justify-center py-12 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <p className="px-2 text-center text-sm leading-relaxed text-zinc-500">{t("emptyThread")}</p>
            ) : null}
            {messages.map((m) => {
              const isStaffMsg = m.senderRole === "ADMIN";
              const isMine = variant === "user" ? !isStaffMsg : isStaffMsg;
              const bubble =
                variant === "user"
                  ? isStaffMsg
                    ? "rounded-2xl rounded-bl-md border border-orange-100/90 bg-white text-zinc-800 shadow-sm"
                    : "rounded-2xl rounded-br-md bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md"
                  : isStaffMsg
                    ? "rounded-2xl rounded-br-md bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md"
                    : "rounded-2xl rounded-bl-md border border-zinc-200 bg-white text-zinc-800 shadow-sm";
              const timeMuted = variant === "user" ? (isStaffMsg ? "text-zinc-400" : "text-orange-100") : isStaffMsg ? "text-orange-100" : "text-zinc-400";
              return (
                <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[min(100%,20rem)] px-3.5 py-2.5 text-sm leading-relaxed ${bubble}`}>
                    {variant === "user" && isStaffMsg ? (
                      <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-orange-700/90">
                        <Shield className="h-3 w-3" aria-hidden />
                        {t("staffBadge")}
                      </p>
                    ) : null}
                    {variant === "staff" && !isStaffMsg ? (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{t("userBadge")}</p>
                    ) : null}
                    {variant === "staff" && isStaffMsg ? (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-orange-100/90">{t("youStaffBadge")}</p>
                    ) : null}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={`mt-1.5 text-[10px] ${timeMuted}`}>{formatTime(m.createdAt, locale)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {error ? (
        <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-center text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="border-t border-zinc-100 bg-white p-3 sm:p-4">
        <div className="flex gap-2">
          <label htmlFor="support-chat-input" className="sr-only">
            {t("inputLabel")}
          </label>
          <textarea
            id="support-chat-input"
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={t("placeholder")}
            className="min-h-[52px] flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || !draft.trim()}
            className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("send")}
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-zinc-400">{t("hintEnter")}</p>
      </div>
    </div>
  );
}
