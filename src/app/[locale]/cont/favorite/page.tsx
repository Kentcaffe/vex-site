import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { categoryPathLabels, getAllCategories } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import type { PriceCurrencyCode } from "@/lib/currency";
import { ListingCoverImg } from "@/components/listing/ListingCoverImg";
import { ListingImagePlaceholder } from "@/components/listing/ListingImagePlaceholder";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import { localizedHref } from "@/lib/paths";
import { asListingSelect, type FavoriteRowWithListing } from "@/lib/prisma-listing-casts";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FavoriteListPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }

  const t = await getTranslations("Favorites");
  const tList = await getTranslations("Listings");
  const [rows, allCats] = await Promise.all([
    prisma.listingFavorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        listing: {
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
        },
      },
    }) as unknown as Promise<FavoriteRowWithListing[]>,
    getAllCategories(),
  ]);

  return (
    <div className="app-shell app-section max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("title")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>

      {rows.length === 0 ? (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {rows.map(({ listing: item }) => {
            const path = categoryPathLabels(allCats, item.categoryId, locale);
            const cover = parseStoredListingImages(item.images)[0];
            return (
              <li key={item.id}>
                <Link
                  href={`/anunturi/${item.id}`}
                  className="group flex gap-4 rounded-[16px] border border-zinc-200 bg-white p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_22px_50px_-30px_rgba(5,150,105,0.35)] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700 sm:p-5"
                >
                  {cover ? (
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                      <ListingCoverImg src={cover} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-200/80 dark:border-zinc-600 dark:bg-zinc-800/90">
                      <ListingImagePlaceholder
                        compact
                        title={tList("cardNoImageTitle")}
                        hint={tList("cardNoImageHint")}
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-zinc-900 transition group-hover:text-emerald-700 dark:text-zinc-50 dark:group-hover:text-emerald-400">{item.title}</h2>
                    <p className="mt-1 text-xs text-zinc-500">{path}</p>
                    <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
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
  );
}
