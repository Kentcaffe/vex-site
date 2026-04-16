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
};

export async function HomeMarketplace({ locale, listings, rootCategories, favoritedIds }: Props) {
  const t = await getTranslations("Home.marketplace");

  return (
    <div className="app-shell app-section">
      <div className="space-y-6">
        <section className="surface-card overflow-hidden p-4 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                Marketplace VEX
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                {t("gridTitle")}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-base">
                {t("categoriesHint")}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/anunturi" className="btn-primary">
                  {t("viewAll")}
                </Link>
                <Link href="/publica" className="btn-secondary">
                  {t("promo2Cta")}
                </Link>
              </div>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("promo2Title")}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t("promo2Body")}</p>
              <Link href="/publica" className="btn-primary mt-4 w-full">
                {t("promo2Cta")}
              </Link>
            </div>
          </div>
        </section>

        <section className="surface-card p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("categoriesTitle")}</h2>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{t("categoriesHint")}</p>
            </div>
            <Link
              href="/categorii"
              className="text-sm font-semibold text-[#0b57d0] active:opacity-80 lg:hover:underline dark:text-blue-400"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {rootCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categorii?c=${encodeURIComponent(cat.slug)}`}
                className="surface-muted flex min-h-[84px] flex-col items-center justify-center gap-2 p-3 text-center transition active:scale-[0.98] lg:hover:border-emerald-300 lg:hover:bg-emerald-50/70 lg:hover:shadow-md dark:lg:hover:border-emerald-700 dark:lg:hover:bg-emerald-950/20"
              >
                <span className="text-3xl leading-none" aria-hidden>
                  {emojiForRootSlug(cat.slug)}
                </span>
                <span className="line-clamp-2 text-center text-sm font-semibold leading-snug text-zinc-800 dark:text-zinc-100">
                  {labelFor(cat, locale)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Promo tiles */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Link
            href="/anunturi"
            className="surface-card p-5 transition active:scale-[0.99] lg:hover:border-emerald-200 lg:hover:shadow-md dark:lg:hover:border-emerald-900"
          >
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t("promoTile1Title")}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t("promoTile1Body")}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-emerald-700 dark:text-emerald-400">{t("promoTile1Link")} →</span>
          </Link>
          <Link
            href="/chat"
            className="surface-card p-5 transition active:scale-[0.99] lg:hover:border-emerald-200 lg:hover:shadow-md dark:lg:hover:border-emerald-900"
          >
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t("promoTile2Title")}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t("promoTile2Body")}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-emerald-700 dark:text-emerald-400">{t("promoTile2Link")} →</span>
          </Link>
          <Link
            href="/publica"
            className="surface-card p-5 transition active:scale-[0.99] lg:hover:border-emerald-200 lg:hover:shadow-md dark:lg:hover:border-emerald-900"
          >
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t("promoTile3Title")}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t("promoTile3Body")}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-emerald-700 dark:text-emerald-400">{t("promoTile3Link")} →</span>
          </Link>
        </section>

        <section className="surface-card p-4 sm:p-5">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-6">
            <div className="min-w-0 flex-1">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("gridTitle")}</h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("sortLabel")}:</span> {t("sortNewest")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/anunturi" className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                  {t("filterLink")}
                </Link>
                <Link href="/anunturi" className="btn-secondary min-h-[42px] px-4 py-2">
                  {t("viewAll")}
                </Link>
              </div>
            </div>

            {listings.length === 0 ? (
              <p className="surface-muted p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {t("empty")}
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((item, index) => {
                  const cover = parseStoredListingImages(item.images)[0];
                  const meta = [item.city + (item.district ? ` · ${item.district}` : "")];
                  if (item.mileageKm != null) {
                    meta.push(`${item.mileageKm.toLocaleString(locale)} km`);
                  }
                  return (
                    <li key={item.id} className="group relative">
                      <div className="flex h-full flex-col overflow-hidden rounded-[16px] border border-zinc-200/90 bg-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_22px_50px_-30px_rgba(5,150,105,0.35)] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700">
                        <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
                          <Link href={`/anunturi/${item.id}`} className="absolute inset-0 z-0 block" aria-label={item.title}>
                            {cover ? (
                              <ListingCoverImg
                                src={cover}
                                alt=""
                                priority={index < 2}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-zinc-400">—</div>
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
                        <div className="flex flex-1 flex-col p-4">
                          <Link href={`/anunturi/${item.id}`} className="block">
                            <span className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 group-hover:text-emerald-700 dark:text-zinc-50 dark:group-hover:text-emerald-400">
                              {item.title}
                            </span>
                          </Link>
                          <span className="mt-3 text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                            {formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                          </span>
                          <span className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{meta.join(" · ")}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            </div>

            <aside className="w-full shrink-0 space-y-4 xl:w-72">
              <div className="surface-muted p-5">
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">{t("promo2Title")}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t("promo2Body")}</p>
                <Link href="/publica" className="btn-primary mt-4 w-full">
                  {t("promo2Cta")}
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
      <ScrollToTopButton />
    </div>
  );
}
