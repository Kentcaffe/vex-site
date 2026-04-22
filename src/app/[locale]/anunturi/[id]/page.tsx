import type { Metadata } from "next";
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
import { isAdmin, isStaff } from "@/lib/auth-roles";
import { categoryPathLabels, getAllCategories } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import type { PriceCurrencyCode } from "@/lib/currency";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import { findFirstListingResilient } from "@/lib/prisma-listing-queries";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";
import { resolvePublicMediaUrl } from "@/lib/media-url";
import { listingSeoPath } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { localizedHref } from "@/lib/paths";
import { OwnListingDeleteButton } from "@/components/account/OwnListingDeleteButton";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

type ListingDetailRow = {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  priceCurrency?: string | null;
  negotiable: boolean;
  city: string;
  district: string | null;
  phone: string | null;
  condition: string;
  images: string | null;
  categoryId: string;
  brand: string | null;
  modelName: string | null;
  year: number | null;
  mileageKm: number | null;
  rooms: string | null;
  areaSqm: number | null;
  detailsJson: string | null;
  category?: { slug?: string | null } | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const listing = await findFirstListingResilient({
      where: { id, ...listingWhereActive() },
      select: {
        id: true,
        title: true,
        city: true,
        description: true,
        images: true,
      },
    });
    if (!listing) {
      return {
        title: "Anunț indisponibil",
        description: "Acest anunț nu mai este disponibil pe VEX.",
      };
    }

    const image = resolvePublicMediaUrl(parseStoredListingImages(listing.images)[0] ?? null) ?? "/marketplace-image-fallback.svg";
    const description = `${listing.title} de vânzare în ${listing.city} pe VEX. Vezi poze și detalii complete.`;

    return {
      title: `${listing.title} de vânzare în ${listing.city}`,
      description,
      alternates: {
        canonical: listingSeoPath({ id: listing.id, title: listing.title, city: listing.city }),
      },
      openGraph: {
        title: listing.title,
        description,
        type: "article",
        images: [{ url: image, alt: listing.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: listing.title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    console.error("[anunturi/[id]] generateMetadata failed", error);
    return {
      title: "Anunț indisponibil",
      description: "Acest anunț nu mai este disponibil pe VEX.",
    };
  }
}

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

  let listing: ListingDetailRow | null = null;
  let allCats: Awaited<ReturnType<typeof getAllCategories>> = [];
  let session: Awaited<ReturnType<typeof auth>> = null;
  let t: Awaited<ReturnType<typeof getTranslations>>;

  try {
    [listing, allCats, session, t] = await Promise.all([
      findFirstListingResilient({
        where: { id, ...listingWhereActive() },
        select: {
          id: true,
          userId: true,
          title: true,
          description: true,
          price: true,
          priceCurrency: true,
          negotiable: true,
          city: true,
          district: true,
          phone: true,
          condition: true,
          images: true,
          categoryId: true,
          brand: true,
          modelName: true,
          year: true,
          mileageKm: true,
          rooms: true,
          areaSqm: true,
          detailsJson: true,
          category: { select: { slug: true } },
        },
      }) as Promise<ListingDetailRow | null>,
      getAllCategories(),
      auth(),
      getTranslations("ListingDetail"),
    ]);
  } catch (error) {
    console.error("[anunturi/[id]] failed to load listing detail dependencies", error);
    return (
      <div className="app-shell app-section">
        <div className="surface-card p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Nu am putut încărca anunțul</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            A apărut o eroare temporară. Încearcă din nou în câteva momente.
          </p>
        </div>
      </div>
    );
  }

  const userId = session?.user?.id;
  let favorited = false;
  if (userId) {
    try {
      const fav = await prisma.listingFavorite.findUnique({
        where: { userId_listingId: { userId, listingId: id } },
        select: { id: true },
      });
      favorited = !!fav;
    } catch (error) {
      console.error("[anunturi/[id]] failed to load favorite state", error);
      favorited = false;
    }
  }

  if (!listing) {
    notFound();
  }
  const listingCategorySlug = (listing as { category?: { slug?: string | null } | null }).category?.slug ?? "";

  const images = parseStoredListingImages(listing.images);
  const path = categoryPathLabels(allCats, listing.categoryId, locale);
  const canModerate = session?.user && isStaff(session.user.role);
  const canAdminDeleteListing = session?.user && isAdmin(session.user.role);
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
          {listingCategorySlug ? <ListingSpecs categorySlug={listingCategorySlug} listing={listing} /> : null}
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
            {isOwner ? (
              <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{t("ownerActionsTitle")}</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Link
                    href={localizedHref(locale, `/cont/anunturi/${listing.id}/edit`)}
                    className="inline-flex min-h-[48px] flex-1 touch-manipulation items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 transition active:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100 dark:active:bg-emerald-950/80 sm:flex-none"
                  >
                    {t("ownerEdit")}
                  </Link>
                  <OwnListingDeleteButton
                    listingId={listing.id}
                    redirectHref={localizedHref(locale, "/cont/anunturi")}
                    variant="detail"
                  />
                </div>
              </div>
            ) : null}
          </div>
          {canModerate && canAdminDeleteListing ? (
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
