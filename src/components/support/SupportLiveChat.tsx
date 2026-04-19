"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Headphones, Loader2, Send, Shield } from "lucide-react";
import {
  playIncomingChatSound,
  requestChatNotificationPermission,
  showNewChatMessageNotification,
} from "@/lib/chat-notifications-client";
import { SUPPORT_SYSTEM_BODY_TICKET_REGISTERED, type SupportMessageDTO } from "@/lib/support-chat-types";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type Props = {
  variant: "user" | "staff";
  ticketId: string;
  /** Pentru afișare antet admin */
  userEmail?: string | null;
  onThreadHasMessagesAction?: (hasMessages: boolean) => void;
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

function resolveMessageBody(m: SupportMessageDTO, translate: (key: string) => string): string {
  if (m.senderRole === "SYSTEM" && m.body === SUPPORT_SYSTEM_BODY_TICKET_REGISTERED) {
    return translate("systemTicketRegistered");
  }
  return m.body;
}

export function SupportLiveChat({ variant, ticketId, userEmail, onThreadHasMessagesAction }: Props) {
  const t = useTranslations("Support");
  const [locale, setLocale] = useState("ro");
  const [messages, setMessages] = useState<SupportMessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [live, setLive] = useState(false);
  /** Moderator vizibil în chat (broadcast) — doar perspectivă user. */
  const [staffOnline, setStaffOnline] = useState(false);
  const [staffTyping, setStaffTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | null>(null);
  const channelReadyRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSeenMessageIdRef = useRef<string | null>(null);
  const initialSyncDoneRef = useRef(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setLocale(document.documentElement.lang || "ro");
    }
  }, []);

  useEffect(() => {
    if (variant === "user") {
      requestChatNotificationPermission();
    }
  }, [variant]);

  useEffect(() => {
    initialSyncDoneRef.current = false;
    lastSeenMessageIdRef.current = null;
  }, [ticketId]);

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

  /** Notificare + sunet când moderatorul răspunde (perspectivă user). */
  useEffect(() => {
    if (loading || variant !== "user" || messages.length === 0) {
      return;
    }
    const last = messages[messages.length - 1];
    if (!initialSyncDoneRef.current) {
      initialSyncDoneRef.current = true;
      lastSeenMessageIdRef.current = last.id;
      return;
    }
    if (last.id === lastSeenMessageIdRef.current) {
      return;
    }
    if (last.senderRole === "ADMIN") {
      const preview = last.body.length > 120 ? `${last.body.slice(0, 117)}…` : last.body;
      const inBackground = typeof document !== "undefined" && (document.hidden || !document.hasFocus());
      if (inBackground) {
        showNewChatMessageNotification(t("supportReplyNotificationTitle"), preview, "vex-support-reply");
        playIncomingChatSound();
      }
    }
    lastSeenMessageIdRef.current = last.id;
  }, [loading, messages, t, variant]);

  useEffect(() => {
    onThreadHasMessagesAction?.(messages.length > 0);
  }, [messages.length, onThreadHasMessagesAction]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, staffTyping, staffOnline]);

  /** Realtime: postgres + broadcast (prezență moderator, typing) + polling de rezervă. */
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    channelReadyRef.current = false;
    const channel = supabase.channel(`support-ticket-${ticketId}`, {
      config: { broadcast: { ack: false } },
    });
    channelRef.current = channel;

    channel.on("broadcast", { event: "staff_join" }, () => {
      if (variant === "user") {
        setStaffOnline(true);
      }
    });
    channel.on("broadcast", { event: "staff_leave" }, () => {
      if (variant === "user") {
        setStaffOnline(false);
        setStaffTyping(false);
      }
    });
    channel.on("broadcast", { event: "staff_typing" }, ({ payload }) => {
      if (variant !== "user") {
        return;
      }
      const active = Boolean((payload as { active?: boolean })?.active);
      setStaffTyping(active);
    });

    /** User intră în chat după moderator: cere retrimitere prezență. */
    channel.on("broadcast", { event: "user_ping" }, () => {
      if (variant === "staff" && channelReadyRef.current) {
        void channel.send({ type: "broadcast", event: "staff_join", payload: {} });
      }
    });

    channel.on(
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
    );

    channel.subscribe((status, err) => {
      if (err) {
        console.error("[SupportLiveChat] Supabase Realtime subscribe error:", err.message, err);
      }
      const ok = status === "SUBSCRIBED";
      setLive(ok);
      channelReadyRef.current = ok;
      if (ok && variant === "staff") {
        void channel.send({ type: "broadcast", event: "staff_join", payload: {} });
      }
      if (ok && variant === "user") {
        void channel.send({ type: "broadcast", event: "user_ping", payload: {} });
      }
    });

    pollRef.current = setInterval(() => {
      void loadMessages();
    }, 12000);

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (variant === "staff") {
        void channel.send({ type: "broadcast", event: "staff_leave", payload: {} });
      }
      channelReadyRef.current = false;
      channelRef.current = null;
      void supabase.removeChannel(channel);
      setLive(false);
      setStaffOnline(false);
      setStaffTyping(false);
    };
  }, [ticketId, variant, loadMessages]);

  const broadcastStaffTyping = useCallback(
    (active: boolean) => {
      const ch = channelRef.current;
      if (!ch || !channelReadyRef.current || variant !== "staff") {
        return;
      }
      void ch.send({ type: "broadcast", event: "staff_typing", payload: { active } });
    },
    [variant],
  );

  function onDraftChange(value: string) {
    setDraft(value);
    if (variant !== "staff") {
      return;
    }
    if (!channelReadyRef.current) {
      return;
    }
    broadcastStaffTyping(true);
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      broadcastStaffTyping(false);
      typingTimerRef.current = null;
    }, 2000);
  }

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    broadcastStaffTyping(false);
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
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.18)]">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-orange-50/40 px-4 py-3.5 sm:px-5">
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
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {variant === "user" && staffOnline ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200/90 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-800/60">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden />
              {t("moderatorOnlineBadge")}
            </span>
          ) : null}
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 ring-1 ring-zinc-200/80">
            <span
              className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-400"}`}
              aria-hidden
            />
            {live ? t("statusLive") : t("statusSync")}
          </div>
        </div>
      </div>

      {variant === "user" && staffOnline ? (
        <div className="shrink-0 border-b border-emerald-100/80 bg-emerald-50/90 px-4 py-2.5 text-center text-xs font-medium text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/35 dark:text-emerald-100">
          {t("moderatorJoinedBanner")}
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-zinc-50/50 px-3 py-4 sm:px-4 [-webkit-overflow-scrolling:touch]"
      >
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
              const isSystem = m.senderRole === "SYSTEM";
              if (isSystem) {
                return (
                  <div key={m.id} className="support-msg-enter flex justify-center px-1">
                    <div className="max-w-[min(100%,28rem)] rounded-2xl border border-dashed border-zinc-200/90 bg-zinc-100/80 px-4 py-3 text-center dark:border-zinc-600/60 dark:bg-zinc-800/50">
                      <p className="mb-2 inline-flex items-center justify-center gap-1 rounded-full bg-zinc-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                        {t("systemBadge")}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm italic leading-relaxed text-zinc-600 dark:text-zinc-300">
                        {resolveMessageBody(m, t)}
                      </p>
                      <p className="mt-2 text-[10px] text-zinc-400">{formatTime(m.createdAt, locale)}</p>
                    </div>
                  </div>
                );
              }

              const isStaffMsg = m.senderRole === "ADMIN";
              const isMine = variant === "user" ? !isStaffMsg : isStaffMsg;
              const bubble =
                variant === "user"
                  ? isStaffMsg
                    ? "rounded-2xl rounded-bl-md border border-orange-200/90 bg-gradient-to-br from-orange-50 to-amber-50/90 text-zinc-900 shadow-sm ring-1 ring-orange-100/80 dark:border-orange-900/40 dark:from-orange-950/40 dark:to-amber-950/30 dark:text-zinc-100 dark:ring-orange-900/30"
                    : "rounded-2xl rounded-br-md bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md"
                  : isStaffMsg
                    ? "rounded-2xl rounded-br-md bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md"
                    : "rounded-2xl rounded-bl-md border border-zinc-200 bg-white text-zinc-800 shadow-sm dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-100";

              const timeMuted =
                variant === "user"
                  ? isStaffMsg
                    ? "text-zinc-500 dark:text-zinc-400"
                    : "text-orange-100"
                  : isStaffMsg
                    ? "text-orange-100"
                    : "text-zinc-400";

              return (
                <div key={m.id} className={`support-msg-enter flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[min(100%,22rem)] px-3.5 py-2.5 text-sm leading-relaxed ${bubble}`}>
                    {variant === "user" && isStaffMsg ? (
                      <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-orange-800 dark:text-orange-200/90">
                        <Shield className="h-3 w-3 shrink-0" aria-hidden />
                        {t("staffBadge")}
                      </p>
                    ) : null}
                    {variant === "staff" && !isStaffMsg ? (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{t("userBadge")}</p>
                    ) : null}
                    {variant === "staff" && isStaffMsg ? (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-orange-100/90">{t("youStaffBadge")}</p>
                    ) : null}
                    <p className="whitespace-pre-wrap break-words">{resolveMessageBody(m, t)}</p>
                    <p className={`mt-1.5 text-[10px] ${timeMuted}`}>{formatTime(m.createdAt, locale)}</p>
                  </div>
                </div>
              );
            })}
            {variant === "user" && staffTyping ? (
              <div className="flex justify-start pl-1">
                <p className="animate-pulse text-xs italic text-zinc-500 dark:text-zinc-400">{t("moderatorTyping")}</p>
              </div>
            ) : null}
            <div ref={bottomRef} className="h-px shrink-0" />
          </>
        )}
      </div>

      {error ? (
        <p className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-2 text-center text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="shrink-0 border-t border-zinc-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
        <div className="flex gap-2">
          <label htmlFor="support-chat-input" className="sr-only">
            {t("inputLabel")}
          </label>
          <textarea
            id="support-chat-input"
            rows={2}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
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
