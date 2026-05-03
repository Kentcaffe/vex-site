"use client";

import { Fragment, type RefObject } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { sameCalendarDay } from "@/lib/chat-ui";
import type { ChatMessageRow } from "@/lib/chat-merge-messages";

function daySeparatorLabel(d: Date, locale: string, labelToday: string, labelYesterday: string): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameCalendarDay(d, today)) return labelToday;
  if (sameCalendarDay(d, yesterday)) return labelYesterday;
  return d.toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric" });
}

type Props = {
  messages: ChatMessageRow[];
  currentUserId: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  myAvatarUrl: string | null;
  scrollRef: RefObject<HTMLDivElement | null>;
  bottomRef: RefObject<HTMLDivElement | null>;
  onScrollAction: () => void;
  showNewMessagesBanner: boolean;
  onJumpToLatestAction: () => void;
};

export function ChatMessages({
  messages,
  currentUserId,
  otherUserName,
  otherUserAvatarUrl,
  myAvatarUrl,
  scrollRef,
  bottomRef,
  onScrollAction,
  showNewMessagesBanner,
  onJumpToLatestAction,
}: Props) {
  const t = useTranslations("Chat");
  const locale = useLocale();
  const list = Array.isArray(messages) ? messages : [];

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#f1f5f9]">
      <div
        ref={scrollRef}
        onScroll={onScrollAction}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-3 py-4 pb-2 [-webkit-overflow-scrolling:touch]"
      >
        {list.length === 0 ? (
          <p className="mx-auto max-w-sm py-8 text-center text-sm text-slate-500">{t("emptyThread")}</p>
        ) : (
          <ul className="space-y-1">
            {list.map((m, i) => {
              const mine = m.senderId === currentUserId;
              const d = new Date(m.createdAt);
              const prev = i > 0 ? new Date(list[i - 1]!.createdAt) : null;
              const showDay = !prev || !sameCalendarDay(d, prev);
              const timeStr = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

              return (
                <Fragment key={m.id}>
                  {showDay ? (
                    <li className="my-4 flex justify-center first:mt-0">
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
                        {daySeparatorLabel(d, locale, t("today"), t("yesterday"))}
                      </span>
                    </li>
                  ) : null}
                  <li className={`flex gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}>
                    <div className="mt-0.5 shrink-0" aria-hidden>
                      {mine ? (
                        <ChatAvatar url={myAvatarUrl} name={t("youLabel")} size={36} />
                      ) : (
                        <ChatAvatar url={otherUserAvatarUrl} name={otherUserName} size={36} />
                      )}
                    </div>
                    <div className={`max-w-[85%] md:max-w-[72%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug shadow-sm ${
                          mine
                            ? "rounded-br-md bg-emerald-500 text-white"
                            : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      </div>
                      <time
                        dateTime={m.createdAt}
                        className={`mt-1 block px-1 text-[10px] tabular-nums text-slate-400 ${mine ? "text-right" : ""}`}
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
            className="pointer-events-auto rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 shadow-md transition hover:bg-slate-50"
            onClick={onJumpToLatestAction}
          >
            {t("newMessagesBanner")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
