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
    <form
      method="get"
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("title")}</h2>
      <div className="mt-3">
        <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-search">
          {t("search")}
        </label>
        <input
          id="flt-search"
          name="search"
          type="search"
          defaultValue={defaultSearch}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>
      <div className="mt-3">
        <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-currency">
          {t("currency")}
        </label>
        <select
          id="flt-currency"
          name="currency"
          defaultValue={defaultCurrency || ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        >
          <option value="">{t("currencyAll")}</option>
          <option value="MDL">{t("currencyMdl")}</option>
          <option value="EUR">{t("currencyEur")}</option>
        </select>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-city">
            {t("city")}
          </label>
          <input
            id="flt-city"
            name="city"
            defaultValue={defaultCity}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
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
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
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
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          {t("apply")}
        </button>
        <Link
          href={category ? `/anunturi?category=${encodeURIComponent(category)}` : "/anunturi"}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t("reset")}
        </Link>
      </div>
    </form>
  );
}
