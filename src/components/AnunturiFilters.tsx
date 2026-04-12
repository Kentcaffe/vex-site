"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Props = {
  defaultCity?: string;
  defaultMin?: string;
  defaultMax?: string;
  category?: string;
};

export function AnunturiFilters({ defaultCity = "", defaultMin = "", defaultMax = "", category }: Props) {
  const t = useTranslations("Listings.filters");

  return (
    <form
      method="get"
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("title")}</h2>
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
            {t("min")}
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
            {t("max")}
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
