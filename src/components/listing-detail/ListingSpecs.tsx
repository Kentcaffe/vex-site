import { getMessages, getTranslations } from "next-intl/server";
import { getListingSpecEntries, type ListingSpecsSource } from "@/lib/listing-detail-config";
import { resolveListingSpecValueDisplay } from "@/lib/listing-spec-value-display";

type Props = {
  categorySlug: string;
  listing: ListingSpecsSource;
};

export async function ListingSpecs({ categorySlug, listing }: Props) {
  const t = await getTranslations("ListingDetail");
  const messages = await getMessages();

  const rows = getListingSpecEntries(categorySlug, listing, (key) => t(key as never));

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="surface-card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t("specsTitle")}</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        {rows.map((row) => {
          const display =
            row.detailKey != null && row.detailKey !== ""
              ? resolveListingSpecValueDisplay(messages, row.detailKey, row.value)
              : row.value;
          return (
            <div key={(row.detailKey ?? "") + row.label + row.value} className="surface-muted flex justify-between gap-4 px-4 py-3">
              <dt className="text-zinc-500">{row.label}</dt>
              <dd className="text-right font-medium text-zinc-900 dark:text-zinc-100">{display}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
