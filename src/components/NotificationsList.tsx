"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { markAllNotificationsRead, markNotificationRead } from "@/app/actions/user-notifications";
import { useRouter } from "@/i18n/navigation";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

type Props = {
  items: NotificationItem[];
};

export function NotificationsList({ items }: Props) {
  const t = useTranslations("Notifications");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function onMarkRead(id: string) {
    const r = await markNotificationRead(id);
    if (r.ok) router.refresh();
  }

  async function onMarkAll() {
    const r = await markAllNotificationsRead();
    if (r.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.length > 0 ? (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={pending || items.every((i) => i.read)}
            onClick={() => startTransition(() => void onMarkAll())}
            className="text-xs font-medium text-emerald-700 hover:underline disabled:opacity-50 dark:text-emerald-400"
          >
            {t("markAllRead")}
          </button>
        </div>
      ) : null}
      <ul className="space-y-3">
        {items.map((n) => (
          <li
            key={n.id}
            className={`rounded-[14px] border p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] ${
              n.read ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" : "border-emerald-300/80 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">{n.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{n.body}</p>
                <p className="mt-2 text-xs text-zinc-500">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => void onMarkRead(n.id))}
                  className="btn-secondary min-h-[36px] shrink-0 rounded-lg px-3 py-1 text-xs"
                >
                  {t("markRead")}
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
