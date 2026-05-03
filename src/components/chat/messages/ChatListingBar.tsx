"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/formatPrice";
import type { PriceCurrencyCode } from "@/lib/currency";
import { listingSeoPath } from "@/lib/seo";
import type { ChatListingBootstrap } from "./chat-types";

type Props = {
  listing: ChatListingBootstrap;
};

export function ChatListingBar({ listing }: Props) {
  const t = useTranslations("Chat");
  const href = listingSeoPath({ id: listing.id, title: listing.title, city: listing.city });
  const img = listing.imageUrl ?? "/marketplace-image-fallback.svg";
  const price = formatPrice(listing.price, listing.priceCurrency as PriceCurrencyCode);

  return (
    <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
      <div className="flex gap-3 rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-slate-900">{listing.title}</p>
          <p className="mt-1 text-base font-bold text-emerald-600">{price}</p>
          <Link
            href={href}
            className="mt-2 inline-flex items-center rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-600"
          >
            {t("viewListing")}
          </Link>
        </div>
      </div>
    </div>
  );
}
