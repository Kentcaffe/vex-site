"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { MOLDOVA_CITIES } from "@/lib/vehicle-taxonomy";

export type HomeCategoryOption = {
  slug: string;
  label: string;
};

type Props = {
  /** Ex.: `/anunturi` sau `/en/anunturi` */
  action: string;
  categories: HomeCategoryOption[];
  activeListingsCount: number;
  usersCount: number;
};

export function HomeHeroSearchForm({ action, categories, activeListingsCount, usersCount }: Props) {
  const t = useTranslations("Home.marketplace");
  const tNav = useTranslations("Nav");

  return (
    <div className="w-full space-y-4">
      <form action={action} method="get" className="w-full">
        <label htmlFor="home-search" className="sr-only">
          {t("heroSearchPlaceholder")}
        </label>

        <div className="flex overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
          <div className="relative shrink-0 border-r border-[#e2e8f0]">
            <label htmlFor="home-category" className="sr-only">
              {tNav("allCategories")}
            </label>
            <select
              id="home-category"
              name="category"
              defaultValue=""
              className="h-12 min-w-[8.5rem] appearance-none bg-[#f8fafc] px-3 pr-8 text-sm font-medium text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#1a56db]/20 sm:h-14 sm:min-w-[10rem] sm:px-4 sm:text-[15px]"
            >
              <option value="">{tNav("allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#94a3b8]" strokeWidth={2} aria-hidden />
            <input
              id="home-search"
              type="search"
              name="search"
              placeholder={t("heroSearchPlaceholder")}
              className="h-12 w-full min-w-0 border-0 bg-transparent py-2 pl-10 pr-3 text-[15px] font-normal text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none sm:h-14 sm:pl-11 sm:text-base"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center justify-center bg-[#1a56db] px-5 text-sm font-medium text-white transition hover:bg-[#1648c0] focus:outline-none focus:ring-2 focus:ring-[#1a56db]/30 sm:h-14 sm:px-8 sm:text-[15px]"
          >
            {tNav("searchSubmit")}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
          <label htmlFor="home-hero-city" className="sr-only">
            {t("heroCityLabel")}
          </label>
          <input
            id="home-hero-city"
            name="city"
            list="home-hero-city-list"
            className="w-full max-w-xs rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-center text-sm text-[#334155] placeholder:text-[#94a3b8] focus:border-[#1a56db] focus:outline-none focus:ring-2 focus:ring-[#1a56db]/15 lg:text-left"
            placeholder={t("heroCityPlaceholder")}
            autoComplete="off"
          />
          <datalist id="home-hero-city-list">
            {MOLDOVA_CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </form>

      <p className="text-center text-sm text-[#64748b] lg:text-left">
        <span>{t("activeListings", { count: activeListingsCount })}</span>
        <span className="mx-2" aria-hidden>
          ·
        </span>
        <span>{t("heroStatsUsers", { count: usersCount })}</span>
        <span className="mx-2" aria-hidden>
          ·
        </span>
        <span>{t("heroStatsFree")}</span>
      </p>
    </div>
  );
}
