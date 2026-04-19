import { getTranslations } from "next-intl/server";
import { ChevronRight, MapPin, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import type { CategoryRow } from "@/lib/category-queries";
import { emojiForRootSlug } from "@/lib/category-icons";
import { formatPrice } from "@/lib/formatPrice";
import { ListingCoverImg } from "@/components/listing/ListingCoverImg";
import { ListingImagePlaceholder } from "@/components/listing/ListingImagePlaceholder";
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
    <div className="app-shell app-section w-full min-w-0 pb-8 md:pb-10">
      {/* Hero + căutare — mobile-first */}
      <section className="relative w-full min-w-0 overflow-hidden rounded-2xl border border-[var(--mp-border)] bg-gradient-to-br from-orange-600 via-amber-500 to-orange-700 p-4 shadow-[var(--mp-shadow-lg)] sm:p-7 md:rounded-3xl md:p-8">
        <div className="relative w-full">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a3412]"
                data-nosnippet
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {t("gridTitle")}
              </p>
              <h1 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                {t("promoTile1Title")}
              </h1>
              <p className="mt-2 max-w-lg text-base leading-relaxed text-white">{t("promoTile1Body")}</p>
            </div>
            <Link
              href="/cont"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white text-xl text-[#c2410c] shadow-[var(--mp-shadow-md)] transition hover:bg-[#fff7ed]"
              aria-label="Cont"
            >
              <span className="text-lg" aria-hidden>
                👤
              </span>
            </Link>
          </div>

          <HomeHeroSearchForm action={anunturiAction} />
        </div>
      </section>

      {/* Categorii — scroll orizontal */}
      <section className="mt-5 md:mt-8">
        <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
          <h2 className="text-lg font-bold text-zinc-900">{t("categoriesTitle")}</h2>
          <Link
            href="/categorii"
            className="inline-flex min-h-[44px] items-center gap-0.5 text-sm font-semibold text-orange-600"
          >
            {t("viewAll")}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="-mx-1 flex gap-3 overflow-x-auto pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rootCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorii?c=${encodeURIComponent(cat.slug)}`}
              className="flex min-h-[48px] min-w-[max-content] shrink-0 items-center gap-2.5 rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] px-4 py-3 text-base font-semibold text-zinc-800 shadow-[var(--mp-shadow-md)] transition active:scale-[0.98] hover:border-orange-300 hover:bg-[var(--mp-primary-soft)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--mp-surface-muted)] text-lg" aria-hidden>
                {emojiForRootSlug(cat.slug)}
              </span>
              {labelFor(cat, locale)}
            </Link>
          ))}
        </div>
      </section>

      {/* Listă anunțuri */}
      <section className="mt-6 md:mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
              {listings.length} {listings.length === 1 ? "anunț" : "anunțuri"}
            </p>
            <p className="mt-1 text-sm text-zinc-600">Cele mai noi pe platformă</p>
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
            <p className="text-sm font-semibold text-red-800">Eroare la încărcarea anunțurilor.</p>
            <p className="mt-1 text-base text-red-800">Încearcă refresh sau revino în câteva momente.</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-10 text-center shadow-[var(--mp-shadow-md)]">
            <p className="text-base text-zinc-800">{t("empty")}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-600">
              Apasă butonul portocaliu cu „+” din bara de jos pentru a publica primul anunț.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((item, index) => {
              const cover = parseStoredListingImages(item.images)[0];
              const place = item.city + (item.district ? ` · ${item.district}` : "");
              const listingHref = listingSeoPath({ id: item.id, title: item.title, city: item.city });
              return (
                <li key={item.id} className="group">
                  <article className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] shadow-[var(--mp-shadow-md)] transition hover:-translate-y-0.5 hover:shadow-[var(--mp-shadow-lg)]">
                    <div className="relative mp-card-image">
                      <Link href={listingHref} className="absolute inset-0 z-0 block" aria-label={item.title}>
                        {cover ? (
                          <ListingCoverImg
                            src={cover}
                            alt={`${item.title} de vânzare în ${item.city}`}
                            priority={index < 4}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <ListingImagePlaceholder
                            title={tList("cardNoImageTitle")}
                            hint={tList("cardNoImageHint")}
                            className="bg-zinc-200"
                          />
                        )}
                      </Link>
                      <div className="absolute right-2 top-2 z-10">
                        <FavoriteButton listingId={item.id} initialFavorited={favoritedIds.has(item.id)} variant="icon" />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-3.5 sm:p-3.5">
                      <Link href={listingHref} className="block min-h-0 flex-1">
                        <span className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 group-hover:text-[#c2410c]">
                          {item.title}
                        </span>
                      </Link>
                      <p className="mt-2 text-base font-extrabold text-[#c2410c] tabular-nums">
                        {formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1 text-sm text-zinc-700">
                        <MapPin className="h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
                        <span className="line-clamp-1">{place}</span>
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Promo desktop */}
      <div className="mt-10 hidden md:block">
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Link
            href="/anunturi"
            className="group rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-[var(--mp-shadow-md)] transition hover:border-orange-200 hover:shadow-[var(--mp-shadow-lg)]"
          >
            <p className="text-sm font-bold text-[var(--mp-text)]">{t("promoTile1Title")}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--mp-text-muted)]">{t("promoTile1Body")}</p>
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
  );
}
