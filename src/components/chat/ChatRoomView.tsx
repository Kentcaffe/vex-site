"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { normalizeRealtimeInsert } from "@/lib/chat-message-payload";
import {
  playIncomingChatSound,
  requestChatNotificationPermission,
  showNewChatMessageNotification,
} from "@/lib/chat-notifications-client";
import { sameCalendarDay } from "@/lib/chat-ui";
import { sortChatMessages, upsertChatMessagesSorted, type ChatMessageRow } from "@/lib/chat-merge-messages";
import { listingSeoPath } from "@/lib/seo";
import { tryCreateSupabaseBrowserClient } from "@/lib/supabase";

export type ChatBootstrap = {
  roomId: string;
  listing: { id: string; title: string };
  seller: { id: string; name: string; avatarUrl: string | null };
  buyer?: { id: string; name: string; avatarUrl: string | null };
  meIsBuyer: boolean;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  myAvatarUrl: string | null;
  messages: { id: string; senderId: string; body: string; createdAt: string }[];
  otherLastReadAt: string | null;
  myLastReadAt: string | null;
  maxBodyLength: number;
};

type Props = {
  bootstrap: ChatBootstrap;
  currentUserId: string;
};

function daySeparatorLabel(d: Date, locale: string, labelToday: string, labelYesterday: string): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameCalendarDay(d, today)) return labelToday;
  if (sameCalendarDay(d, yesterday)) return labelYesterday;
  return d.toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric" });
}

