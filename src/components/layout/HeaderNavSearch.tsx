"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  action: string;
  placeholder: string;
};

/** Căutare compactă în navbar — GET la `action`, același flux ca pe /anunturi. */
export function HeaderNavSearch({ action, placeholder }: Props) {
  const tNav = useTranslations("Nav");
  return (
    <form action={action} method="get" className="relative w-full max-w-xl min-w-0">
      <label htmlFor="nav-header-search" className="sr-only">
        {placeholder}
      </label>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-zinc-400"
        strokeWidth={2}
        aria-hidden
      />
      <input
        id="nav-header-search"
        type="search"
        name="search"
        placeholder={placeholder}
        autoComplete="off"
        className="h-10 w-full min-w-0 rounded-full border border-zinc-200/95 bg-zinc-50/90 py-2 pl-10 pr-11 text-sm text-zinc-900 shadow-[0_10px_30px_rgba(0,0,0,0.05)] outline-none transition placeholder:text-zinc-400 focus:border-[#22c55e]/50 focus:bg-white focus:ring-2 focus:ring-[#22c55e]/20"
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#22c55e] text-white shadow-sm transition hover:bg-[#16a34a]"
        aria-label={tNav("searchSubmit")}
      >
        <Search className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </button>
    </form>
  );
}
