import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { DeleteListingButton } from "@/components/DeleteListingButton";
import { ListingGallery } from "@/components/listing-detail/ListingGallery";
import { ListingSpecs } from "@/components/listing-detail/ListingSpecs";
import { isStaff } from "@/lib/auth-roles";
import { categoryPathLabels, getAllCategories } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import { prisma } from "@/lib/prisma";

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
    }),
    getAllCategories(),
    auth(),
    getTranslations("ListingDetail"),
  ]);

  if (!listing) {
    notFound();
  }

  const images = parseStoredListingImages(listing.images);
  const path = categoryPathLabels(allCats, listing.categoryId, locale);
  const canModerate = session?.user && isStaff(session.user.role);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <ListingGallery images={images} title={listing.title} />
          <div>
            <p className="text-xs text-zinc-500">{path}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{listing.title}</h1>
            <p className="mt-3 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(listing.price, locale)}</p>
            {listing.negotiable ? <p className="mt-1 text-sm text-zinc-500">{t("negotiable")}</p> : null}
          </div>
          <div>
            <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{listing.description}</p>
          </div>
          <ListingSpecs categorySlug={listing.category.slug} listing={listing} />
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("factsTitle")}</h2>
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
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyLinkButton />
            </div>
          </div>
          {canModerate ? (
            <div className="rounded-2xl border border-zinc-200 bg-amber-50 p-4 dark:border-zinc-800 dark:bg-amber-950/30">
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
