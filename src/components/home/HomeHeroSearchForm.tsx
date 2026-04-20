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
    <form action={action} method="get" className="w-full space-y-4">
      <label htmlFor="home-search" className="sr-only">
        {t("heroSearchPlaceholder")}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-center sm:gap-3">
        <div className="relative flex min-h-[56px] min-w-0 flex-1 items-center gap-3 rounded-2xl border border-zinc-200/90 bg-white px-3 shadow-inner shadow-zinc-900/[0.03] transition-shadow focus-within:border-orange-300 focus-within:shadow-md focus-within:ring-4 focus-within:ring-orange-500/15 sm:min-h-[58px] sm:px-4">
          <span className="pointer-events-none flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500" aria-hidden>
            <Search className="h-[1.35rem] w-[1.35rem]" strokeWidth={2} />
          </span>
          <input
            id="home-search"
            type="search"
            name="search"
            placeholder={t("heroSearchPlaceholder")}
            className="min-h-[48px] w-full min-w-0 flex-1 border-0 bg-transparent py-2 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none sm:text-[1.05rem]"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[56px] w-full shrink-0 items-center justify-center self-stretch rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 px-8 text-base font-semibold text-white shadow-md shadow-orange-900/10 transition hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-900/15 focus:outline-none focus:ring-4 focus:ring-orange-400/35 active:scale-[0.99] sm:min-h-[58px] sm:w-auto sm:min-w-[9.5rem]"
        >
          {tNav("searchSubmit")}
        </button>
      </div>

      <div className="mx-auto max-w-xl">
        <label className="mb-1.5 block text-center text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="home-hero-city">
          {t("heroCityLabel")}
        </label>
        <input
          id="home-hero-city"
          name="city"
          list="home-hero-city-list"
          className="w-full rounded-xl border border-zinc-200/90 bg-white/95 px-4 py-3 text-center text-[15px] text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-500/15"
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
