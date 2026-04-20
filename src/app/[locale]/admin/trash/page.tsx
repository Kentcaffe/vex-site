import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TrashListingActions } from "@/components/admin/TrashListingActions";
import { Link } from "@/i18n/navigation";
import { isAdmin } from "@/lib/auth-roles";
import { categoryPathLabels, getAllCategories } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import type { PriceCurrencyCode } from "@/lib/currency";
import type { Prisma } from "@prisma/client";
import { localizedHref } from "@/lib/paths";
import type { ListingPayloadWithCategory } from "@/lib/prisma-listing-casts";
import { listingWhereDeleted } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";
import { listingSeoPath } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function AdminTrashPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect(localizedHref(locale, "/admin"));
  }

  const t = await getTranslations("Admin");
  const [listings, allCats] = await Promise.all([
    prisma.listing.findMany({
      where: listingWhereDeleted(),
      orderBy: { deletedAt: "desc" } as Prisma.ListingOrderByWithRelationInput,
      take: 200,
      include: { category: true },
    }) as Promise<ListingPayloadWithCategory[]>,
    getAllCategories(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("trashTitle")}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{t("trashSubtitle")}</p>

      {listings.length === 0 ? (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">{t("trashEmpty")}</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
                <th className="px-4 py-3">{t("listingsColTitle")}</th>
                <th className="hidden px-4 py-3 md:table-cell">{t("listingsColCategory")}</th>
                <th className="px-4 py-3">{t("listingsColPrice")}</th>
                <th className="px-4 py-3">{t("trashColDeletedAt")}</th>
                <th className="px-4 py-3 text-right">{t("listingsColActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {listings.map((item) => {
                const path = categoryPathLabels(allCats, item.categoryId, locale);
                return (
                  <tr key={item.id} className="align-top transition hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.title}</span>
                      <p className="mt-1 text-xs text-zinc-500 md:hidden">{path}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{item.city}</p>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        <Link
                          href={listingSeoPath({ id: item.id, title: item.title, city: item.city })}
                          className="text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          {t("trashPreviewLink")}
                        </Link>{" "}
                        ({t("trashPreviewHint")})
                      </p>
                    </td>
                    <td className="hidden max-w-[220px] px-4 py-3 text-zinc-600 dark:text-zinc-400 md:table-cell">
                      <span className="line-clamp-2">{path}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-800 dark:text-zinc-200">
                      {formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                      {item.deletedAt ? new Date(item.deletedAt).toLocaleString(locale) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <TrashListingActions listingId={item.id} />
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
