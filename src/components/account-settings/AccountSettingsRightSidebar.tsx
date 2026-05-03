"use client";

import { BarChart3, Check, Crown, Eye, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const R = "rounded-2xl";

export function AccountSettingsRightSidebar() {
  const t = useTranslations("AccountSettings.sidebar");

  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-28">
      <div
        className={`border border-slate-200/90 bg-white p-5 shadow-[0_4px_24px_-10px_rgb(15_23_42/0.12)] transition duration-300 hover:shadow-[0_8px_32px_-12px_rgb(15_23_42/0.14)] ${R}`}
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#16a34a]" aria-hidden />
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">{t("statsTitle")}</h2>
        </div>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/90 px-3 py-2.5">
            <span className="flex items-center gap-2 text-slate-600">
              <Eye className="h-4 w-4 text-slate-400" aria-hidden />
              {t("statsViews")}
            </span>
            <span className="font-semibold tabular-nums text-slate-400">{t("statsSoon")}</span>
          </li>
          <li className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/90 px-3 py-2.5">
            <span className="flex items-center gap-2 text-slate-600">
              <MessageCircle className="h-4 w-4 text-slate-400" aria-hidden />
              {t("statsMessages")}
            </span>
            <span className="font-semibold tabular-nums text-slate-400">{t("statsSoon")}</span>
          </li>
          <li className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/90 px-3 py-2.5">
            <span className="flex items-center gap-2 text-slate-600">
              <Crown className="h-4 w-4 text-slate-400" aria-hidden />
              {t("statsResponse")}
            </span>
            <span className="font-semibold tabular-nums text-slate-400">{t("statsSoon")}</span>
          </li>
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">{t("statsHint")}</p>
      </div>

      <div
        className={`border border-emerald-100/90 bg-gradient-to-br from-emerald-50/90 via-white to-slate-50 p-5 shadow-[0_4px_24px_-10px_rgb(22_163_74/0.15)] transition duration-300 hover:shadow-[0_10px_32px_-14px_rgb(22_163_74/0.2)] ${R}`}
      >
        <h2 className="text-sm font-semibold text-emerald-950">{t("benefitsTitle")}</h2>
        <ul className="mt-3 space-y-2.5 text-sm text-emerald-950/85">
          {[t("benefit1"), t("benefit2"), t("benefit3")].map((line) => (
            <li key={line} className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#16a34a] shadow-sm ring-1 ring-emerald-200/60">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              </span>
              <span className="leading-snug">{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
