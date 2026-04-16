import type { Prisma } from "@prisma/client";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AnunturiFilters } from "@/components/AnunturiFilters";
import { CategorySidebar } from "@/components/CategorySidebar";
import { BrowseShell } from "@/components/marketplace/BrowseShell";
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
    <BrowseShell
      title={t("title")}
      subtitle={t("subtitle")}
      sidebar={<CategorySidebar locale={locale} all={allCats} currentCategory={categorySlug} />}
      filters={
        <AnunturiFilters
          defaultCity={city ?? ""}
          defaultMin={Number.isFinite(minN) ? String(minN) : ""}
          defaultMax={Number.isFinite(maxN) ? String(maxN) : ""}
          defaultSearch={searchQ ?? ""}
          defaultCurrency={currencyFilter === "MDL" || currencyFilter === "EUR" ? currencyFilter : ""}
          category={categorySlug}
        />
      }
    >
      <div className="surface-card p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              {t("resultsCount", { count: listings.length })}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {searchQ ? `${t("filters.search")}: ${searchQ}` : t("resultsHint")}
            </p>
          </div>
          <Link href="/publica" className="btn-primary">
            {t("publishCta")}
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="surface-muted p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("empty")}</div>
        ) : (
          <ul className="space-y-4">
            {listings.map((item, index) => {
              const path = categoryPathLabels(allCats, item.categoryId, locale);
              const cover = parseStoredListingImages(item.images)[0];
              return (
                <li key={item.id}>
                  <Link
                    href={`/anunturi/${item.id}`}
                    className="group flex flex-col gap-4 rounded-[16px] border border-zinc-200/90 bg-white p-3 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_22px_50px_-30px_rgba(5,150,105,0.35)] dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:p-4"
                  >
                    {cover ? (
                      <div className="h-48 overflow-hidden rounded-[14px] border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 sm:h-36 sm:w-44 sm:shrink-0">
                        <ListingCoverImg
                          src={cover}
                          alt=""
                          priority={index < 2}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center rounded-[14px] border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 sm:h-36 sm:w-44 sm:shrink-0">
                        —
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h2 className="max-w-2xl text-lg font-bold leading-snug text-zinc-900 transition group-hover:text-emerald-700 dark:text-zinc-50 dark:group-hover:text-emerald-400">
                          {item.title}
                        </h2>
                        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-base font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          {formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{path}</p>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
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
    </BrowseShell>
  );
}
