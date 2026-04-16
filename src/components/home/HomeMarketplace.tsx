import { getTranslations } from "next-intl/server";
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

  return (
    <div className="app-shell app-section">
      <div className="space-y-6 pb-24">
        <section className="surface-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">{t("gridTitle")}</h1>
            <Link href="/cont" className="rounded-full border border-zinc-200 p-2.5 text-zinc-700">
              <span aria-hidden>👤</span>
              <span className="sr-only">Cont</span>
            </Link>
          </div>

          <form action="/anunturi" method="get" className="sticky top-0 z-20 mt-4 bg-[#f8fafc] py-1">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden>
                ⌕
              </span>
              <input
                type="search"
                name="search"
                placeholder="Caută anunțuri..."
                className="field-input h-[52px] rounded-[20px] border-zinc-200 bg-zinc-100 pl-11 pr-4 text-base"
                autoComplete="off"
              />
            </div>
          </form>
        </section>

        <section className="surface-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-zinc-900">{t("categoriesTitle")}</h2>
            <Link href="/categorii" className="text-sm font-semibold text-[#0b57d0]">
              {t("viewAll")}
            </Link>
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {rootCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categorii?c=${encodeURIComponent(cat.slug)}`}
                className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm"
              >
                <span className="mr-1.5" aria-hidden>
                  {emojiForRootSlug(cat.slug)}
                </span>
                {labelFor(cat, locale)}
              </Link>
            ))}
          </div>
        </section>

        <section className="surface-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-zinc-500">{listings.length} rezultate</p>
            <Link href="/anunturi" className="text-sm font-semibold text-emerald-700">
              {t("viewAll")}
            </Link>
          </div>

          {loadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
              <p className="text-sm font-medium text-red-700">Eroare la încărcarea anunțurilor.</p>
              <p className="mt-1 text-sm text-red-600">Încearcă refresh sau revino în câteva momente.</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
              <p className="text-sm text-zinc-600">{t("empty")}</p>
              <Link href="/publica" className="btn-primary mt-4 w-full sm:w-auto">
                Adaugă primul anunț
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3">
              {listings.map((item, index) => {
                const cover = parseStoredListingImages(item.images)[0];
                const place = item.city + (item.district ? ` · ${item.district}` : "");
                return (
                  <li key={item.id} className="group">
                    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                      <div className="relative aspect-square bg-zinc-100">
                        <Link href={`/anunturi/${item.id}`} className="absolute inset-0 z-0 block" aria-label={item.title}>
                          {cover ? (
                            <ListingCoverImg
                              src={cover}
                              alt=""
                              priority={index < 2}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-zinc-400">Fără imagine</div>
                          )}
                        </Link>
                        <div className="absolute right-2 top-2 z-10">
                          <FavoriteButton
                            listingId={item.id}
                            initialFavorited={favoritedIds.has(item.id)}
                            variant="icon"
                          />
                        </div>
                      </div>
                      <div className="p-3">
                        <Link href={`/anunturi/${item.id}`} className="block">
                          <span className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
                            {item.title}
                          </span>
                        </Link>
                        <p className="mt-2 text-base font-bold text-emerald-700">
                          {formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{place}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <Link
          href="/publica"
          className="fixed bottom-[5.2rem] left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-600 text-3xl font-bold text-white shadow-[0_10px_24px_rgba(5,150,105,0.45)] md:hidden"
          aria-label={t("promo2Cta")}
        >
          +
        </Link>
        <div className="hidden md:block">
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Link href="/anunturi" className="surface-card p-5">
              <p className="text-sm font-bold text-zinc-900">{t("promoTile1Title")}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t("promoTile1Body")}</p>
            </Link>
            <Link href="/chat" className="surface-card p-5">
              <p className="text-sm font-bold text-zinc-900">{t("promoTile2Title")}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t("promoTile2Body")}</p>
            </Link>
            <Link href="/publica" className="surface-card p-5">
              <p className="text-sm font-bold text-zinc-900">{t("promoTile3Title")}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t("promoTile3Body")}</p>
            </Link>
          </section>
        </div>
        {false ? (
          <section className="surface-card p-4">
            <ul className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <div className="aspect-square animate-pulse bg-zinc-200" />
                  <div className="space-y-2 p-3">
                    <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      <ScrollToTopButton />
    </div>
  );
}
