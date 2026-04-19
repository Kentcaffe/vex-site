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

  const fieldFocusClass =
    "focus:border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-500/15";

  return (
    <form action={action} method="get" className="space-y-5 sm:space-y-6">
      {carsOnly ? <input type="hidden" name="category" value={DEFAULT_CAR_CATEGORY} /> : null}

      <label htmlFor="home-search" className="sr-only">
        {t("heroSearchPlaceholder")}
      </label>

      {/* Rând principal: căutare + buton — mobile: stack full width */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
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
          className="inline-flex min-h-[56px] w-full shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 px-8 text-base font-semibold text-white shadow-md shadow-orange-900/10 transition hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-900/15 focus:outline-none focus:ring-4 focus:ring-orange-400/35 active:scale-[0.99] sm:min-h-[58px] sm:w-auto sm:min-w-[9.5rem] sm:rounded-2xl"
        >
          {tNav("searchSubmit")}
        </button>
      </div>

      {/* Filtre opționale — card luminos, fără contrast dur */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm sm:p-5 md:p-6">
        <label className="flex cursor-pointer items-start gap-3 text-sm font-medium leading-relaxed text-zinc-700">
          <input
            type="checkbox"
            checked={carsOnly}
            onChange={(e) => setCarsOnly(e.target.checked)}
            className="mt-1 h-[1.125rem] w-[1.125rem] shrink-0 rounded border-zinc-300 text-orange-600 focus:ring-orange-500/30"
          />
          <span>
            <span className="block text-zinc-800">{t("heroCarsOnly")}</span>
            <span className="mt-1 block text-xs font-normal leading-relaxed text-zinc-500">
              {t("heroCarsOnlyHint")}
            </span>
          </span>
        </label>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500" htmlFor="home-hero-city">
              {t("heroCityLabel")}
            </label>
            <input
              id="home-hero-city"
              name="city"
              list="home-hero-city-list"
              className={`mt-2 min-h-[50px] w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 ${fieldFocusClass}`}
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
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500" htmlFor="home-hero-brand">
              {t("heroBrandLabel")}
            </label>
            <input
              id="home-hero-brand"
              name="brand"
              list="home-hero-brand-list"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={`mt-2 min-h-[50px] w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 ${fieldFocusClass}`}
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
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500" htmlFor="home-hero-model">
              {t("heroModelLabel")}
            </label>
            <input
              id="home-hero-model"
              name="model"
              list="home-hero-model-list"
              className={`mt-2 min-h-[50px] w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 ${fieldFocusClass}`}
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
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500" htmlFor="home-hero-fuel">
              {t("heroFuelLabel")}
            </label>
            <select
              id="home-hero-fuel"
              name="fuel"
              className={`mt-2 min-h-[50px] w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-900 ${fieldFocusClass}`}
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

      <p className="text-center text-sm leading-relaxed text-zinc-500 sm:text-left">{t("heroExamples")}</p>
    </form>
  );
}
