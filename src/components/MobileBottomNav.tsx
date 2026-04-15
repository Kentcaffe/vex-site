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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200/90 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden"
      aria-label={t("bottomNavAria")}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 px-1">
        {items.map(({ href, label, Icon, badge }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold leading-tight transition active:scale-[0.97] motion-safe:transition-transform ${
                  active
                    ? "text-[#0b57d0] dark:text-blue-400"
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
