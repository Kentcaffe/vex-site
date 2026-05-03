"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { formatPrice } from "@/lib/formatPrice";
import type { PriceCurrencyCode } from "@/lib/currency";
import { listingSeoPath } from "@/lib/seo";
import type { ChatBootstrap } from "./chat-types";

function conditionLabel(condition: string, t: ReturnType<typeof useTranslations<"Chat">>): string {
  const c = condition.toLowerCase();
  if (c === "new") return t("conditionNew");
  if (c === "used") return t("conditionUsed");
  if (c === "not_applicable" || c === "") return t("conditionNA");
  return t("conditionNA");
}

type Props = {
  bootstrap: ChatBootstrap;
};

export function UserInfoPanel({ bootstrap }: Props) {
  const t = useTranslations("Chat");
  const { listing, meIsBuyer, otherUserName, otherUserAvatarUrl, otherProfileHref } = bootstrap;
  const roleLabel = meIsBuyer ? t("roleSeller") : t("roleBuyer");
  const listingHref = listingSeoPath({ id: listing.id, title: listing.title, city: listing.city });
  const img = listing.imageUrl ?? "/marketplace-image-fallback.svg";
  const price = formatPrice(listing.price, listing.priceCurrency as PriceCurrencyCode);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <section className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("aboutUser")}</h3>
        <div className="mt-3 flex items-center gap-3">
          <ChatAvatar url={otherUserAvatarUrl} name={otherUserName} size={56} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{otherUserName}</p>
            <p className="text-xs text-slate-500">{roleLabel}</p>
            <p className="mt-1 text-xs text-amber-600">★ {t("ratingNone")}</p>
          </div>
        </div>
        {otherProfileHref ? (
          <Link
            href={otherProfileHref}
            className="mt-4 block w-full rounded-xl border border-slate-200 bg-white py-2.5 text-center text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            {t("viewProfile")}
          </Link>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("aboutListing")}</h3>
        <div className="mt-3 flex gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold text-slate-900">{listing.title}</p>
            <p className="mt-1 text-sm font-bold text-emerald-600">{price}</p>
            <p className="mt-1 text-xs text-slate-600">
              {t("listingStatusLabel")}: {conditionLabel(listing.condition, t)}
            </p>
            <p className="text-xs text-slate-500">{listing.city}</p>
          </div>
        </div>
        <Link
          href={listingHref}
          className="mt-4 block w-full rounded-xl bg-emerald-500 py-2.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600"
        >
          {t("viewListing")}
        </Link>
      </section>

      <section className="rounded-xl border border-amber-100 bg-amber-50/80 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-amber-900">{t("safetyTitle")}</h3>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-amber-950/90">
          <li className="flex gap-2">
            <span className="text-emerald-600">•</span>
            {t("safety1")}
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-600">•</span>
            {t("safety2")}
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-600">•</span>
            {t("safety3")}
          </li>
        </ul>
      </section>
    </div>
  );
}
