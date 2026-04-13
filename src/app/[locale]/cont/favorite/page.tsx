import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { categoryPathLabels, getAllCategories } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import { ListingCoverImg } from "@/components/listing/ListingCoverImg";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import { localizedHref } from "@/lib/paths";
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
  const [rows, allCats] = await Promise.all([
    prisma.listingFavorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            district: true,
            images: true,
            categoryId: true,
          },
        },
      },
    }),
    getAllCategories(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
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
                  className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 sm:p-5"
                >
                  {cover ? (
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                      <ListingCoverImg src={cover} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-400 dark:border-zinc-600 dark:bg-zinc-800">
                      —
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h2>
                    <p className="mt-1 text-xs text-zinc-500">{path}</p>
                    <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(item.price, locale)}</p>
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
