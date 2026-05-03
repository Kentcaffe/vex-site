"use client";

import type { LucideIcon } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

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

export function TesterSidebar({ items, chatLabel, chatHref }: Props) {
  const t = useTranslations("TesterDashboard.nav");
  const pathname = usePathname();
  const isChat = pathname === "/tester/chat" || pathname.startsWith("/tester/chat/");
  const isTesterRoot = pathname === "/tester" || pathname === "/tester/";

  function isActive(item: TesterSidebarItem): boolean {
    if (item.href === "/tester") {
      return isTesterRoot;
    }
    if (item.href.startsWith("/tester#")) {
      return false;
    }
    if (item.href === "/cont") {
      return pathname === "/cont" || pathname.startsWith("/cont/");
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  const linkBase =
    "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200";
  const inactive = "text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white";
  const active =
    "border-emerald-500/40 bg-gradient-to-r from-violet-600/25 to-emerald-600/20 text-white shadow-[0_0_24px_-8px_rgba(16,185,129,0.45)]";

  function renderItem(item: TesterSidebarItem) {
    const Icon = item.icon;
    const on = isActive(item);
    const hashLink = item.href.includes("#");
    return (
      <Link
        key={item.id}
        href={item.href}
        scroll={hashLink ? false : undefined}
        className={`${linkBase} ${on ? active : inactive}`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
            on ? "bg-emerald-500/20 text-emerald-200" : "bg-white/[0.06] text-slate-300 group-hover:bg-violet-500/20 group-hover:text-violet-200"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <>
      <aside className="hidden shrink-0 lg:block lg:w-[220px]">
        <div className="sticky top-24 space-y-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2 shadow-xl shadow-black/40 backdrop-blur-xl">
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t("menuSection")}</p>
          {items.map(renderItem)}
          <div className="my-2 border-t border-white/[0.06]" />
          <Link href={chatHref} className={`${linkBase} ${isChat ? active : inactive}`}>
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isChat ? "bg-emerald-500/20 text-emerald-200" : "bg-white/[0.06] text-slate-300 group-hover:bg-violet-500/20 group-hover:text-violet-200"
              }`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
            </span>
            <span>{chatLabel}</span>
          </Link>
        </div>
      </aside>

      <nav
        aria-label="Tester navigation"
        className="-mx-1 flex gap-2 overflow-x-auto pb-2 lg:hidden [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const on = isActive(item);
          return (
            <Link
              key={item.id}
              href={item.href}
              scroll={item.href.includes("#") ? false : undefined}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                on ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-100" : "border-white/10 bg-white/[0.06] text-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
        <Link
          href={chatHref}
          className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
            isChat ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-100" : "border-white/10 bg-white/[0.06] text-slate-300"
          }`}
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          {chatLabel}
        </Link>
      </nav>
    </>
  );
}
