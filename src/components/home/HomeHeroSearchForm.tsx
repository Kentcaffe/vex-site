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

      <div className="rounded-3xl border border-zinc-200/80 bg-white p-2 shadow-[0_20px_50px_-18px_rgb(15_23_42/0.18),0_0_0_1px_rgb(255_255_255/0.8)_inset] sm:p-2.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
          <div className="relative flex min-h-[58px] min-w-0 flex-1 items-center gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 px-3 shadow-inner shadow-zinc-900/[0.02] transition-all focus-within:border-emerald-400/80 focus-within:bg-white focus-within:shadow-md focus-within:ring-4 focus-within:ring-emerald-500/15 sm:min-h-[60px] sm:px-4">
            <span
              className="pointer-events-none flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100/80"
              aria-hidden
            >
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
            className="inline-flex min-h-[58px] w-full shrink-0 items-center justify-center self-stretch rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-900/25 focus:outline-none focus:ring-4 focus:ring-emerald-400/35 active:scale-[0.99] sm:min-h-[60px] sm:w-auto sm:min-w-[10rem]"
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
          className="w-full rounded-2xl border border-zinc-200/90 bg-white px-4 py-3 text-center text-[15px] text-zinc-900 shadow-sm placeholder:text-zinc-400 transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
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
