import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { ModeratorDeleteListingButton } from "@/components/ModeratorDeleteListingButton";
import { isStaff } from "@/lib/auth-roles";
import { Link } from "@/i18n/navigation";
import { categoryPathLabels, getAllCategories } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import { getListingSpecEntries } from "@/lib/listing-detail-config";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ListingDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      category: { select: { slug: true } },
    },
  });

  if (!listing) {
    notFound();
  }

  const session = await auth();

  const [t, tCond, tForm, tAdmin, allCats] = await Promise.all([
    getTranslations("Listings"),
    getTranslations("Condition"),
    getTranslations("ListingForm"),
    getTranslations("Admin"),
    getAllCategories(),
  ]);

  const canModerate = Boolean(session?.user?.id && isStaff(session.user.role));

  const contact = listing.user.name?.trim() || listing.user.email;
  const path = categoryPathLabels(allCats, listing.categoryId, locale);
  const images = parseStoredListingImages(listing.images);
  const coverUrl = images[0];
  const galleryRest = images.slice(1);

  const specs = getListingSpecEntries(listing.category.slug, listing, (key) => tForm(key as never), locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/anunturi"
        className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
      >
        {t("back")}
      </Link>
      <header className="mt-6 space-y-2">
        <p className="text-sm text-zinc-500">{path}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {listing.title}
        </h1>
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
            {formatPrice(listing.price, locale)}
          </p>
          {listing.negotiable ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              {t("negotiableBadge")}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {listing.city}
          {listing.district ? ` · ${listing.district}` : ""}
        </p>
        <p className="text-sm text-zinc-500">
          {t("condition")}:{" "}
          {tCond(
            listing.condition === "new" || listing.condition === "used" || listing.condition === "not_applicable"
              ? listing.condition
              : "not_applicable",
          )}
        </p>
      </header>

      {coverUrl ? (
        <div className="mt-8">
          <a
            href={coverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt=""
              className="max-h-[min(420px,50vh)] w-full object-contain"
            />
          </a>
        </div>
      ) : null}
      {galleryRest.length > 0 ? (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {galleryRest.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      ) : null}

      <div className="mt-8">
        <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
          {listing.description}
        </p>
      </div>

      {specs.length > 0 ? (
        <dl className="mt-10 grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/40 sm:grid-cols-2">
          {specs.map((s) => (
            <div key={s.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{s.label}</dt>
              <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{s.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <footer className="mt-10 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        {listing.phone ? (
          <p className="mb-2">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{t("phone")}:</span>{" "}
            <a href={`tel:${listing.phone.replace(/\s/g, "")}`} className="text-emerald-700 underline dark:text-emerald-400">
              {listing.phone}
            </a>
          </p>
        ) : null}
        <p>
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{t("postedBy")}:</span> {contact}
        </p>
        <p className="mt-1">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{t("postedAt")}:</span>{" "}
          {listing.createdAt.toLocaleString(locale)}
        </p>
      </footer>

      {canModerate ? (
        <section
          className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900 dark:bg-amber-950/30"
          aria-label={tAdmin("detailModeration")}
        >
          <h2 className="text-sm font-semibold text-amber-950 dark:text-amber-100">{tAdmin("detailModeration")}</h2>
          <p className="mt-1 text-xs text-amber-900/90 dark:text-amber-200/90">{tAdmin("detailModerationHint")}</p>
          <div className="mt-4">
            <ModeratorDeleteListingButton listingId={listing.id} />
          </div>
        </section>
      ) : null}
    </article>
  );
}
