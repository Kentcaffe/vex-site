"use client";

import { Check, Crown } from "lucide-react";
import { useTranslations } from "next-intl";

const RADIUS = "rounded-[14px]";

export function SellerDetailsTrustSidebar({ score, max }: { score: number; max: number }) {
  const t = useTranslations("AccountSettings.seller");
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;

  return (
    <div className="flex flex-col gap-5 lg:sticky lg:top-24">
      <div
        className={`${RADIUS} border border-slate-200/90 bg-white p-5 shadow-[0_4px_24px_-8px_rgb(15_23_42/0.12)] transition duration-300`}
      >
        <h3 className="text-sm font-semibold tracking-tight text-slate-900">{t("trustAdvantagesTitle")}</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {[t("trustAd1"), t("trustAd2"), t("trustAd3")].map((line) => (
            <li key={line} className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#16a34a]">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              </span>
              <span className="leading-snug">{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`${RADIUS} border border-emerald-200/60 bg-gradient-to-br from-emerald-50/90 via-white to-slate-50 p-5 shadow-[0_4px_24px_-8px_rgb(22_163_74/0.18)] transition duration-300`}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#16a34a] text-white shadow-md shadow-emerald-600/25">
            <Crown className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-emerald-950">{t("premiumCardTitle")}</h3>
            <p className="mt-1 text-xs leading-relaxed text-emerald-900/80">{t("premiumCardLead")}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>{t("premiumProgressLabel")}</span>
            <span className="tabular-nums text-slate-900">
              {score}/{max}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/90">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#16a34a] to-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
