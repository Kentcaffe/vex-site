"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const links = [
  { href: "/admin", labelKey: "navDashboard" as const },
  { href: "/admin/listings", labelKey: "navListings" as const },
  { href: "/admin/reports", labelKey: "navReports" as const },
];

export function AdminSidebar() {
  const t = useTranslations("Admin");
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40 lg:w-52 lg:border-b-0 lg:border-r">
      <nav className="flex flex-wrap gap-1 p-3 lg:flex-col">
        {links.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
