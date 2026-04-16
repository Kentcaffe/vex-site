import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { ContactSellerButton } from "@/components/chat/ContactSellerButton";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { DeleteListingButton } from "@/components/DeleteListingButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ReportListingButton } from "@/components/ReportListingButton";
import { ListingGallery } from "@/components/listing-detail/ListingGallery";
import { ListingSpecs } from "@/components/listing-detail/ListingSpecs";
import { isStaff } from "@/lib/auth-roles";
import { categoryPathLabels, getAllCategories } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import type { PriceCurrencyCode } from "@/lib/currency";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import type { ListingPayloadWithCategory } from "@/lib/prisma-listing-casts";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

function conditionLabel(
  condition: string,
  t: Awaited<ReturnType<typeof getTranslations>>,
): string {
  if (condition === "new") {
    return t("conditionNew");
  }
  if (condition === "used") {
    return t("conditionUsed");
  }
  return t("conditionNA");
}

export default async function ListingDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [listing, allCats, session, t] = await Promise.all([
    prisma.listing.findUnique({
      where: { id },
      include: { category: true },
    }) as Promise<ListingPayloadWithCategory | null>,
    getAllCategories(),
    auth(),
    getTranslations("ListingDetail"),
  ]);

  const userId = session?.user?.id;
  let favorited = false;
  if (userId) {
    const fav = await prisma.listingFavorite.findUnique({
      where: { userId_listingId: { userId, listingId: id } },
      select: { id: true },
    });
    favorited = !!fav;
  }

  if (!listing) {
    notFound();
  }

  const images = parseStoredListingImages(listing.images);
  const path = categoryPathLabels(allCats, listing.categoryId, locale);
  const canModerate = session?.user && isStaff(session.user.role);
  const isOwner = !!userId && listing.userId === userId;
  const canReport = !!userId && !isOwner;

  return (
    <div className="app-shell app-section">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <ListingGallery images={images} title={listing.title} />
          <div className="surface-card p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{path}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{listing.title}</h1>
            <p className="mt-4 text-4xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatPrice(listing.price, locale, listing.priceCurrency as PriceCurrencyCode)}
            </p>
            {listing.negotiable ? <p className="mt-1 text-sm text-zinc-500">{t("negotiable")}</p> : null}
          </div>
          <div className="surface-card p-5 sm:p-6">
            <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-700 dark:text-zinc-300">{listing.description}</p>
          </div>
          <ListingSpecs categorySlug={listing.category.slug} listing={listing} />
        </div>
        <aside className="space-y-4">
          <div className="surface-card sticky top-24 p-5">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t("factsTitle")}</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">{t("city")}</dt>
                <dd className="text-right font-medium">
                  {listing.city}
                  {listing.district ? ` · ${listing.district}` : ""}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">{t("condition")}</dt>
                <dd className="text-right font-medium">{conditionLabel(listing.condition, t)}</dd>
              </div>
              {listing.phone ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">{t("phone")}</dt>
                  <dd className="text-right font-medium">
                    <a href={`tel:${listing.phone}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                      {listing.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <ContactSellerButton listingId={listing.id} sellerUserId={listing.userId} />
              <CopyLinkButton />
            </div>
            <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              {userId ? (
                <>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("favoritesHint")}</p>
                  <div className="mt-2">
                    <FavoriteButton listingId={listing.id} initialFavorited={favorited} />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("favoritesLogin")}</p>
                  <div className="mt-2">
                    <Link href="/cont" className="btn-secondary min-h-[42px] rounded-lg px-3 py-2 text-sm">
                      {t("favoritesCtaLogin")}
                    </Link>
                  </div>
                </>
              )}
            </div>
            {canReport ? (
              <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("reportHint")}</p>
                <div className="mt-2">
                  <ReportListingButton listingId={listing.id} />
                </div>
              </div>
            ) : null}
          </div>
          {canModerate ? (
            <div className="surface-muted p-4">
              <p className="text-xs font-medium text-amber-900 dark:text-amber-200">{t("moderation")}</p>
              <div className="mt-2">
                <DeleteListingButton listingId={listing.id} />
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