export function ChatRoomView({ bootstrap, currentUserId }: Props) {
  const t = useTranslations("Chat");
  const locale = useLocale();
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState(() =>
    sortChatMessages(Array.isArray(bootstrap.messages) ? bootstrap.messages : []),
  );
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(bootstrap.otherLastReadAt);
  const [draft, setDraft] = useState("");
  const [showNewMessagesBanner, setShowNewMessagesBanner] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  /** Utilizatorul e aproape de baza listei (scroll automat la mesaje noi). */
  const nearBottomRef = useRef(true);
  const roomId = bootstrap.roomId;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const target = el.scrollHeight - el.clientHeight;
    if (behavior === "smooth" && typeof el.scrollTo === "function") {
      el.scrollTo({ top: target, behavior: "smooth" });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    requestChatNotificationPermission();
  }, []);

  useEffect(() => {
    nearBottomRef.current = true;
    scrollToBottom("auto");
  }, [roomId, scrollToBottom]);

  const updateNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    const near = gap < 96;
    nearBottomRef.current = near;
    if (near) {
      setShowNewMessagesBanner(false);
    }
  }, []);

  const appendIncomingMessage = useCallback(
    (source: "messages" | "ChatMessage", raw: unknown) => {
      const normalized = normalizeRealtimeInsert(raw, source, roomId);
      if (!normalized) {
        return;
      }
      const wasNearBottom = nearBottomRef.current;
      const fromOther = normalized.senderId !== currentUserId;

      const row: ChatMessageRow = {
        id: normalized.id,
        senderId: normalized.senderId,
        body: normalized.body,
        createdAt: normalized.createdAt,
      };
      setMessages((prev) => upsertChatMessagesSorted(prev, row));

      if (fromOther) {
        void fetch(`/api/chat/room/${roomId}/read`, { method: "POST", credentials: "include" });
        setOtherLastReadAt(new Date().toISOString());
      }

      queueMicrotask(() => {
        requestAnimationFrame(() => {
          if (wasNearBottom) {
            scrollToBottom("smooth");
            setShowNewMessagesBanner(false);
          } else if (fromOther) {
            setShowNewMessagesBanner(true);
          }
        });
      });

      if (fromOther) {
        const inBackground = typeof document !== "undefined" && (document.hidden || !document.hasFocus());
        if (inBackground) {
          showNewChatMessageNotification(t("newMessageNotificationTitle"), normalized.body);
          playIncomingChatSound();
        } else if (!wasNearBottom) {
          playIncomingChatSound();
        }
      }
    },
    [currentUserId, roomId, scrollToBottom, t],
  );

  const appendRef = useRef(appendIncomingMessage);
  useEffect(() => {
    appendRef.current = appendIncomingMessage;
  }, [appendIncomingMessage]);

  useEffect(() => {
    const supabase = tryCreateSupabaseBrowserClient();
    if (!supabase) {
      return;
    }
    const channel = supabase
      .channel(`marketplace-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ChatMessage",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          appendRef.current("ChatMessage", payload.new);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          appendRef.current("messages", payload.new);
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    void fetch(`/api/chat/room/${roomId}/read`, { method: "POST", credentials: "include" });
    return () => {
      void supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [roomId]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    const res = await fetch(`/api/chat/room/${roomId}/message`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as {
      message?: { id: string; senderId: string; body: string; createdAt: string };
    };
    if (data.message) {
      nearBottomRef.current = true;
      setShowNewMessagesBanner(false);
      setMessages((prev) => upsertChatMessagesSorted(prev, data.message!));
      queueMicrotask(() => {
        requestAnimationFrame(() => scrollToBottom("smooth"));
      });
    }
    setDraft("");
  }, [draft, roomId, scrollToBottom]);

  const lastOwn = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === currentUserId) {
        return messages[i];
      }
    }
    return null;
  }, [messages, currentUserId]);

  const seenOnLastOwn =
    lastOwn &&
    otherLastReadAt &&
    new Date(otherLastReadAt).getTime() >= new Date(lastOwn.createdAt).getTime();

  const remaining = bootstrap.maxBodyLength - draft.length;

  return (
    <div className="surface-card flex min-h-0 w-full flex-1 flex-col overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5 max-md:min-h-[min(100dvh,720px)] md:min-h-[560px] md:flex-none">
      {/* Header */}
      <div className="flex shrink-0 items-start gap-3 border-b border-[var(--mp-border)] bg-[var(--mp-surface-muted)] px-4 py-3.5">
        <Link
          href="/chat"
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--mp-border)] text-[var(--mp-text-muted)] transition hover:bg-[var(--mp-surface)]"
          aria-label={t("backToInbox")}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <ChatAvatar url={bootstrap.otherUserAvatarUrl} name={bootstrap.otherUserName} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight text-[var(--mp-text)]">
            {bootstrap.otherUserName}
          </p>
          <Link
            href={listingSeoPath({
              id: bootstrap.listing.id,
              title: bootstrap.listing.title,
            })}
            className="mt-0.5 line-clamp-2 text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
          >
            {bootstrap.listing.title}
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                connected
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500 shadow-[0_0_6px_#34d399]" : "bg-amber-400"}`}
              />
              {connected ? t("live") : t("connecting")}
            </span>
          </div>
        </div>
      </div>

      {/* Thread */}
      <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={updateNearBottom}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain bg-[var(--mp-page)] px-3 py-4 pb-[max(1rem,var(--chat-composer-stack))] [-webkit-overflow-scrolling:touch] md:pb-4"
      >
        {(Array.isArray(messages) ? messages : []).length === 0 ? (
          <p className="mx-auto max-w-sm py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("emptyThread")}</p>
        ) : (
          <ul className="space-y-1">
            {(Array.isArray(messages) ? messages : []).map((m, i) => {
              const mine = m.senderId === currentUserId;
              const d = new Date(m.createdAt);
              const prev = i > 0 ? new Date(messages[i - 1].createdAt) : null;
              const showDay = !prev || !sameCalendarDay(d, prev);
              const timeStr = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

              return (
                <Fragment key={m.id}>
                  {showDay ? (
                    <li className="my-4 flex justify-center first:mt-0">
                      <span className="rounded-full bg-zinc-200 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#374151] dark:bg-zinc-700 dark:text-[#d1d5db]">
                        {daySeparatorLabel(d, locale, t("today"), t("yesterday"))}
                      </span>
                    </li>
                  ) : null}
                  <li className={`flex gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}>
                    <div className="mt-0.5 shrink-0" aria-hidden>
                      {mine ? (
                        <ChatAvatar url={bootstrap.myAvatarUrl} name={t("youLabel")} size={32} />
                      ) : (
                        <ChatAvatar url={bootstrap.otherUserAvatarUrl} name={bootstrap.otherUserName} size={32} />
                      )}
                    </div>
                    <div className={`max-w-[min(85%,420px)] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug shadow-sm ${
                          mine
                            ? "rounded-br-md bg-[var(--mp-accent-chat)] text-white"
                            : "rounded-bl-md border border-[var(--mp-border)] bg-[var(--mp-surface)] text-[var(--mp-text)]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      </div>
                      <time
                        dateTime={m.createdAt}
                        className={`mt-1 px-1 text-[10px] tabular-nums ${mine ? "text-[#047857] dark:text-emerald-400" : "text-[#374151] dark:text-[#9ca3af]"}`}
                      >
                        {timeStr}
                      </time>
                    </div>
                  </li>
                </Fragment>
              );
            })}
          </ul>
        )}

        <div ref={bottomRef} className="h-px shrink-0" />
      </div>
      {showNewMessagesBanner ? (
        <div className="pointer-events-none absolute bottom-3 left-0 right-0 z-10 flex justify-center px-3">
          <button
            type="button"
            className="pointer-events-auto rounded-full border border-[var(--mp-border)] bg-[var(--mp-surface)] px-4 py-2 text-xs font-semibold text-[var(--mp-accent)] shadow-md transition hover:bg-[var(--mp-surface-muted)]"
            onClick={() => {
              nearBottomRef.current = true;
              setShowNewMessagesBanner(false);
              scrollToBottom("smooth");
            }}
          >
            {t("newMessagesBanner")}
          </button>
        </div>
      ) : null}
      </div>

      {lastOwn && seenOnLastOwn ? (
        <p className="shrink-0 border-t border-[var(--mp-border)] px-4 py-1.5 text-center text-[11px] text-[var(--mp-text-muted)]">
          {t("seen")}
        </p>
      ) : null}

      {/* Composer — fix deasupra barei de jos pe mobil; în flux pe desktop */}
      <div className="shrink-0 border-t border-[var(--mp-border)] bg-[var(--mp-surface)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-md:fixed max-md:inset-x-0 max-md:bottom-[var(--mobile-nav-reserve)] max-md:z-40 max-md:shadow-[0_-8px_24px_rgb(0_0_0_/_0.08)] md:static md:shadow-none">
        <form
          className="flex gap-2 rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface-muted)] p-1.5 shadow-inner"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={bootstrap.maxBodyLength}
            rows={1}
            placeholder={t("placeholder")}
            className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl bg-transparent px-2.5 py-2.5 text-[15px] text-[var(--mp-text)] placeholder:text-[var(--mp-text-muted)] focus:outline-none focus:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            aria-label={t("placeholder")}
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-xl bg-[var(--mp-accent-chat)] text-white shadow-sm transition hover:bg-[var(--mp-accent-chat-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            title={t("send")}
            aria-label={t("send")}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
        <div className="mt-1.5 flex justify-end px-0.5 text-[11px] tabular-nums text-zinc-400">
          <span className={remaining < 120 ? "text-amber-600 dark:text-amber-400" : ""}>
            {remaining} {t("charsLeft")}
          </span>
        </div>
      </div>
      {/* Spațiu pentru composer-ul fixed (nu ocupă loc în flux) */}
      <div className="shrink-0 md:hidden" style={{ minHeight: "calc(var(--chat-composer-stack) + 2.25rem)" }} aria-hidden />
    </div>
  );
}
