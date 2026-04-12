import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import type { CategoryRow } from "@/lib/category-queries";
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
};

export async function HomeMarketplace({ locale, listings, rootCategories }: Props) {
  const t = await getTranslations("Home.marketplace");

  return (
    <div className="bg-zinc-100/80 pb-12 pt-4 dark:bg-zinc-950">
      <div className="mx-auto max-w-[1200px] px-3 sm:px-4">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-5">
          {/* Left: categories */}
          <aside className="shrink-0 lg:w-52">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("categoriesTitle")}</p>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900 lg:flex-col lg:gap-0 lg:border-0 lg:bg-transparent lg:p-0">
              {rootCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categorii?c=${encodeURIComponent(cat.slug)}`}
                  className="text-[#0b57d0] hover:underline dark:text-blue-400"
                >
                  {labelFor(cat, locale)}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Center: grid */}
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("gridTitle")}</h1>
              <Link href="/anunturi" className="text-sm font-medium text-[#0b57d0] hover:underline dark:text-blue-400">
                {t("viewAll")}
              </Link>
            </div>
            {listings.length === 0 ? (
              <p className="rounded border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
                {t("empty")}
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((item) => {
                  const cover = parseStoredListingImages(item.images)[0];
                  const meta = [item.city + (item.district ? ` · ${item.district}` : "")];
                  if (item.mileageKm != null) {
                    meta.push(`${item.mileageKm.toLocaleString(locale)} km`);
                  }
                  return (
                    <li key={item.id}>
                      <Link
                        href={`/anunturi/${item.id}`}
                        className="flex h-full flex-col overflow-hidden rounded border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
                      >
                        <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
                          {cover ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={cover} alt="" className="h-full w-full object-cover" />
                            </>
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-zinc-400">—</div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-3">
                          <span className="line-clamp-2 text-sm font-normal leading-snug text-[#0b57d0] hover:underline dark:text-blue-400">
                            {item.title}
                          </span>
                          <span className="mt-1 text-base font-bold text-zinc-900 dark:text-zinc-50">
                            {formatPrice(item.price, locale)}
                          </span>
                          <span className="mt-1 text-xs text-zinc-500">{meta.join(" · ")}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Right: promos */}
          <aside className="hidden w-64 shrink-0 xl:block">
            <div className="space-y-4">
              <div className="rounded border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-emerald-900 dark:from-emerald-950/50 dark:to-zinc-900">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">{t("promo2Title")}</p>
                <p className="mt-2 text-xs leading-relaxed text-emerald-800/90 dark:text-emerald-300/90">{t("promo2Body")}</p>
                <Link
                  href="/publica"
                  className="mt-3 inline-block text-xs font-semibold text-emerald-700 underline dark:text-emerald-400"
                >
                  {t("promo2Cta")}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
}
