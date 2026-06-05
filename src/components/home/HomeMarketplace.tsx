import { getTranslations } from "next-intl/server";
import { ChevronRight, Gift, MapPin, ShieldCheck, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HomeListingCard } from "@/components/home/HomeListingCard";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import type { CategoryRow } from "@/lib/category-queries";
import { getRootCategoryLucideIcon } from "@/lib/category-root-icons";
import { formatPrice } from "@/lib/formatPrice";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import type { PriceCurrencyCode } from "@/lib/currency";
import { listingSeoPath } from "@/lib/seo";
import { localizedHref } from "@/lib/paths";
import { HomeHeroSearchForm, type HomeCategoryOption } from "@/components/home/HomeHeroSearchForm";
import { formatListingRelativeTime } from "@/lib/format-listing-time";

type LabelJson = { ro?: string; ru?: string; en?: string };

function labelFor(cat: CategoryRow, locale: string): string {
  try {
    const L = JSON.parse(cat.labels) as LabelJson;
    const loc = locale as keyof LabelJson;
    return L[loc] ?? L.ro ?? cat.slug;
  } catch {
    return cat.slug;
  }
}

export type ListingCard = {
  id: string;
  title: string;
  price: number;
  priceCurrency: string;
  city: string;
  district: string | null;
  images: string | null;
  mileageKm: number | null;
  createdAt: Date | string;
  user?: {
    accountType?: string | null;
    isVerified?: boolean | null;
    businessStatus?: string | null;
    companyName?: string | null;
  } | null;
};

type Props = {
  locale: string;
  listings: ListingCard[];
  rootCategories: CategoryRow[];
  categoryCounts: Record<string, number>;
  favoritedIds: ReadonlySet<string>;
  activeListingsCount: number;
  usersCount: number;
  loadError?: boolean;
};

export async function HomeMarketplace({
  locale,
  listings,
  rootCategories,
  categoryCounts,
  favoritedIds,
  activeListingsCount,
  usersCount,
  loadError = false,
}: Props) {
  const t = await getTranslations("Home.marketplace");
  const tList = await getTranslations("Listings");
  const anunturiAction = localizedHref(locale, "/anunturi");

  const categoryOptions: HomeCategoryOption[] = rootCategories.map((cat) => ({
    slug: cat.slug,
    label: labelFor(cat, locale),
  }));

  const trustPillars = [
    { Icon: Gift, titleKey: "trustPillarFreeTitle" as const, descKey: "trustPillarFreeDesc" as const },
    { Icon: Zap, titleKey: "trustPillarFastTitle" as const, descKey: "trustPillarFastDesc" as const },
    { Icon: ShieldCheck, titleKey: "trustPillarSafeTitle" as const, descKey: "trustPillarSafeDesc" as const },
    { Icon: MapPin, titleKey: "trustPillarLocalTitle" as const, descKey: "trustPillarLocalDesc" as const },
  ];

  return (
    <>
      {/* Hero */}
      <section className="w-full border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
            <h1 className="text-balance text-[40px] font-medium leading-tight tracking-tight text-[#0f172a]">
              {t("heroHeadline")}
            </h1>
            <p className="mt-3 text-pretty text-base text-[#64748b]">{t("heroSubheadline")}</p>
            <div className="mt-8">
              <HomeHeroSearchForm
                action={anunturiAction}
                categories={categoryOptions}
                activeListingsCount={activeListingsCount}
                usersCount={usersCount}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categorii */}
      <section className="w-full border-b border-[#e2e8f0] bg-white py-6 sm:py-8">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-[#64748b]">{t("categoriesTitle")}</h2>
            <Link
              href="/categorii"
              className="inline-flex min-h-[40px] items-center gap-0.5 text-sm font-medium text-[#1a56db] transition hover:text-[#1648c0]"
            >
              {t("viewAll")}
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
            {rootCategories.map((cat) => {
              const Icon = getRootCategoryLucideIcon(cat.slug);
              const count = categoryCounts[cat.slug] ?? 0;
              return (
                <Link
                  key={cat.id}
                  href={`/categorii?c=${encodeURIComponent(cat.slug)}`}
                  className="group flex flex-col items-center rounded-xl border border-[#e2e8f0] bg-white px-2 py-4 text-center transition hover:border-[#1a56db] hover:bg-[#f1f5f9]"
                >
                  <span className="flex h-10 w-10 items-center justify-center text-[#1a56db]" aria-hidden>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="mt-2 line-clamp-2 text-xs font-medium text-[#1e293b] sm:text-sm">
                    {labelFor(cat, locale)}
                  </span>
                  <span className="mt-1 text-[11px] text-[#64748b]">
                    {t("categoryListingCount", { count })}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Anunțuri recomandate */}
      <div className="w-full min-w-0 bg-white pb-12 pt-8 md:pb-14 md:pt-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <section>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-xl font-medium tracking-tight text-[#0f172a] sm:text-2xl">{t("gridTitle")}</h2>
                <p className="max-w-xl text-sm text-[#64748b]">{t("latestListingsSubtitle")}</p>
              </div>
              <Link
                href="/anunturi"
                className="inline-flex min-h-[44px] items-center gap-0.5 text-sm font-medium text-[#1a56db] transition hover:text-[#1648c0]"
              >
                {t("viewAll")}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            {loadError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm font-medium text-red-800">{tList("browseLoadError")}</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-10 text-center">
                <p className="text-base font-medium text-[#0f172a]">{t("empty")}</p>
                <p className="mx-auto mt-4 max-w-md text-sm text-[#64748b]">{t("emptyHint")}</p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                {listings.map((item, index) => {
                  const cover = parseStoredListingImages(item.images)[0] ?? null;
                  const place = item.city + (item.district ? ` · ${item.district}` : "");
                  const listingHref = listingSeoPath({ id: item.id, title: item.title, city: item.city });
                  const timeLabel = formatListingRelativeTime(item.createdAt, locale);
                  return (
                    <HomeListingCard
                      key={item.id}
                      listingId={item.id}
                      listingHref={listingHref}
                      title={item.title}
                      formattedPrice={formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                      place={place}
                      timeLabel={timeLabel}
                      coverSrc={cover}
                      coverAlt={`${item.title} de vânzare în ${item.city}`}
                      priority={index < 3}
                      initialFavorited={favoritedIds.has(item.id)}
                      noImageTitle={tList("cardNoImageTitle")}
                      noImageHint={tList("cardNoImageHint")}
                      user={item.user}
                    />
                  );
                })}
              </ul>
            )}
          </section>

          {/* De ce VEX? */}
          <section className="mt-14 rounded-xl bg-[#f8fafc] p-6 md:mt-16 md:p-8">
            <h2 className="mb-6 text-center text-xl font-medium tracking-tight text-[#0f172a] sm:text-2xl">
              {t("trustSectionTitle")}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trustPillars.map(({ Icon, titleKey, descKey }) => (
                <div
                  key={titleKey}
                  className="flex flex-col rounded-xl border border-[#e2e8f0] bg-white p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center text-[#1a56db]" aria-hidden>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <p className="mt-3 text-sm font-medium text-[#0f172a]">{t(titleKey)}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-[#64748b]">{t(descKey)}</p>
                </div>
              ))}
            </div>
          </section>

          <ScrollToTopButton />
        </div>
      </div>
    </>
  );
}
