import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { DeleteListingButton } from "@/components/DeleteListingButton";
import { isAdmin } from "@/lib/auth-roles";
import { Link } from "@/i18n/navigation";
import { categoryPathLabels, getAllCategories } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import type { PriceCurrencyCode } from "@/lib/currency";
import type { ListingPayloadWithCategory } from "@/lib/prisma-listing-casts";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";
import { listingSeoPath } from "@/lib/seo";
import { evaluateListingFraudRisk } from "@/lib/listing-fraud";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    risk?: string;
    sort?: string;
  }>;
};

export default async function AdminListingsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const qp = (await searchParams) ?? {};
  const riskFilter = (qp.risk ?? "all").toLowerCase();
  const sortBy = (qp.sort ?? "newest").toLowerCase();
  setRequestLocale(locale);
  let t: Awaited<ReturnType<typeof getTranslations>>;
  try {
    t = await getTranslations("Admin");
  } catch (error) {
    console.error("[admin/listings] translations failed", error);
    return (
      <div>
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          Nu am putut încărca această pagină momentan.
        </p>
      </div>
    );
  }

  let canDeleteListing = false;
  let listings: ListingPayloadWithCategory[] = [];
  let allCats: Awaited<ReturnType<typeof getAllCategories>> = [];
  let loadFailed = false;

  try {
    const session = await auth();
    canDeleteListing = isAdmin(session?.user?.role);
    [listings, allCats] = await Promise.all([
      prisma.listing.findMany({
        where: listingWhereActive(),
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { category: true },
      }) as Promise<ListingPayloadWithCategory[]>,
      getAllCategories(),
    ]);
  } catch (error) {
    console.error("[admin/listings] data fetch failed", error);
    loadFailed = true;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("listingsTitle")}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{t("listingsSubtitle")}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="text-zinc-500 dark:text-zinc-400">Risk:</span>
        {(["all", "high", "medium", "low"] as const).map((risk) => (
          <Link
            key={risk}
            href={`/admin/listings?risk=${risk}&sort=${sortBy}`}
            className={`rounded-full px-3 py-1 ${
              riskFilter === risk
                ? "bg-emerald-600 text-white"
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {risk.toUpperCase()}
          </Link>
        ))}
        <span className="ml-3 text-zinc-500 dark:text-zinc-400">Sort:</span>
        {(["newest", "risk_desc", "risk_asc"] as const).map((sort) => (
          <Link
            key={sort}
            href={`/admin/listings?risk=${riskFilter}&sort=${sort}`}
            className={`rounded-full px-3 py-1 ${
              sortBy === sort
                ? "bg-emerald-600 text-white"
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {sort === "newest" ? "NEWEST" : sort === "risk_desc" ? "RISK DESC" : "RISK ASC"}
          </Link>
        ))}
      </div>

      {loadFailed ? (
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          Lista anunțurilor nu poate fi încărcată momentan.
        </p>
      ) : listings.length === 0 ? (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
                <th className="px-4 py-3">{t("listingsColTitle")}</th>
                <th className="hidden px-4 py-3 md:table-cell">{t("listingsColCategory")}</th>
                <th className="px-4 py-3">{t("listingsColPrice")}</th>
                <th className="px-4 py-3">Fraud risk</th>
                <th className="px-4 py-3 text-right">{t("listingsColActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {listings
                .map((item) => {
                const path = categoryPathLabels(allCats, item.categoryId, locale);
                const risk = evaluateListingFraudRisk({
                  title: item.title,
                  description: item.description,
                  price: Number(item.price ?? 0),
                  brand: item.brand,
                  modelName: item.modelName,
                  city: item.city,
                  phone: item.phone,
                });
                const badgeClass =
                  risk.level === "high"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : risk.level === "medium"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
                return { item, path, risk, badgeClass };
              })
                .filter(({ risk }) => (riskFilter === "all" ? true : risk.level === riskFilter))
                .sort((a, b) => {
                  if (sortBy === "risk_desc") return b.risk.score - a.risk.score;
                  if (sortBy === "risk_asc") return a.risk.score - b.risk.score;
                  return 0;
                })
                .map(({ item, path, risk, badgeClass }) => (
                  <tr key={item.id} className="align-top transition hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3">
                      <Link
                        href={listingSeoPath({ id: item.id, title: item.title, city: item.city })}
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
                      {formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
                        {risk.level.toUpperCase()} ({risk.score})
                      </span>
                      {risk.reasons[0] ? (
                        <p className="mt-1 max-w-[240px] truncate text-xs text-zinc-500 dark:text-zinc-400" title={risk.reasons[0]}>
                          {risk.reasons[0]}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canDeleteListing ? <DeleteListingButton listingId={item.id} /> : <span className="text-xs text-zinc-400">—</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
