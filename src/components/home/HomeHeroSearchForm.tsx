"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { MOLDOVA_CITIES, VEHICLE_BRANDS, VEHICLE_FUEL_VALUES } from "@/lib/vehicle-taxonomy";
import { getModelsForBrand } from "@/lib/vehicle-models-by-brand";

const DEFAULT_CAR_CATEGORY = "transport-autoturisme";

type Props = {
  /** Ex.: `/anunturi` sau `/en/anunturi` */
  action: string;
};

export function HomeHeroSearchForm({ action }: Props) {
  const t = useTranslations("Home.marketplace");
  const tNav = useTranslations("Nav");
  const [carsOnly, setCarsOnly] = useState(true);
  const [brand, setBrand] = useState("");

  const modelOptions = useMemo(() => getModelsForBrand(brand), [brand]);

  return (
    <form action={action} method="get" className="relative z-10 mt-6 space-y-4">
      {carsOnly ? <input type="hidden" name="category" value={DEFAULT_CAR_CATEGORY} /> : null}

      <label htmlFor="home-search" className="sr-only">
        {t("heroSearchPlaceholder")}
      </label>
      <div className="relative flex items-center gap-2 rounded-2xl border border-white/25 bg-white p-1.5 shadow-inner sm:rounded-3xl sm:p-2">
        <span
          className="pointer-events-none flex h-11 w-11 shrink-0 items-center justify-center text-orange-600"
          aria-hidden
        >
          <Search className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <input
          id="home-search"
          type="search"
          name="search"
          placeholder={t("heroSearchPlaceholder")}
          className="min-h-[48px] w-full min-w-0 flex-1 border-0 bg-transparent pr-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
          autoComplete="off"
        />
        <button
          type="submit"
          className="hidden shrink-0 rounded-xl bg-[#9a3412] px-5 py-3 text-base font-semibold text-white shadow-[var(--mp-shadow-md)] transition hover:bg-[#7c2d12] sm:inline-flex"
        >
          {tNav("searchSubmit")}
        </button>
      </div>

      <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm sm:p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm font-medium text-white">
          <input
            type="checkbox"
            checked={carsOnly}
            onChange={(e) => setCarsOnly(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-white/40 text-[#9a3412]"
          />
          <span>
            <span className="block">{t("heroCarsOnly")}</span>
            <span className="mt-0.5 block text-xs font-normal text-amber-100">{t("heroCarsOnlyHint")}</span>
          </span>
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-amber-50" htmlFor="home-hero-city">
              {t("heroCityLabel")}
            </label>
            <input
              id="home-hero-city"
              name="city"
              list="home-hero-city-list"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-white/30 bg-white/95 px-3 text-sm text-zinc-900 placeholder:text-zinc-500"
              placeholder={t("heroCityPlaceholder")}
              autoComplete="off"
            />
            <datalist id="home-hero-city-list">
              {MOLDOVA_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-semibold text-amber-50" htmlFor="home-hero-brand">
              {t("heroBrandLabel")}
            </label>
            <input
              id="home-hero-brand"
              name="brand"
              list="home-hero-brand-list"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1 min-h-[44px] w-full rounded-xl border border-white/30 bg-white/95 px-3 text-sm text-zinc-900 placeholder:text-zinc-500"
              placeholder={t("heroBrandPlaceholder")}
              autoComplete="off"
            />
            <datalist id="home-hero-brand-list">
              {VEHICLE_BRANDS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-semibold text-amber-50" htmlFor="home-hero-model">
              {t("heroModelLabel")}
            </label>
            <input
              id="home-hero-model"
              name="model"
              list="home-hero-model-list"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-white/30 bg-white/95 px-3 text-sm text-zinc-900 placeholder:text-zinc-500"
              placeholder={t("heroModelPlaceholder")}
              autoComplete="off"
            />
            <datalist id="home-hero-model-list">
              {modelOptions.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-semibold text-amber-50" htmlFor="home-hero-fuel">
              {t("heroFuelLabel")}
            </label>
            <select
              id="home-hero-fuel"
              name="fuel"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-white/30 bg-white/95 px-3 text-sm text-zinc-900"
              defaultValue=""
            >
              <option value="">{t("heroFuelAny")}</option>
              {VEHICLE_FUEL_VALUES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-amber-100 sm:text-left">{t("heroExamples")}</p>

      <button
        type="submit"
        className="w-full rounded-xl bg-[#9a3412] px-5 py-3 text-base font-semibold text-white shadow-[var(--mp-shadow-md)] transition hover:bg-[#7c2d12] sm:hidden"
      >
        {tNav("searchSubmit")}
      </button>
    </form>
  );
}
