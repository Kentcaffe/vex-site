"use client";

import { useTranslations } from "next-intl";
import { Home, LayoutGrid, MessageCircle, PlusCircle, User } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";
import { useOptionalChatSocket } from "@/components/chat/chat-socket-context";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname === "";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const { status } = useAuthSession();
  const chat = useOptionalChatSocket();
  const unread = status === "authenticated" ? (chat?.unreadCount ?? 0) : 0;

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const items: {
    href: "/" | "/categorii" | "/publica" | "/chat" | "/cont";
    label: string;
    Icon: typeof Home;
    badge?: number;
  }[] = [
    { href: "/", label: t("home"), Icon: Home },
    { href: "/categorii", label: t("categories"), Icon: LayoutGrid },
    { href: "/publica", label: t("bottomNavPublish"), Icon: PlusCircle },
    { href: "/chat", label: t("messages"), Icon: MessageCircle, badge: unread },
    { href: "/cont", label: t("account"), Icon: User },
  ];

  return (
    <nav
      className="fixed bottom-3 left-3 right-3 z-50 rounded-[18px] border border-zinc-200/90 bg-white/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.3)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden"
      aria-label={t("bottomNavAria")}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1 px-1.5">
        {items.map(({ href, label, Icon, badge }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-[14px] px-1 py-1.5 text-[10px] font-semibold leading-tight transition active:scale-[0.97] motion-safe:transition-transform ${
                  active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative flex h-7 w-7 items-center justify-center">
                  <Icon className="h-6 w-6 shrink-0" strokeWidth={active ? 2.25 : 2} aria-hidden />
                  {badge && badge > 0 ? (
                    <span className="absolute -right-1 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-zinc-950">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </span>
                <span className="line-clamp-2 w-full text-center">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
