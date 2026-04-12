import type { Prisma } from "@prisma/client";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AnunturiFilters } from "@/components/AnunturiFilters";
import { CategorySidebar } from "@/components/CategorySidebar";
import { categoryPathLabels, getAllCategories, getDescendantCategoryIds } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnunturiPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const categorySlug = typeof sp.category === "string" ? sp.category : undefined;
  const cityQ = typeof sp.city === "string" ? sp.city.trim() : undefined;
  const minRaw = typeof sp.min === "string" ? sp.min : "";
  const maxRaw = typeof sp.max === "string" ? sp.max : "";
  const minP = minRaw ? parseInt(minRaw, 10) : undefined;
  const maxP = maxRaw ? parseInt(maxRaw, 10) : undefined;

  const filters: Prisma.ListingWhereInput[] = [];
  if (categorySlug) {
    const ids = await getDescendantCategoryIds(categorySlug);
    if (ids.length === 0) {
      filters.push({ id: "__no_such_listing__" });
    } else {
      filters.push({ categoryId: { in: ids } });
    }
  }
  if (cityQ) {
    filters.push({ city: { contains: cityQ } });
  }
  if (minP !== undefined && !Number.isNaN(minP)) {
    filters.push({ price: { gte: minP } });
  }
  if (maxP !== undefined && !Number.isNaN(maxP)) {
    filters.push({ price: { lte: maxP } });
  }

  const where: Prisma.ListingWhereInput | undefined =
    filters.length > 0 ? { AND: filters } : undefined;

  const [listings, allCategories] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 80,
      include: { category: true },
    }),
    getAllCategories(),
  ]);

  const t = await getTranslations("Listings");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
        <div className="mb-8 space-y-6 lg:mb-0">
          <CategorySidebar locale={locale} categories={allCategories} activeSlug={categorySlug} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <div className="mt-6">
            <AnunturiFilters
              categorySlug={categorySlug}
              defaultCity={cityQ ?? ""}
              defaultMin={minRaw}
              defaultMax={maxRaw}
            />
          </div>

          {listings.length === 0 ? (
            <p className="mt-10 text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
          ) : (
            <ul className="mt-8 space-y-4">
              {listings.map((item) => {
                const path = categoryPathLabels(allCategories, item.categoryId, locale);
                const cover = parseStoredListingImages(item.images)[0];
                return (
                  <li key={item.id}>
                    <Link
                      href={`/anunturi/${item.id}`}
                      className="block rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                    >
                      <div className="flex gap-4">
                        {cover ? (
                          <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={cover} alt="" className="h-full w-full object-cover" />
                          </div>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">{item.title}</h2>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                {formatPrice(item.price, locale)}
                              </span>
                              {item.negotiable ? (
                                <span className="ml-2 text-xs text-zinc-500">{t("negotiableShort")}</span>
                              ) : null}
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-zinc-500">{path}</p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {item.city}
                            {item.district ? ` · ${item.district}` : ""}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{item.description}</p>
                        </div>
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
