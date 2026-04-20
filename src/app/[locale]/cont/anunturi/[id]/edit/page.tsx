import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { buildPublishValuesForEdit } from "@/lib/listing-edit-hydration";
import { getCategoryTreeForPicker } from "@/lib/category-queries";
import { localizedHref } from "@/lib/paths";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string; id: string }> };

const ListingForm = dynamic(
  () => import("@/components/ListingForm").then((m) => m.ListingForm),
  {
    loading: () => (
      <div
        className="animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50/90 p-12 min-h-[min(70vh,480px)]"
        aria-hidden
      />
    ),
  },
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Publish" });
  return { title: t("editTitle") };
}

export default async function EditMyListingPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }

  const tPub = await getTranslations("Publish");
  const tHub = await getTranslations("AccountHub");

  const listing = await prisma.listing.findFirst({
    where: { id, userId: session.user.id, ...listingWhereActive() },
    select: {
      categoryId: true,
      title: true,
      description: true,
      price: true,
      priceCurrency: true,
      negotiable: true,
      city: true,
      district: true,
      phone: true,
      condition: true,
      brand: true,
      modelName: true,
      year: true,
      mileageKm: true,
      rooms: true,
      areaSqm: true,
      images: true,
      detailsJson: true,
    },
  });
  if (!listing) {
    notFound();
  }

  const categoryTree = await getCategoryTreeForPicker(locale);
  if (categoryTree.length === 0) {
    return (
      <div className="app-shell app-section mx-auto max-w-2xl">
        <p className="text-zinc-600 dark:text-zinc-400">{tPub("noCategories")}</p>
      </div>
    );
  }

  const snapshot = buildPublishValuesForEdit(listing);

  return (
    <div className="app-shell app-section">
      <Link
        href="/cont/anunturi"
        className="mb-4 inline-flex min-h-[44px] touch-manipulation items-center text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
      >
        ← {tHub("myListingsTitle")}
      </Link>
      <h1 className="page-heading text-2xl sm:text-3xl">{tPub("editTitle")}</h1>
      <p className="page-subheading mt-2">{tPub("editSubtitle")}</p>
      <div className="mt-8">
        <ListingForm
          locale={locale}
          userId={session.user.id}
          categoryTree={categoryTree}
          editListingId={id}
          initialEditSnapshot={snapshot}
        />
      </div>
    </div>
  );
}
