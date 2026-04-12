"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type InboxItem = {
  roomId: string;
  listingTitle: string;
  otherUserName: string;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
  lastSenderId: string | null;
};

export function ChatInboxList({
  items,
  currentUserId,
}: {
  items: InboxItem[];
  currentUserId: string;
}) {
  const t = useTranslations("Chat");

  if (items.length === 0) {
    return (
      <p className="mt-8 rounded border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
        {t("inboxEmpty")}
      </p>
    );
  }

  return (
    <ul className="mt-6 space-y-2">
      {items.map((row) => {
        const unreadHint = row.lastSenderId && row.lastSenderId !== currentUserId;
        return (
          <li key={row.roomId}>
            <Link
              href={`/chat/room/${row.roomId}`}
              className={`block rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-[#0b57d0]/40 dark:border-zinc-800 dark:bg-zinc-900 ${
                unreadHint ? "ring-1 ring-emerald-500/20" : ""
              }`}
            >
              <p className="text-xs text-zinc-500">{row.listingTitle}</p>
              <p className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-50">{row.otherUserName}</p>
              {row.lastMessageBody ? (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{row.lastMessageBody}</p>
              ) : null}
              {row.lastMessageAt ? (
                <p className="mt-2 text-[11px] text-zinc-400">
                  {new Date(row.lastMessageAt).toLocaleString()}
                </p>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
