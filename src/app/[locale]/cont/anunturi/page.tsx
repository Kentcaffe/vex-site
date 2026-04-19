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
import { asListingSelect, type ListingBrowseRow } from "@/lib/prisma-listing-casts";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export default async function ContMyListingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }

  const t = await getTranslations("AccountHub");
  const tList = await getTranslations("Listings");

  const [rowsRaw, allCats] = await Promise.all([
    prisma.listing.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 120,
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
    }),
    getAllCategories(),
  ]);
  const rows = rowsRaw as unknown as ListingBrowseRow[];

  return (
    <div className="app-shell app-section max-w-4xl">
      <Link
        href="/cont"
        className="mb-4 inline-flex text-sm font-semibold text-emerald-800 hover:underline"
      >
        ← {t("backToAccount")}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{t("myListingsTitle")}</h1>
      <p className="mt-2 text-sm text-zinc-600">{t("myListingsSubtitle")}</p>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-14 text-center">
          <p className="text-zinc-600">{t("myListingsEmpty")}</p>
          <Link
            href="/publica"
            className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 text-sm font-semibold text-white shadow-md"
          >
            {t("publishFirst")}
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {rows.map((item) => {
            const path = categoryPathLabels(allCats, item.categoryId, locale);
            const cover = parseStoredListingImages(item.images)[0];
            return (
              <li key={item.id}>
                <Link
                  href={`/anunturi/${item.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                    {cover ? (
                      <ListingCoverImg src={cover} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
                    ) : (
                      <ListingImagePlaceholder title={tList("cardNoImageTitle")} hint={tList("cardNoImageHint")} />
                    )}
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col p-4">
                    <h2 className="line-clamp-2 text-base font-semibold text-zinc-900 group-hover:text-emerald-800">
                      {item.title}
                    </h2>
                    <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{path}</p>
                    <p className="mt-2 text-lg font-bold text-emerald-600">
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
