"use client";

import { memo } from "react";
import { CheckCircle, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { UserBadges } from "@/components/business/UserBadges";
import { ListingCoverImg } from "@/components/listing/ListingCoverImg";
import { ListingImagePlaceholder } from "@/components/listing/ListingImagePlaceholder";

export type HomeListingCardProps = {
  listingId: string;
  listingHref: string;
  title: string;
  formattedPrice: string;
  place: string;
  coverSrc: string | null;
  coverAlt: string;
  priority: boolean;
  initialFavorited: boolean;
  noImageTitle: string;
  noImageHint: string;
  user?: {
    accountType?: string | null;
    isVerified?: boolean | null;
    businessStatus?: string | null;
    companyName?: string | null;
  } | null;
};

export const HomeListingCard = memo(function HomeListingCard({
  listingId,
  listingHref,
  title,
  formattedPrice,
  place,
  coverSrc,
  coverAlt,
  priority,
  initialFavorited,
  noImageTitle,
  noImageHint,
  user,
}: HomeListingCardProps) {
  const isBusiness = user?.accountType === "business";
  const companyName = user?.companyName?.trim() || "";
  const isVerified = isBusiness && Boolean(user?.isVerified);

  return (
    <li className="group">
      <article className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-3xl border border-zinc-200/90 bg-white shadow-[0_10px_36px_-14px_rgb(15_23_42/0.12)] transition duration-300 ease-out will-change-transform hover:-translate-y-1 hover:scale-[1.02] hover:border-emerald-200/70 hover:shadow-[0_22px_48px_-16px_rgb(5_150_105/0.2)] motion-reduce:transition-shadow motion-reduce:hover:scale-100">
        <div className="relative mp-card-image">
          <Link href={listingHref} className="absolute inset-0 z-0 block" aria-label={title}>
            {coverSrc ? (
              <ListingCoverImg
                src={coverSrc}
                alt={coverAlt}
                priority={priority}
                className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.06]"
              />
            ) : (
              <ListingImagePlaceholder title={noImageTitle} hint={noImageHint} className="bg-zinc-100" />
            )}
          </Link>
          <div className="absolute right-2.5 top-2.5 z-10">
            <FavoriteButton listingId={listingId} initialFavorited={initialFavorited} variant="icon" />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <Link href={listingHref} className="block min-h-0 flex-1">
            <span className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 transition-colors group-hover:text-emerald-800">
              {title}
            </span>
            {isBusiness && companyName ? (
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-zinc-600">
                {companyName}
                {isVerified ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : null}
              </span>
            ) : null}
          </Link>
          <p className="mt-3 text-base font-extrabold tabular-nums text-emerald-800">{formattedPrice}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-600">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-700/80" aria-hidden />
            <span className="line-clamp-1">{place}</span>
          </p>
          <UserBadges user={user} className="mt-3" />
        </div>
      </article>
    </li>
  );
});
