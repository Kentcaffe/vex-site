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
      <article className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] shadow-[var(--mp-shadow-md)] transition-shadow hover:shadow-[var(--mp-shadow-lg)]">
        <div className="relative mp-card-image">
          <Link href={listingHref} className="absolute inset-0 z-0 block" aria-label={title}>
            {coverSrc ? (
              <ListingCoverImg
                src={coverSrc}
                alt={coverAlt}
                priority={priority}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
              />
            ) : (
              <ListingImagePlaceholder title={noImageTitle} hint={noImageHint} className="bg-zinc-200" />
            )}
          </Link>
          <div className="absolute right-2 top-2 z-10">
            <FavoriteButton listingId={listingId} initialFavorited={initialFavorited} variant="icon" />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          <Link href={listingHref} className="block min-h-0 flex-1">
            <span className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 group-hover:text-[#c2410c]">
              {title}
            </span>
            {isBusiness && companyName ? (
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-zinc-600">
                {companyName}
                {isVerified ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : null}
              </span>
            ) : null}
          </Link>
          <p className="mt-2 text-base font-extrabold text-[#c2410c] tabular-nums">{formattedPrice}</p>
          <p className="mt-1.5 flex items-center gap-1 text-sm text-zinc-700">
            <MapPin className="h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
            <span className="line-clamp-1">{place}</span>
          </p>
          <UserBadges user={user} className="mt-2" />
        </div>
      </article>
    </li>
  );
});
