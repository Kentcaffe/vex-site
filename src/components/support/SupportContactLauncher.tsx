"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Headphones, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";
import { SupportChatModal } from "@/components/support/SupportChatModal";

export function SupportContactLauncher() {
  const t = useTranslations("Support");
  const { status } = useAuthSession();
  const [open, setOpen] = useState(false);

  return (
    <>
      <section
        className="relative mt-12 overflow-hidden rounded-3xl border border-orange-200/60 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/50 p-6 shadow-[0_20px_50px_-12px_rgba(234,88,12,0.2)] sm:p-8"
        aria-labelledby="support-live-heading"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-400/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" aria-hidden />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25">
              <Headphones className="h-7 w-7" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-700 ring-1 ring-orange-200/80">
                <Sparkles className="h-3 w-3" aria-hidden />
                {t("liveBadge")}
              </p>
              <h2 id="support-live-heading" className="mt-2 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                {t("contactSectionTitle")}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">{t("contactSectionLead")}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col xl:flex-row">
            {status === "loading" ? (
              <div className="h-12 w-full animate-pulse rounded-2xl bg-zinc-200/80 sm:w-48" />
            ) : status === "authenticated" ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                {t("openChat")}
              </button>
            ) : (
              <Link
                href="/cont"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-orange-200 bg-white px-6 text-base font-semibold text-orange-800 shadow-sm transition hover:border-orange-300 hover:bg-orange-50/80"
              >
                {t("loginToChat")}
              </Link>
            )}
            <p className="text-center text-xs text-zinc-500 sm:max-w-[14rem] sm:text-left lg:text-center xl:text-left">
              {t("contactSectionHint")}
            </p>
          </div>
        </div>
      </section>

      <SupportChatModal open={open} onDismissAction={() => setOpen(false)} />
    </>
  );
}
