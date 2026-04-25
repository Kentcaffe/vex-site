import { getTranslations } from "next-intl/server";
import { ChevronRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HomeListingCard } from "@/components/home/HomeListingCard";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import type { CategoryRow } from "@/lib/category-queries";
import { emojiForRootSlug } from "@/lib/category-icons";
import { formatPrice } from "@/lib/formatPrice";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import type { PriceCurrencyCode } from "@/lib/currency";
import { listingSeoPath } from "@/lib/seo";
import { localizedHref } from "@/lib/paths";
import { HomeHeroSearchForm } from "@/components/home/HomeHeroSearchForm";

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
  user?: {
    accountType?: string | null;
    isVerified?: boolean | null;
  } | null;
};

type Props = {
  locale: string;
  listings: ListingCard[];
  rootCategories: CategoryRow[];
  favoritedIds: ReadonlySet<string>;
  loadError?: boolean;
};

export async function HomeMarketplace({
  locale,
  listings,
  rootCategories,
  favoritedIds,
  loadError = false,
}: Props) {
  const t = await getTranslations("Home.marketplace");
  const tList = await getTranslations("Listings");
  const anunturiAction = localizedHref(locale, "/anunturi");

  return (
    <>
      {/* Hero căutare — full width sub navbar, gradient soft */}
      <section className="relative w-full border-b border-orange-200/30 bg-gradient-to-b from-[#fff9f5] via-[#fff4eb] to-[#fef0e4]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/60 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-9 lg:px-8 lg:pb-12 lg:pt-10">
          <div className="mx-auto mb-6 max-w-4xl sm:mb-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1 space-y-3">
                <p
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200/80 bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-800/90 shadow-sm backdrop-blur-sm sm:text-xs"
                  data-nosnippet
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-orange-500" aria-hidden />
                  {t("heroBadge")}
                </p>
                <h1 className="min-h-[3.25rem] text-balance text-2xl font-semibold leading-tight tracking-tight text-zinc-900 sm:min-h-[3.75rem] sm:text-3xl lg:min-h-[4rem] lg:text-[2rem] lg:leading-snug">
                  {t("promoTile1Title")}
                </h1>
                <p className="min-h-[3rem] max-w-xl text-base leading-relaxed text-zinc-600 sm:min-h-[3.25rem] sm:text-[1.05rem]">
                  {t("promoTile1Body")}
                </p>
              </div>
              <Link
                href="/cont"
                className="flex h-12 w-12 shrink-0 items-center justify-center self-start rounded-2xl border border-zinc-200/90 bg-white text-lg text-orange-600 shadow-md shadow-orange-900/5 transition hover:border-orange-200 hover:bg-orange-50/80 hover:shadow-lg sm:h-12 sm:w-12"
                aria-label="Cont"
              >
                <span aria-hidden>👤</span>
              </Link>
            </div>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="rounded-[1.25rem] border border-orange-100/80 bg-white/70 p-1 shadow-[0_8px_40px_-12px_rgba(124,45,18,0.12)] backdrop-blur-sm sm:rounded-3xl sm:p-1.5">
              <div className="px-2 py-3 sm:px-4 sm:py-4">
                <HomeHeroSearchForm action={anunturiAction} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="app-shell app-section w-full min-w-0 pb-10 md:pb-12">
        <section className="mt-6 md:mt-8">
          <div className="mb-4 flex items-center justify-between gap-2 px-0.5">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{t("categoriesTitle")}</h2>
            <Link
              href="/categorii"
              className="inline-flex min-h-[44px] items-center gap-0.5 text-sm font-semibold text-orange-600 hover:underline"
            >
              {t("viewAll")}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="-mx-1 flex gap-3 overflow-x-auto pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {rootCategories.map((cat) => {
              const rootEmoji = emojiForRootSlug(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/categorii?c=${encodeURIComponent(cat.slug)}`}
                  className="flex min-h-[52px] min-w-[max-content] shrink-0 items-center gap-2.5 rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] px-4 py-3.5 text-base font-semibold text-zinc-800 shadow-[var(--mp-shadow-md)] transition hover:border-orange-200 hover:bg-[var(--mp-primary-soft)] active:scale-[0.98]"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--mp-surface-muted)] text-[1.5rem] leading-none"
                    aria-hidden
                  >
                    {rootEmoji}
                  </span>
                  {labelFor(cat, locale)}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 md:mt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{t("latestListingsTitle")}</h2>
              <p className="text-sm leading-relaxed text-zinc-500">{t("latestListingsSubtitle")}</p>
            </div>
            <Link
              href="/anunturi"
              className="inline-flex min-h-[44px] items-center text-sm font-semibold text-orange-600 underline-offset-4 hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>

          {loadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-semibold text-red-800">{tList("browseLoadError")}</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-10 text-center shadow-[var(--mp-shadow-md)]">
              <p className="text-base text-zinc-800">{t("empty")}</p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-600">
                Apasă butonul portocaliu cu „+” din bara de jos pentru a publica primul anunț.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((item, index) => {
                const cover = parseStoredListingImages(item.images)[0] ?? null;
                const place = item.city + (item.district ? ` · ${item.district}` : "");
                const listingHref = listingSeoPath({ id: item.id, title: item.title, city: item.city });
                return (
                  <HomeListingCard
                    key={item.id}
                    listingId={item.id}
                    listingHref={listingHref}
                    title={item.title}
                    formattedPrice={formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                    place={place}
                    coverSrc={cover}
                    coverAlt={`${item.title} de vânzare în ${item.city}`}
                    priority={index < 4}
                    initialFavorited={favoritedIds.has(item.id)}
                    noImageTitle={tList("cardNoImageTitle")}
                    noImageHint={tList("cardNoImageHint")}
                    isBusiness={item.user?.accountType === "business"}
                    isVerified={Boolean(item.user?.isVerified)}
                  />
                );
              })}
            </ul>
          )}
        </section>

        <div className="mt-12 hidden md:block">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Link
              href="/anunturi"
              className="group rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-[var(--mp-shadow-md)] transition hover:border-orange-200 hover:shadow-[var(--mp-shadow-lg)]"
            >
              <p className="text-sm font-bold text-[var(--mp-text)]">{t("promoBrowseCardTitle")}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--mp-text-muted)]">{t("promoBrowseCardBody")}</p>
            </Link>
            <Link
              href="/chat"
              className="group rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-[var(--mp-shadow-md)] transition hover:border-orange-200 hover:shadow-[var(--mp-shadow-lg)]"
            >
              <p className="text-sm font-bold text-[var(--mp-text)]">{t("promoTile2Title")}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--mp-text-muted)]">{t("promoTile2Body")}</p>
            </Link>
            <Link
              href="/publica"
              className="group rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-[var(--mp-shadow-md)] transition hover:border-orange-200 hover:shadow-[var(--mp-shadow-lg)]"
            >
              <p className="text-sm font-bold text-[var(--mp-text)]">{t("promoTile3Title")}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--mp-text-muted)]">{t("promoTile3Body")}</p>
            </Link>
          </section>
        </div>

        <ScrollToTopButton />
      </div>
    </>
  );
}
