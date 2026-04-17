"use client";

import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChatAvatar } from "@/components/chat/ChatAvatar";

export type InboxItem = {
  roomId: string;
  listingTitle: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
  unread: boolean;
};

export function ChatInboxList({
  items: itemsProp,
}: {
  items?: InboxItem[] | null;
}) {
  const items = useMemo(() => (Array.isArray(itemsProp) ? itemsProp : []), [itemsProp]);
  const t = useTranslations("Chat");
  const format = useFormatter();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((row) =>
      [row.otherUserName, row.listingTitle, row.lastMessageBody ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [items, query]);

  const unreadTotal = useMemo(() => filtered.filter((row) => row.unread).length, [filtered]);

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-zinc-200 bg-gradient-to-b from-zinc-50/80 to-white px-6 py-14 text-center dark:border-zinc-700 dark:from-zinc-900/50 dark:to-zinc-900">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("inboxEmptyTitle")}</p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t("inboxEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="surface-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block sm:max-w-[360px] sm:flex-1">
          <span className="sr-only">{t("inboxSearchPlaceholder")}</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("inboxSearchPlaceholder")}
            className="field-input h-11 pl-9"
          />
        </label>
        {unreadTotal > 0 ? (
          <span className="inline-flex items-center self-start rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 sm:self-auto">
            {t("unreadBadge", { count: unreadTotal })}
          </span>
        ) : null}
      </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          {t("inboxNoResults")}
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((row) => {
            const unread = row.unread;
            const timeLabel =
              row.lastMessageAt != null
                ? format.relativeTime(new Date(row.lastMessageAt), { now: new Date() })
                : null;

            return (
              <li key={row.roomId}>
                <Link
                  href={`/chat/room/${row.roomId}`}
                  className={`group flex gap-3 rounded-[16px] border p-4 transition ${
                    unread
                      ? "border-emerald-200/80 bg-emerald-50/40 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20"
                      : "border-zinc-200/90 bg-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] hover:border-emerald-300 hover:shadow-[0_22px_50px_-30px_rgba(5,150,105,0.35)] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700"
                  }`}
                >
                  <div className="shrink-0" aria-hidden>
                    <ChatAvatar url={row.otherUserAvatarUrl} name={row.otherUserName} size={48} className="rounded-2xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">{row.otherUserName}</p>
                      {timeLabel ? (
                        <time
                          dateTime={row.lastMessageAt ?? undefined}
                          className={`shrink-0 text-[11px] tabular-nums ${unread ? "font-semibold text-emerald-800 dark:text-emerald-300" : "text-zinc-400"}`}
                        >
                          {timeLabel}
                        </time>
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs font-medium text-[#0b57d0] dark:text-blue-400">
                      {row.listingTitle}
                    </p>
                    {row.lastMessageBody ? (
                      <p
                        className={`mt-1 line-clamp-2 text-sm ${unread ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}
                      >
                        {row.lastMessageBody}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm italic text-zinc-400">{t("noPreviewYet")}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center self-center text-zinc-300 transition group-hover:text-[#0b57d0] dark:text-zinc-600 dark:group-hover:text-blue-400">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
