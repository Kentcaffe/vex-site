"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Props = {
  defaultCity?: string;
  defaultMin?: string;
  defaultMax?: string;
  defaultSearch?: string;
  /** "" = toate monedele; MDL / EUR = filtrează anunțurile cu acea monedă (împreună cu min/max pe acel preț) */
  defaultCurrency?: "" | "MDL" | "EUR";
  category?: string;
};

export function AnunturiFilters({
  defaultCity = "",
  defaultMin = "",
  defaultMax = "",
  defaultSearch = "",
  defaultCurrency = "",
  category,
}: Props) {
  const t = useTranslations("Listings.filters");
  const cur = defaultCurrency === "EUR" || defaultCurrency === "MDL" ? defaultCurrency : null;

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
