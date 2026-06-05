"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { MOLDOVA_CITIES } from "@/lib/vehicle-taxonomy";

type Props = {
  /** Ex.: `/anunturi` sau `/en/anunturi` */
  action: string;
};

export function HomeHeroSearchForm({ action }: Props) {
  const t = useTranslations("Home.marketplace");
  const tNav = useTranslations("Nav");

  return (
    <form action={action} method="get" className="w-full space-y-5">
      <label htmlFor="home-search" className="sr-only">
        {t("heroSearchPlaceholder")}
      </label>

      <div className="rounded-full border border-zinc-200/90 bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.05)] sm:p-2.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2">
          <div className="relative flex min-h-[54px] min-w-0 flex-1 items-center gap-3 rounded-full border border-zinc-200/70 bg-zinc-50/60 px-3 sm:min-h-[56px] sm:px-4">
            <span
              className="pointer-events-none flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#22c55e] ring-1 ring-emerald-100/80"
              aria-hidden
            >
              <Search className="h-[1.35rem] w-[1.35rem]" strokeWidth={2} />
            </span>
            <input
              id="home-search"
              type="search"
              name="search"
              placeholder={t("heroSearchPlaceholder")}
              className="min-h-[44px] w-full min-w-0 flex-1 border-0 bg-transparent py-2 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none sm:text-[1.05rem]"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[54px] w-full shrink-0 items-center justify-center self-stretch rounded-full bg-[#22c55e] px-8 text-base font-semibold text-white shadow-md shadow-emerald-900/15 transition hover:bg-[#16a34a] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#22c55e]/30 active:scale-[0.99] sm:min-h-[56px] sm:w-auto sm:min-w-[10rem]"
          >
            {tNav("searchSubmit")}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-xl">
        <label className="mb-1.5 block text-center text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="home-hero-city">
          {t("heroCityLabel")}
        </label>
        <input
          id="home-hero-city"
          name="city"
          list="home-hero-city-list"
          className="w-full rounded-full border border-zinc-200/90 bg-white px-4 py-3 text-center text-[15px] text-zinc-900 shadow-[0_10px_30px_rgba(0,0,0,0.04)] placeholder:text-zinc-400 transition focus:border-[#22c55e]/50 focus:outline-none focus:ring-4 focus:ring-[#22c55e]/15"
          placeholder={t("heroCityPlaceholder")}
          autoComplete="off"
        />
        <datalist id="home-hero-city-list">
          {MOLDOVA_CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <p className="text-center text-sm leading-relaxed text-zinc-500">{t("heroExamples")}</p>
    </form>
  );
}
