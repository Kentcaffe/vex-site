import { getTranslations } from "next-intl/server";
import { getListingSpecEntries, type ListingSpecsSource } from "@/lib/listing-detail-config";

type Props = {
  categorySlug: string;
  listing: ListingSpecsSource;
};

export async function ListingSpecs({ categorySlug, listing }: Props) {
  const t = await getTranslations("ListingDetail");

  const rows = getListingSpecEntries(categorySlug, listing, (key) => t(key as never));

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("specsTitle")}</h2>
      <dl className="mt-3 grid gap-2 text-sm">
        {rows.map((row) => (
          <div key={row.label + row.value} className="flex justify-between gap-4 border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800">
            <dt className="text-zinc-500">{row.label}</dt>
            <dd className="text-right font-medium text-zinc-900 dark:text-zinc-100">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
