"use client";

import { Link } from "@/i18n/navigation";
import { ArrowLeft, Search } from "lucide-react";

type Props = {
  backLabel: string;
  backHref: string;
  title: string;
  subtitle: string;
  onlineBadge: string;
  searchPlaceholder: string;
  search: string;
  /** Client callback; sufix `Action` = convenție Next `ts(71007)` (nu e Server Action). */
  onSearchChangeAction: (v: string) => void;
};

export function TesterChatHeader({
  backLabel,
  backHref,
  title,
  subtitle,
  onlineBadge,
  searchPlaceholder,
  search,
  onSearchChangeAction,
}: Props) {
  return (
    <header className="shrink-0 space-y-4 border-b border-white/[0.08] px-4 py-4 sm:px-5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400/90 transition hover:text-emerald-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        {backLabel}
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {onlineBadge}
          </div>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChangeAction(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none ring-violet-500/0 transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
      </div>
    </header>
  );
}
