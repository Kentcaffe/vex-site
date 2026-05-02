"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useOptionalChatSocket } from "@/components/chat/chat-socket-context";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";

type Props = {
  /** Icon rotund în navbar (fără text vizibil). */
  variant?: "default" | "icon";
  className?: string;
};

export function ChatInboxLink({ variant = "default", className }: Props) {
  const { status } = useAuthSession();
  const t = useTranslations("Nav");
  const chat = useOptionalChatSocket();

  if (status !== "authenticated") {
    return null;
  }

  const count = chat?.unreadCount ?? 0;
  const isIcon = variant === "icon";

  return (
    <Link
      href="/chat"
      className={
        className ??
        (isIcon
          ? "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-white text-zinc-600 shadow-sm transition hover:border-[#22c55e]/40 hover:bg-emerald-50/80 hover:text-[#16a34a]"
          : "relative inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-sm font-medium text-[#0b57d0] transition hover:bg-blue-50 hover:text-[#0948ad] dark:text-blue-400 dark:hover:bg-blue-950/50")
      }
    >
      <svg className={isIcon ? "h-5 w-5 opacity-90" : "h-4 w-4 opacity-90"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span className={isIcon ? "sr-only" : ""}>{t("messages")}</span>
      {count > 0 ? (
        <span
          className={
            isIcon
              ? "absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#22c55e] px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white"
              : "absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white dark:ring-zinc-950"
          }
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
