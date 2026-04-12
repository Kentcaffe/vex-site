import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  categorySlug?: string;
  defaultCity?: string;
  defaultMin?: string;
  defaultMax?: string;
};

export async function AnunturiFilters({
  categorySlug,
  defaultCity = "",
  defaultMin = "",
  defaultMax = "",
}: Props) {
  const t = await getTranslations("Browse");

  return (
    <form method="get" className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex-row sm:flex-wrap sm:items-end">
      {categorySlug ? <input type="hidden" name="category" value={categorySlug} /> : null}
      <div className="min-w-[140px] flex-1">
        <label className="mb-1 block text-xs text-zinc-500" htmlFor="f-city">
          {t("filterCity")}
        </label>
        <input
          id="f-city"
          name="city"
          defaultValue={defaultCity}
          placeholder="Chișinău"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>
      <div className="w-full sm:w-24">
        <label className="mb-1 block text-xs text-zinc-500" htmlFor="f-min">
          {t("filterMin")}
        </label>
        <input
          id="f-min"
          name="min"
          type="number"
          min={0}
          defaultValue={defaultMin}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>
      <div className="w-full sm:w-24">
        <label className="mb-1 block text-xs text-zinc-500" htmlFor="f-max">
          {t("filterMax")}
        </label>
        <input
          id="f-max"
          name="max"
          type="number"
          min={0}
          defaultValue={defaultMax}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
        >
          {t("applyFilters")}
        </button>
        <Link
          href={categorySlug ? `/anunturi?category=${encodeURIComponent(categorySlug)}` : "/anunturi"}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
        >
          {t("reset")}
        </Link>
      </div>
    </form>
  );
}
