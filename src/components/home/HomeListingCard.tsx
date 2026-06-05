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
  timeLabel: string;
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
  timeLabel,
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
      <article className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#e2e8f0] bg-white transition hover:border-[#1a56db]/40">
        <div className="relative mp-card-image">
          <Link href={listingHref} className="absolute inset-0 z-0 block" aria-label={title}>
            {coverSrc ? (
              <ListingCoverImg
                src={coverSrc}
                alt={coverAlt}
                priority={priority}
                className="h-full w-full object-cover"
              />
            ) : (
              <ListingImagePlaceholder title={noImageTitle} hint={noImageHint} className="bg-[#f8fafc]" />
            )}
          </Link>
          <div className="absolute right-2.5 top-2.5 z-10">
            <FavoriteButton listingId={listingId} initialFavorited={initialFavorited} variant="icon" />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <Link href={listingHref} className="block min-h-0 flex-1">
            <span className="line-clamp-2 text-base font-medium capitalize leading-snug text-[#0f172a] transition-colors group-hover:text-[#1a56db]">
              {title}
            </span>
            {isBusiness && companyName ? (
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#64748b]">
                {companyName}
                {isVerified ? <CheckCircle className="h-3.5 w-3.5 text-[#1a56db]" aria-hidden /> : null}
              </span>
            ) : null}
          </Link>
          <p className="mt-2 text-base font-medium tabular-nums text-[#1a56db]">{formattedPrice}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-[#64748b]">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="line-clamp-1">{place}</span>
            <span className="shrink-0 text-[#94a3b8]" aria-hidden>
              ·
            </span>
            <span className="shrink-0">{timeLabel}</span>
          </p>
          <UserBadges user={user} className="mt-3" />
        </div>
      </article>
    </li>
  );
});
