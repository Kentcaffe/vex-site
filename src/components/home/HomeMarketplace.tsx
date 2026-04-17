import { getTranslations } from "next-intl/server";
import { ChevronRight, MapPin, Search, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import type { CategoryRow } from "@/lib/category-queries";
import { emojiForRootSlug } from "@/lib/category-icons";
import { formatPrice } from "@/lib/formatPrice";
import { ListingCoverImg } from "@/components/listing/ListingCoverImg";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import type { PriceCurrencyCode } from "@/lib/currency";

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
  const tNav = await getTranslations("Nav");

  return (
    <div className="app-shell app-section pb-28 md:pb-10">
      {/* Hero + căutare — mobile-first */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--mp-border)] bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-5 shadow-[var(--mp-shadow-lg)] sm:p-7 md:rounded-3xl md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-black/10 blur-2xl" aria-hidden />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/95">
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {t("gridTitle")}
              </p>
              <h1 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                {t("promoTile1Title")}
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/90">{t("promoTile1Body")}</p>
            </div>
            <Link
              href="/cont"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-md backdrop-blur-sm transition hover:bg-white/25"
              aria-label="Cont"
            >
              <span className="text-lg" aria-hidden>
                👤
              </span>
            </Link>
          </div>

          <form action="/anunturi" method="get" className="relative z-10 mt-6">
            <label htmlFor="home-search" className="sr-only">
              Caută
            </label>
            <div className="relative flex items-center gap-2 rounded-2xl border border-white/25 bg-white p-1.5 shadow-inner sm:rounded-3xl sm:p-2">
              <span className="pointer-events-none flex h-11 w-11 shrink-0 items-center justify-center text-orange-600" aria-hidden>
                <Search className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <input
                id="home-search"
                type="search"
                name="search"
                placeholder="Caută anunțuri, categorii, oraș…"
                className="min-h-[48px] w-full min-w-0 flex-1 border-0 bg-transparent pr-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
                autoComplete="off"
              />
              <button
                type="submit"
                className="hidden shrink-0 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-700 sm:inline-flex"
              >
                {tNav("searchSubmit")}
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-white/75 sm:text-left">Ex.: mașini, telefoane, chirie — direct pe telefon.</p>
          </form>
        </div>
      </section>

      {/* Categorii — scroll orizontal */}
      <section className="mt-5 md:mt-8">
        <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
          <h2 className="text-base font-bold text-[var(--mp-text)] sm:text-lg">{t("categoriesTitle")}</h2>
          <Link
            href="/categorii"
            className="inline-flex items-center gap-0.5 text-sm font-semibold text-orange-600 dark:text-orange-400"
          >
            {t("viewAll")}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="-mx-1 flex gap-2.5 overflow-x-auto pb-2 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rootCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorii?c=${encodeURIComponent(cat.slug)}`}
              className="flex min-w-[max-content] shrink-0 items-center gap-2 rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] px-4 py-3 text-sm font-semibold text-[var(--mp-text-secondary)] shadow-[var(--mp-shadow)] transition active:scale-[0.98] hover:border-orange-200 hover:bg-[var(--mp-primary-soft)] dark:hover:border-orange-800/50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--mp-surface-muted)] text-lg" aria-hidden>
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--mp-text-muted)]">
              {listings.length} {listings.length === 1 ? "anunț" : "anunțuri"}
            </p>
            <p className="mt-1 text-sm text-[var(--mp-text-muted)]">Cele mai noi pe platformă</p>
          </div>
          <Link
            href="/anunturi"
            className="text-sm font-semibold text-orange-600 underline-offset-4 hover:underline dark:text-orange-400"
          >
            {t("viewAll")}
          </Link>
        </div>

        {loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">Eroare la încărcarea anunțurilor.</p>
            <p className="mt-1 text-sm text-red-700/90 dark:text-red-300/90">Încearcă refresh sau revino în câteva momente.</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-10 text-center shadow-[var(--mp-shadow-md)]">
            <p className="text-sm text-[var(--mp-text-muted)]">{t("empty")}</p>
            <Link href="/publica" className="btn-primary mt-5 inline-flex w-full max-w-xs justify-center sm:w-auto">
              Adaugă primul anunț
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((item, index) => {
              const cover = parseStoredListingImages(item.images)[0];
              const place = item.city + (item.district ? ` · ${item.district}` : "");
              return (
                <li key={item.id} className="group">
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] shadow-[var(--mp-shadow-md)] transition hover:-translate-y-0.5 hover:shadow-[var(--mp-shadow-lg)]">
                    <div className="relative mp-card-image">
                      <Link href={`/anunturi/${item.id}`} className="absolute inset-0 z-0 block" aria-label={item.title}>
                        {cover ? (
                          <ListingCoverImg
                            src={cover}
                            alt=""
                            priority={index < 4}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[var(--mp-surface-muted)] text-xs text-[var(--mp-text-muted)]">
                            Fără imagine
                          </div>
                        )}
                      </Link>
                      <div className="absolute right-2 top-2 z-10">
                        <FavoriteButton listingId={item.id} initialFavorited={favoritedIds.has(item.id)} variant="icon" />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-3 sm:p-3.5">
                      <Link href={`/anunturi/${item.id}`} className="block min-h-0 flex-1">
                        <span className="line-clamp-2 text-sm font-bold leading-snug text-[var(--mp-text)] group-hover:text-orange-600 dark:group-hover:text-orange-400">
                          {item.title}
                        </span>
                      </Link>
                      <p className="mt-2 text-base font-extrabold text-orange-600 tabular-nums dark:text-orange-400">
                        {formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--mp-text-muted)]">
                        <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
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

      {/* FAB mobil — deasupra bottom nav */}
      <Link
        href="/publica"
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-2xl font-bold text-white shadow-[0_12px_32px_-4px_rgba(234,88,12,0.55)] transition active:scale-95 md:hidden"
        aria-label={t("promo2Cta")}
      >
        +
      </Link>

      {/* Promo desktop */}
      <div className="mt-10 hidden md:block">
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Link
            href="/anunturi"
            className="group rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-[var(--mp-shadow-md)] transition hover:border-orange-200 hover:shadow-[var(--mp-shadow-lg)] dark:hover:border-orange-800/40"
          >
            <p className="text-sm font-bold text-[var(--mp-text)]">{t("promoTile1Title")}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--mp-text-muted)]">{t("promoTile1Body")}</p>
          </Link>
          <Link
            href="/chat"
            className="group rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-[var(--mp-shadow-md)] transition hover:border-orange-200 hover:shadow-[var(--mp-shadow-lg)] dark:hover:border-orange-800/40"
          >
            <p className="text-sm font-bold text-[var(--mp-text)]">{t("promoTile2Title")}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--mp-text-muted)]">{t("promoTile2Body")}</p>
          </Link>
          <Link
            href="/publica"
            className="group rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-6 shadow-[var(--mp-shadow-md)] transition hover:border-orange-200 hover:shadow-[var(--mp-shadow-lg)] dark:hover:border-orange-800/40"
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
