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
      className="fixed bottom-3 left-3 right-3 z-50 rounded-[22px] border border-[var(--mp-border)] bg-[var(--mp-nav-glass)] pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[var(--mp-shadow-lg)] backdrop-blur-xl md:hidden"
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
                    ? "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                    : "text-[var(--mp-text-muted)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative flex h-7 w-7 items-center justify-center">
                  <Icon className="h-6 w-6 shrink-0" strokeWidth={active ? 2.25 : 2} aria-hidden />
                  {badge && badge > 0 ? (
                    <span className="absolute -right-1 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[var(--mp-surface)]">
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
