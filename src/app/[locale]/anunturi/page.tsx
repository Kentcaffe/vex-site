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
import { ListingImagePlaceholder } from "@/components/listing/ListingImagePlaceholder";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import { asListingSelect, type ListingBrowseRow } from "@/lib/prisma-listing-casts";
import { prisma } from "@/lib/prisma";
import { listingSeoPath } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    city?: string;
    district?: string;
    min?: string;
    max?: string;
    search?: string;
    currency?: string;
    brand?: string;
    model?: string;
    fuel?: string;
    transmission?: string;
    bodyType?: string;
    drivetrain?: string;
    doors?: string;
    condition?: string;
    yearMin?: string;
    yearMax?: string;
    mileageMax?: string;
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
  const district = sp.district?.trim() || undefined;
  const minRaw = sp.min?.trim();
  const maxRaw = sp.max?.trim();
  const minN = minRaw ? Number(minRaw) : NaN;
  const maxN = maxRaw ? Number(maxRaw) : NaN;
  const currencyFilter = sp.currency?.trim().toUpperCase();
  const brand = sp.brand?.trim() || undefined;
  const model = sp.model?.trim() || undefined;
  const fuel = sp.fuel?.trim() || undefined;
  const transmission = sp.transmission?.trim() || undefined;
  const bodyType = sp.bodyType?.trim() || undefined;
  const drivetrain = sp.drivetrain?.trim() || undefined;
  const doors = sp.doors?.trim() || undefined;
  const condition = sp.condition?.trim() || undefined;
  const yearMinRaw = sp.yearMin?.trim();
  const yearMaxRaw = sp.yearMax?.trim();
  const mileageMaxRaw = sp.mileageMax?.trim();
  const yearMin = yearMinRaw ? Number(yearMinRaw) : NaN;
  const yearMax = yearMaxRaw ? Number(yearMaxRaw) : NaN;
  const mileageMax = mileageMaxRaw ? Number(mileageMaxRaw) : NaN;

  const where: Prisma.ListingWhereInput = {};
  const andFilters: Prisma.ListingWhereInput[] = [];

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
    where.city = { contains: city, mode: "insensitive" };
  }

  if (district) {
    where.district = { contains: district, mode: "insensitive" };
  }

  if (searchQ) {
    where.OR = [{ title: { contains: searchQ } }, { description: { contains: searchQ } }];
  }

  if (brand) {
    where.brand = { contains: brand, mode: "insensitive" };
  }

  if (model) {
    where.modelName = { contains: model, mode: "insensitive" };
  }

  if (Number.isFinite(yearMin) || Number.isFinite(yearMax)) {
    where.year = {};
    if (Number.isFinite(yearMin)) where.year.gte = yearMin;
    if (Number.isFinite(yearMax)) where.year.lte = yearMax;
  }

  if (Number.isFinite(mileageMax)) {
    where.mileageKm = { lte: mileageMax };
  }

  if (condition === "new" || condition === "used") {
    where.condition = condition;
  }

  if (fuel) {
    andFilters.push({
      detailsJson: {
        contains: `"fuel":"${fuel}"`,
      },
    });
  }

  if (transmission) {
    andFilters.push({
      detailsJson: {
        contains: `"transmission":"${transmission}"`,
      },
    });
  }

  if (bodyType) {
    andFilters.push({
      detailsJson: {
        contains: `"body_type":"${bodyType}"`,
      },
    });
  }

  if (drivetrain) {
    andFilters.push({
      detailsJson: {
        contains: `"drivetrain":"${drivetrain}"`,
      },
    });
  }

  if (doors) {
    andFilters.push({
      detailsJson: {
        contains: `"doors":"${doors}"`,
      },
    });
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

  if (andFilters.length > 0) {
    where.AND = andFilters;
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
          defaultDistrict={district ?? ""}
          defaultMin={Number.isFinite(minN) ? String(minN) : ""}
          defaultMax={Number.isFinite(maxN) ? String(maxN) : ""}
          defaultSearch={searchQ ?? ""}
          defaultCurrency={currencyFilter === "MDL" || currencyFilter === "EUR" ? currencyFilter : ""}
          defaultBrand={brand ?? ""}
          defaultModel={model ?? ""}
          defaultFuel={fuel ?? ""}
          defaultTransmission={transmission ?? ""}
          defaultBodyType={bodyType ?? ""}
          defaultDrivetrain={drivetrain ?? ""}
          defaultDoors={doors ?? ""}
          defaultCondition={condition === "new" || condition === "used" ? condition : ""}
          defaultYearMin={Number.isFinite(yearMin) ? String(yearMin) : ""}
          defaultYearMax={Number.isFinite(yearMax) ? String(yearMax) : ""}
          defaultMileageMax={Number.isFinite(mileageMax) ? String(mileageMax) : ""}
          category={categorySlug}
        />
      }
    >
      <div className="surface-card w-full min-w-0 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 border-b border-[var(--mp-border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
              {t("resultsCount", { count: listings.length })}
            </p>
            <p className="mt-1 text-base text-zinc-700">
              {searchQ ? `${t("filters.search")}: ${searchQ}` : t("resultsHint")}
            </p>
          </div>
          <Link href="/publica" className="btn-primary hidden min-h-[44px] md:inline-flex">
            {t("publishCta")}
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="surface-muted p-8 text-center text-sm text-zinc-600">{t("empty")}</div>
        ) : (
          <ul className="space-y-4">
            {listings.map((item, index) => {
              const path = categoryPathLabels(allCats, item.categoryId, locale);
              const cover = parseStoredListingImages(item.images)[0];
              const listingHref = listingSeoPath({ id: item.id, title: item.title, city: item.city });
              return (
                <li key={item.id}>
                  <Link
                    href={listingHref}
                    className="group flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-4 shadow-[var(--mp-shadow-md)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[var(--mp-shadow-lg)] sm:flex-row"
                  >
                    {cover ? (
                      <div className="h-48 overflow-hidden rounded-[14px] border border-zinc-200 bg-zinc-100 sm:h-36 sm:w-44 sm:shrink-0">
                        <ListingCoverImg
                          src={cover}
                          alt={`${item.title} de vânzare în ${item.city}`}
                          priority={index < 2}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full min-w-0 overflow-hidden rounded-2xl border border-[var(--mp-border)] bg-zinc-200 sm:h-36 sm:w-44 sm:shrink-0">
                        <ListingImagePlaceholder title={t("cardNoImageTitle")} hint={t("cardNoImageHint")} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h2 className="max-w-2xl text-base font-bold leading-snug text-zinc-900 transition group-hover:text-[#c2410c] sm:text-lg">
                          {item.title}
                        </h2>
                        <span className="shrink-0 rounded-full bg-orange-100 px-3 py-1.5 text-base font-bold text-[#9a3412]">
                          {formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-zinc-600">{path}</p>
                      <p className="mt-3 text-base leading-relaxed text-zinc-700">
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
