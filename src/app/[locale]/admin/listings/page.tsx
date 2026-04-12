import { getTranslations, setRequestLocale } from "next-intl/server";
import { DeleteListingButton } from "@/components/DeleteListingButton";
import { Link } from "@/i18n/navigation";
import { categoryPathLabels, getAllCategories } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminListingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const [listings, allCats] = await Promise.all([
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { category: true },
    }),
    getAllCategories(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("listingsTitle")}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{t("listingsSubtitle")}</p>

      {listings.length === 0 ? (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
                <th className="px-4 py-3">{t("listingsColTitle")}</th>
                <th className="hidden px-4 py-3 md:table-cell">{t("listingsColCategory")}</th>
                <th className="px-4 py-3">{t("listingsColPrice")}</th>
                <th className="px-4 py-3 text-right">{t("listingsColActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {listings.map((item) => {
                const path = categoryPathLabels(allCats, item.categoryId, locale);
                return (
                  <tr key={item.id} className="align-top transition hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/anunturi/${item.id}`}
                        className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-500 md:hidden">{path}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {item.city}
                      </p>
                    </td>
                    <td className="hidden max-w-[220px] px-4 py-3 text-zinc-600 dark:text-zinc-400 md:table-cell">
                      <span className="line-clamp-2">{path}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-800 dark:text-zinc-200">
                      {formatPrice(item.price, locale)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteListingButton listingId={item.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
