"use client";

import { useTranslations } from "next-intl";
import { Home, LayoutGrid, MessageCircle, Plus, User } from "lucide-react";
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
    fab?: boolean;
  }[] = [
    { href: "/", label: t("home"), Icon: Home },
    { href: "/categorii", label: t("categories"), Icon: LayoutGrid },
    { href: "/publica", label: t("bottomNavPublish"), Icon: Plus, fab: true },
    { href: "/chat", label: t("messages"), Icon: MessageCircle, badge: unread },
    { href: "/cont", label: t("account"), Icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 overflow-visible border-t border-[var(--mp-border)] bg-[var(--mp-nav-solid)] shadow-[0_-6px_28px_rgb(17_24_39_/_0.1)] md:hidden"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom, 0px))" }}
      aria-label={t("bottomNavAria")}
    >
      <ul className="mx-auto flex min-h-[72px] max-w-lg items-end justify-between gap-0.5 px-3 pb-1 pt-2">
        {items.map(({ href, label, Icon, badge, fab }) => {
          const active = isActive(pathname, href);
          if (fab) {
            return (
              <li key={href} className="relative flex min-w-0 flex-1 flex-col items-center justify-end">
                <Link
                  href={href}
                  className="flex w-full flex-col items-center gap-1 pb-1"
                  aria-current={active ? "page" : undefined}
                >
                  <span className="flex h-[52px] w-[52px] -translate-y-1 items-center justify-center rounded-full bg-gradient-to-br from-[#ea580c] to-[#c2410c] text-white shadow-[var(--mp-shadow-lg)] ring-[3px] ring-[var(--mp-nav-solid)] transition active:scale-95">
                    <Icon className="h-7 w-7 shrink-0" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="line-clamp-2 w-full max-w-[4.5rem] text-center text-[13px] font-semibold leading-tight text-zinc-800">
                    {label}
                  </span>
                </Link>
              </li>
            );
          }
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                className={`flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-[14px] px-1 py-1.5 text-sm font-semibold leading-tight transition active:scale-[0.98] ${
                  active ? "bg-orange-100 text-[#9a3412]" : "text-zinc-700"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                  <Icon className="h-6 w-6 shrink-0" strokeWidth={active ? 2.25 : 2} aria-hidden />
                  {badge && badge > 0 ? (
                    <span className="absolute -right-1.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c2410c] px-1 text-[11px] font-bold leading-none text-white ring-2 ring-[var(--mp-nav-solid)]">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </span>
                <span className="line-clamp-2 w-full max-w-[4.5rem] text-center text-[13px] leading-tight">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
