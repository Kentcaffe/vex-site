"use client";

import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { Search } from "lucide-react";

export type InboxItem = {
  roomId: string;
  listingTitle: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
  unread: boolean;
  isFavorite: boolean;
};

type TabKey = "all" | "unread" | "favorites";

type Props = {
  items: InboxItem[];
  /** Pe mobile, în pagina de cameră, ascundem lista (o afișează ChatLayout). */
  className?: string;
};

export function ConversationList({ items, className = "" }: Props) {
  const t = useTranslations("Chat");
  const format = useFormatter();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabKey>("all");
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

  const toggleFavoriteAction = async (roomId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pendingRoomId) return;
    setPendingRoomId(roomId);
    try {
      const res = await fetch(`/api/chat/room/${encodeURIComponent(roomId)}/favorite`, { method: "POST" });
      const data = (await res.json()) as { ok?: boolean };
      if (res.ok && data.ok) router.refresh();
    } finally {
      setPendingRoomId(null);
    }
  };

  const filtered = useMemo(() => {
    let rows = items;
    if (tab === "unread") rows = rows.filter((r) => r.unread);
    if (tab === "favorites") rows = rows.filter((r) => r.isFavorite);
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.otherUserName, row.listingTitle, row.lastMessageBody ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [items, query, tab]);

  const unreadTotal = useMemo(() => items.filter((row) => row.unread).length, [items]);

  const tabBtn = (key: TabKey, label: string) => (
    <button
      type="button"
      key={key}
      onClick={() => setTab(key)}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        tab === key ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`flex h-full min-h-[320px] flex-col ${className}`}>
      <div className="border-b border-slate-100 p-4">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">{t("inboxTitle")}</h2>
        <p className="mt-1 text-xs text-slate-500">{t("inboxSubtitle")}</p>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("inboxSearchPlaceholder")}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none ring-emerald-500/0 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tabBtn("all", t("tabAll"))}
          {tabBtn("unread", t("tabUnread"))}
          {tabBtn("favorites", t("tabFavorites"))}
        </div>
        {unreadTotal > 0 && tab === "all" ? (
          <p className="mt-2 text-[11px] font-medium text-emerald-700">{t("unreadBadge", { count: unreadTotal })}</p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <p className="text-sm font-semibold text-slate-800">{t("inboxEmptyTitle")}</p>
            <p className="mt-2 text-xs text-slate-500">{t("inboxEmpty")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-slate-500">{t("inboxNoResults")}</p>
        ) : (
          <ul className="space-y-1.5">
            {filtered.map((row) => {
              const active = pathname?.includes(`/chat/room/${row.roomId}`) ?? false;
              const timeLabel =
                row.lastMessageAt != null
                  ? format.relativeTime(new Date(row.lastMessageAt), { now: new Date() })
                  : null;
              const isFav = row.isFavorite;
              const busy = pendingRoomId === row.roomId;

              return (
                <li key={row.roomId}>
                  <div className="relative">
                    <Link
                      href={`/chat/room/${row.roomId}`}
                      className={`flex gap-3 rounded-xl border p-3 transition ${
                        active
                          ? "border-emerald-300 bg-emerald-50/80 shadow-sm"
                          : row.unread
                            ? "border-slate-200 bg-white hover:border-emerald-200"
                            : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <ChatAvatar url={row.otherUserAvatarUrl} name={row.otherUserName} size={44} className="rounded-full" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">{row.otherUserName}</p>
                          {timeLabel ? (
                            <time
                              dateTime={row.lastMessageAt ?? undefined}
                              className="shrink-0 text-[10px] tabular-nums text-slate-400"
                            >
                              {timeLabel}
                            </time>
                          ) : null}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] font-medium text-emerald-700">{row.listingTitle}</p>
                        {row.lastMessageBody ? (
                          <p
                            className={`mt-1 line-clamp-2 text-xs ${row.unread ? "font-medium text-slate-900" : "text-slate-600"}`}
                          >
                            {row.lastMessageBody}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs italic text-slate-400">{t("noPreviewYet")}</p>
                        )}
                        {row.unread ? (
                          <span className="mt-1.5 inline-flex items-center rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {t("newBadge")}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                    <button
                      type="button"
                      aria-label={isFav ? t("unfavoriteAria") : t("favoriteAria")}
                      disabled={busy}
                      onClick={(e) => void toggleFavoriteAction(row.roomId, e)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-lg text-amber-500 transition hover:bg-amber-50 disabled:opacity-40"
                    >
                      {isFav ? "★" : "☆"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
