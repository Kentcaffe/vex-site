import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { categoryPathLabels, getAllCategories } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import type { PriceCurrencyCode } from "@/lib/currency";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import { localizedHref } from "@/lib/paths";
import { MyListingCard } from "@/components/account/MyListingCard";
import { asListingSelect, type ListingBrowseRow } from "@/lib/prisma-listing-casts";
import { prisma } from "@/lib/prisma";
import { listingSeoPath } from "@/lib/seo";

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
            const listingHref = listingSeoPath({ id: item.id, title: item.title, city: item.city });
            const editHref = localizedHref(locale, `/cont/anunturi/${item.id}/edit`);
            const metaLine = `${path} · ${item.city}${item.district ? ` · ${item.district}` : ""}`;
            return (
              <MyListingCard
                key={item.id}
                listingId={item.id}
                viewHref={listingHref}
                editHref={editHref}
                redirectAfterDeleteHref={localizedHref(locale, "/cont/anunturi")}
                title={item.title}
                coverSrc={cover ?? null}
                priceText={formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                metaLine={metaLine}
                listTitle={tList("cardNoImageTitle")}
                listHint={tList("cardNoImageHint")}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
