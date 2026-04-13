import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import type { CategoryRow } from "@/lib/category-queries";
import { emojiForRootSlug } from "@/lib/category-icons";
import { formatPrice } from "@/lib/formatPrice";
import { parseStoredListingImages } from "@/lib/listing-form-schema";

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

type ListingCard = {
  id: string;
  title: string;
  price: number;
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
    <div className="bg-[#f2f3f5] pb-12 pt-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-[1200px] px-3 sm:px-4">
        {/* Category strip — 999-style horizontal cards */}
        <section className="mb-6">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("categoriesTitle")}</h2>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{t("categoriesHint")}</p>
            </div>
            <Link
              href="/categorii"
              className="text-sm font-semibold text-[#0b57d0] hover:underline dark:text-blue-400"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
            {rootCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categorii?c=${encodeURIComponent(cat.slug)}`}
                className="flex min-w-[104px] max-w-[120px] shrink-0 flex-col items-center rounded-2xl border border-zinc-200/90 bg-white p-3 text-center shadow-sm transition hover:border-[#0b57d0]/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500/50"
              >
                <span className="text-3xl leading-none" aria-hidden>
                  {emojiForRootSlug(cat.slug)}
                </span>
                <span className="mt-2 line-clamp-2 text-center text-xs font-semibold leading-tight text-zinc-800 dark:text-zinc-100">
                  {labelFor(cat, locale)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Promo tiles */}
        <section className="mb-8 grid gap-3 sm:grid-cols-3">
          <Link
            href="/anunturi"
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900"
          >
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t("promoTile1Title")}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{t("promoTile1Body")}</p>
            <span className="mt-3 inline-block text-xs font-semibold text-[#0b57d0] dark:text-blue-400">{t("promoTile1Link")} →</span>
          </Link>
          <Link
            href="/chat"
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900"
          >
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t("promoTile2Title")}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{t("promoTile2Body")}</p>
            <span className="mt-3 inline-block text-xs font-semibold text-[#0b57d0] dark:text-blue-400">{t("promoTile2Link")} →</span>
          </Link>
          <Link
            href="/publica"
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-amber-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-900/50"
          >
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t("promoTile3Title")}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{t("promoTile3Body")}</p>
            <span className="mt-3 inline-block text-xs font-semibold text-amber-700 dark:text-amber-400">{t("promoTile3Link")} →</span>
          </Link>
        </section>

        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("gridTitle")}</h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("sortLabel")}:</span> {t("sortNewest")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/anunturi"
                  className="text-sm font-semibold text-[#0b57d0] hover:underline dark:text-blue-400"
                >
                  {t("filterLink")}
                </Link>
                <Link
                  href="/anunturi"
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {t("viewAll")}
                </Link>
              </div>
            </div>

            {listings.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
                {t("empty")}
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((item) => {
                  const cover = parseStoredListingImages(item.images)[0];
                  const meta = [item.city + (item.district ? ` · ${item.district}` : "")];
                  if (item.mileageKm != null) {
                    meta.push(`${item.mileageKm.toLocaleString(locale)} km`);
                  }
                  return (
                    <li key={item.id} className="group relative">
                      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-md transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600">
                        <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
                          <Link href={`/anunturi/${item.id}`} className="absolute inset-0 z-0 block" aria-label={item.title}>
                            {cover ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={cover} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                              </>
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
                        <div className="flex flex-1 flex-col p-3">
                          <Link href={`/anunturi/${item.id}`} className="block">
                            <span className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-[#0b57d0] dark:text-zinc-50 dark:group-hover:text-blue-400">
                              {item.title}
                            </span>
                          </Link>
                          <span className="mt-2 text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                            {formatPrice(item.price, locale)}
                          </span>
                          <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{meta.join(" · ")}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <aside className="w-full shrink-0 space-y-4 xl:w-72">
            <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm dark:border-emerald-900 dark:from-emerald-950/40 dark:to-zinc-900">
              <p className="text-base font-bold text-emerald-900 dark:text-emerald-200">{t("promo2Title")}</p>
              <p className="mt-2 text-sm leading-relaxed text-emerald-900/85 dark:text-emerald-300/90">{t("promo2Body")}</p>
              <Link
                href="/publica"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                {t("promo2Cta")}
              </Link>
            </div>
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-100/80 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("adPlaceholderTitle")}</p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">{t("adPlaceholderBody")}</p>
              <div className="mx-auto mt-4 flex h-28 max-w-[200px] items-center justify-center rounded-xl bg-zinc-200/80 text-[10px] text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
                300×250
              </div>
            </div>
          </aside>
        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
}
