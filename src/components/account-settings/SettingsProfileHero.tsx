"use client";

import Image from "next/image";
import { BadgeCheck, Package, Sparkles, Star, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { resolvePublicMediaUrl } from "@/lib/media-url";

export type SettingsHeroUser = {
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  isVerified: boolean;
  listingsCount: number;
};

const R = "rounded-2xl";
const DARK = "#0f172a";

export function SettingsProfileHero({ user }: { user: SettingsHeroUser }) {
  const t = useTranslations("AccountSettings.shell");
  const tSeller = useTranslations("AccountSettings.seller");
  const uiLocale = useLocale();
  const avatar = resolvePublicMediaUrl(user.avatarUrl);
  const display = (user.name ?? "").trim() || user.email.split("@")[0] || "—";
  const memberYear = new Intl.DateTimeFormat(uiLocale, { year: "numeric" }).format(new Date(user.createdAt));

  return (
    <div
      className={`relative overflow-hidden border border-emerald-900/25 ${R} p-6 text-white shadow-[0_20px_50px_-28px_rgb(0_0_0/0.5),0_0_48px_-16px_rgba(22,163,74,0.28)] sm:p-8`}
      style={{
        background: `linear-gradient(125deg, rgb(5 46 22) 0%, rgb(6 78 59) 28%, ${DARK} 72%, rgb(0 0 0) 100%)`,
      }}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#16a34a]/22 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-emerald-400/8 blur-2xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                width={96}
                height={96}
                className="h-24 w-24 rounded-2xl border border-white/20 object-cover shadow-lg ring-2 ring-white/10 sm:h-[5.5rem] sm:w-[5.5rem] sm:rounded-full"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-semibold text-white/90 shadow-inner sm:h-[5.5rem] sm:w-[5.5rem] sm:rounded-full">
                {display.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-[#16a34a] text-white shadow-md">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{display}</h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/45 bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-50">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-200" aria-hidden />
                {t("activeSellerBadge")}
              </span>
            </div>
            <p className="mt-2 text-sm text-emerald-100/85">{t("memberSinceYear", { year: memberYear })}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10">
                <Package className="h-4 w-4 text-emerald-200" aria-hidden />
                <span className="font-semibold tabular-nums">{t("statListings", { count: user.listingsCount })}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10">
                <Star className="h-4 w-4 text-amber-300" aria-hidden />
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold tabular-nums">{tSeller("statRating")}</span>
                  <span className="text-[10px] font-medium text-emerald-100/75">{tSeller("statRatingHint")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10">
                <Zap className="h-4 w-4 text-amber-200" aria-hidden />
                <span className="font-semibold">{t("statQuick")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
