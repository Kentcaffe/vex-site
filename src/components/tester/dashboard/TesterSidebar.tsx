"use client";

import type { LucideIcon } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { TesterSidebarChatLink, TesterSidebarNavItem } from "@/components/tester/dashboard/TesterSidebarNavItem";

export type TesterSidebarItem = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
};

type Props = {
  items: TesterSidebarItem[];
  chatLabel: string;
  chatHref: string;
};

function isSidebarItemActive(pathname: string, item: TesterSidebarItem): boolean {
  if (item.href === "/tester/dashboard") {
    return pathname === "/tester/dashboard" || pathname === "/tester" || pathname === "/tester/";
  }
  if (item.href === "/cont/setari") {
    return pathname === "/cont/setari" || pathname.startsWith("/cont/setari/");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function TesterSidebar({ items, chatLabel, chatHref }: Props) {
  const t = useTranslations("TesterDashboard.nav");
  const pathname = usePathname();
  const isChat = pathname === "/tester/chat" || pathname.startsWith("/tester/chat/");

  return (
    <>
      <aside className="hidden shrink-0 lg:block lg:w-[220px]">
        <div className="sticky top-24 space-y-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2 shadow-xl shadow-black/40 backdrop-blur-xl">
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t("menuSection")}</p>
          {items.map((item) => (
            <TesterSidebarNavItem
              key={item.id}
              variant="desktop"
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isSidebarItemActive(pathname, item)}
            />
          ))}
          <div className="my-2 border-t border-white/[0.06]" />
          <TesterSidebarChatLink variant="desktop" href={chatHref} label={chatLabel} icon={MessageCircle} active={isChat} />
        </div>
      </aside>

      <nav
        aria-label="Tester navigation"
        className="-mx-1 flex gap-2 overflow-x-auto pb-2 lg:hidden [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item) => (
          <TesterSidebarNavItem
            key={item.id}
            variant="mobile"
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isSidebarItemActive(pathname, item)}
          />
        ))}
        <TesterSidebarChatLink variant="mobile" href={chatHref} label={chatLabel} icon={MessageCircle} active={isChat} />
      </nav>
    </>
  );
}
