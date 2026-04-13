import type { Prisma } from "@prisma/client";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AnunturiFilters } from "@/components/AnunturiFilters";
import { CategorySidebar } from "@/components/CategorySidebar";
import { getListingCategoryFilterIds } from "@/lib/category-filter";
import { categoryPathLabels, getAllCategories } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import type { PriceCurrencyCode } from "@/lib/currency";
import { ListingCoverImg } from "@/components/listing/ListingCoverImg";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import { asListingSelect, type ListingBrowseRow } from "@/lib/prisma-listing-casts";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    city?: string;
    min?: string;
    max?: string;
    search?: string;
    currency?: string;
  }>;
};

export default async function AnunturiListPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("Listings");

  const categorySlug = sp.category?.trim() || undefined;
  const searchQ = sp.search?.trim() || undefined;
  const city = sp.city?.trim() || undefined;
  const minRaw = sp.min?.trim();
  const maxRaw = sp.max?.trim();
  const minN = minRaw ? Number(minRaw) : NaN;
  const maxN = maxRaw ? Number(maxRaw) : NaN;
  const currencyFilter = sp.currency?.trim().toUpperCase();

  const where: Prisma.ListingWhereInput = {};

  if (currencyFilter === "MDL" || currencyFilter === "EUR") {
    Object.assign(where, { priceCurrency: currencyFilter } as Prisma.ListingWhereInput);
  }

  if (categorySlug) {
    const ids = await getListingCategoryFilterIds(categorySlug);
    if (ids?.length) {
      where.categoryId = { in: ids };
    }
  }

  if (city) {
    where.city = { contains: city };
  }

  if (searchQ) {
    where.OR = [{ title: { contains: searchQ } }, { description: { contains: searchQ } }];
  }

  if (Number.isFinite(minN) || Number.isFinite(maxN)) {
    where.price = {};
    if (Number.isFinite(minN)) {
      where.price.gte = minN;
    }
    if (Number.isFinite(maxN)) {
      where.price.lte = maxN;
    }
  }

  const [listingsRaw, allCats] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 80,
      select: asListingSelect({
        id: true,
        title: true,
        price: true,
        priceCurrency: true,
        city: true,
        district: true,
        images: true,
        categoryId: true,
      }),
    }),
    getAllCategories(),
  ]);
  const listings = listingsRaw as unknown as ListingBrowseRow[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="lg:w-56 lg:shrink-0">
          <CategorySidebar locale={locale} all={allCats} currentCategory={categorySlug} />
        </div>
        <div className="min-w-0 flex-1 space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <AnunturiFilters
            defaultCity={city ?? ""}
            defaultMin={Number.isFinite(minN) ? String(minN) : ""}
            defaultMax={Number.isFinite(maxN) ? String(maxN) : ""}
            defaultSearch={searchQ ?? ""}
            defaultCurrency={currencyFilter === "MDL" || currencyFilter === "EUR" ? currencyFilter : ""}
            category={categorySlug}
          />
          {listings.length === 0 ? (
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
          ) : (
            <ul className="space-y-4">
              {listings.map((item) => {
                const path = categoryPathLabels(allCats, item.categoryId, locale);
                const cover = parseStoredListingImages(item.images)[0];
                return (
                  <li key={item.id}>
                    <Link
                      href={`/anunturi/${item.id}`}
                      className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 sm:p-5"
                    >
                      {cover ? (
                        <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                          <ListingCoverImg src={cover} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-400 dark:border-zinc-600 dark:bg-zinc-800">
                          —
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h2>
                          <span className="shrink-0 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">{path}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {item.city}
                          {item.district ? ` · ${item.district}` : ""}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
