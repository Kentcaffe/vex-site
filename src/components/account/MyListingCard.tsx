"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ListingCoverImg } from "@/components/listing/ListingCoverImg";
import { ListingImagePlaceholder } from "@/components/listing/ListingImagePlaceholder";
import { OwnListingDeleteButton } from "@/components/account/OwnListingDeleteButton";

type Props = {
  listingId: string;
  viewHref: string;
  editHref: string;
  redirectAfterDeleteHref: string;
  title: string;
  coverSrc: string | null;
  priceText: string;
  metaLine: string;
  listTitle: string;
  listHint: string;
};

export function MyListingCard({
  listingId,
  viewHref,
  editHref,
  redirectAfterDeleteHref,
  title,
  coverSrc,
  priceText,
  metaLine,
  listTitle,
  listHint,
}: Props) {
  const t = useTranslations("AccountHub");

  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900/40">
      <Link
        href={viewHref}
        className="group relative z-0 block min-w-0 touch-manipulation"
        prefetch={false}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {coverSrc ? (
            <ListingCoverImg
              src={coverSrc}
              alt={title}
              className="h-full w-full object-cover transition duration-200 group-active:scale-[1.02]"
            />
          ) : (
            <ListingImagePlaceholder title={listTitle} hint={listHint} />
          )}
        </div>
        <div className="min-w-0 p-4">
          <h2 className="line-clamp-2 text-base font-semibold text-zinc-900 group-active:text-emerald-800 dark:text-zinc-50 dark:group-active:text-emerald-400">
            {title}
          </h2>
          <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{metaLine}</p>
          <p className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">{priceText}</p>
        </div>
      </Link>
      <div className="relative z-10 flex min-h-[52px] flex-col gap-2 border-t border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/60 sm:flex-row sm:items-stretch">
        <Link
          href={viewHref}
          className="inline-flex min-h-[48px] flex-1 touch-manipulation items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-800 transition active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:active:bg-zinc-700"
          prefetch={false}
        >
          {t("myListingView")}
        </Link>
        <Link
          href={editHref}
          className="inline-flex min-h-[48px] flex-1 touch-manipulation items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-900 transition active:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100 dark:active:bg-emerald-950/80"
          prefetch={false}
        >
          {t("myListingEdit")}
        </Link>
        <div className="flex-1 sm:max-w-[140px]">
          <OwnListingDeleteButton
            listingId={listingId}
            redirectHref={redirectAfterDeleteHref}
            variant="account"
          />
        </div>
      </div>
    </li>
  );
}
