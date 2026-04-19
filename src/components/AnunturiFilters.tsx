"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { VEHICLE_BRANDS, VEHICLE_FUEL_VALUES, VEHICLE_TRANSMISSION_VALUES } from "@/lib/vehicle-taxonomy";

type Props = {
  defaultCity?: string;
  defaultMin?: string;
  defaultMax?: string;
  defaultSearch?: string;
  /** "" = toate monedele; MDL / EUR = filtrează anunțurile cu acea monedă (împreună cu min/max pe acel preț) */
  defaultCurrency?: "" | "MDL" | "EUR";
  defaultBrand?: string;
  defaultModel?: string;
  defaultFuel?: string;
  defaultTransmission?: string;
  defaultYearMin?: string;
  defaultYearMax?: string;
  defaultMileageMax?: string;
  category?: string;
};

export function AnunturiFilters({
  defaultCity = "",
  defaultMin = "",
  defaultMax = "",
  defaultSearch = "",
  defaultCurrency = "",
  defaultBrand = "",
  defaultModel = "",
  defaultFuel = "",
  defaultTransmission = "",
  defaultYearMin = "",
  defaultYearMax = "",
  defaultMileageMax = "",
  category,
}: Props) {
  const t = useTranslations("Listings.filters");
  const cur = defaultCurrency === "EUR" || defaultCurrency === "MDL" ? defaultCurrency : null;
  const isVehicleCategory = (category ?? "").startsWith("transport");

  return (
    <form method="get" className="surface-card space-y-4 p-4 sm:p-5">
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t("title")}</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("search")}</p>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-search">
          {t("search")}
        </label>
        <input
          id="flt-search"
          name="search"
          type="search"
          defaultValue={defaultSearch}
          className="field-input mt-1"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-currency">
          {t("currency")}
        </label>
        <select
          id="flt-currency"
          name="currency"
          defaultValue={defaultCurrency || ""}
          className="field-input mt-1"
        >
          <option value="">{t("currencyAll")}</option>
          <option value="MDL">{t("currencyMdl")}</option>
          <option value="EUR">{t("currencyEur")}</option>
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-city">
            {t("city")}
          </label>
          <input
            id="flt-city"
            name="city"
            defaultValue={defaultCity}
            className="field-input mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-min">
            {cur ? t("minWithCurrency", { currency: cur }) : t("minPlain")}
          </label>
          <input
            id="flt-min"
            name="min"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={defaultMin}
            className="field-input mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-max">
            {cur ? t("maxWithCurrency", { currency: cur }) : t("maxPlain")}
          </label>
          <input
            id="flt-max"
            name="max"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={defaultMax}
            className="field-input mt-1"
          />
        </div>
      </div>
      {isVehicleCategory ? (
        <>
          <details open className="rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-3">
            <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900">{t("vehicleBrandSection")}</summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-brand">
                  {t("brand")}
                </label>
                <input
                  id="flt-brand"
                  name="brand"
                  list="flt-brand-list"
                  defaultValue={defaultBrand}
                  className="field-input mt-1"
                  placeholder={t("brandPlaceholder")}
                />
                <datalist id="flt-brand-list">
                  {VEHICLE_BRANDS.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-model">
                  {t("model")}
                </label>
                <input
                  id="flt-model"
                  name="model"
                  defaultValue={defaultModel}
                  className="field-input mt-1"
                  placeholder={t("modelPlaceholder")}
                />
              </div>
            </div>
          </details>

          <details open className="rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-3">
            <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900">{t("vehicleSpecsSection")}</summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-year-min">
                  {t("yearMin")}
                </label>
                <input
                  id="flt-year-min"
                  name="yearMin"
                  type="number"
                  inputMode="numeric"
                  min={1900}
                  defaultValue={defaultYearMin}
                  className="field-input mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-year-max">
                  {t("yearMax")}
                </label>
                <input
                  id="flt-year-max"
                  name="yearMax"
                  type="number"
                  inputMode="numeric"
                  min={1900}
                  defaultValue={defaultYearMax}
                  className="field-input mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-km-max">
                  {t("mileageMax")}
                </label>
                <input
                  id="flt-km-max"
                  name="mileageMax"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  defaultValue={defaultMileageMax}
                  className="field-input mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-fuel">
                  {t("fuel")}
                </label>
                <select id="flt-fuel" name="fuel" defaultValue={defaultFuel} className="field-input mt-1">
                  <option value="">{t("all")}</option>
                  {VEHICLE_FUEL_VALUES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-transmission">
                  {t("transmission")}
                </label>
                <select id="flt-transmission" name="transmission" defaultValue={defaultTransmission} className="field-input mt-1">
                  <option value="">{t("all")}</option>
                  {VEHICLE_TRANSMISSION_VALUES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </details>
        </>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="btn-primary flex-1 sm:flex-none">
          {t("apply")}
        </button>
        <Link
          href={category ? `/anunturi?category=${encodeURIComponent(category)}` : "/anunturi"}
          className="btn-secondary flex-1 sm:flex-none"
        >
          {t("reset")}
        </Link>
      </div>
    </form>
  );
}
