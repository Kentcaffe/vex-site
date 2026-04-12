"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useOptionalChatSocket } from "@/components/chat/chat-socket-context";

export function ChatInboxLink() {
  const { status } = useSession();
  const t = useTranslations("Nav");
  const chat = useOptionalChatSocket();

  if (status !== "authenticated") {
    return null;
  }

  const count = chat?.unreadCount ?? 0;

  return (
    <Link
      href="/chat"
      className="relative text-sm font-medium text-[#0b57d0] hover:underline dark:text-blue-400"
    >
      {t("messages")}
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
