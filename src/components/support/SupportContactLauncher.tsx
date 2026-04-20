"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Headphones, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";
import { SupportChatModal } from "@/components/support/SupportChatModal";

const ctaClasses =
  "inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold shadow-md transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 active:scale-[0.99] sm:min-h-[52px] md:w-auto md:min-w-[240px]";

function LiveChatCta({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { children: ReactNode }) {
  return (
    <button type="button" className={`${ctaClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}

function LiveChatCtaLink({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className: string;
  href: string;
}) {
  return (
    <Link href={href} className={`${ctaClasses} ${className}`}>
      {children}
    </Link>
  );
}

type SupportContactLauncherProps = {
  /** Coloană îngustă (ex. footer): fără eyebrow, layout mereu stacked */
  embed?: boolean;
  /** Evită duplicate id când există mai multe instanțe pe pagină */
  headingId?: string;
};

export function SupportContactLauncher({
  embed = false,
  headingId = "support-live-heading",
}: SupportContactLauncherProps) {
  const t = useTranslations("Support");
  const { status } = useAuthSession();
  const [open, setOpen] = useState(false);

  const gridClass = embed
    ? "grid grid-cols-1 gap-3"
    : "grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6 lg:gap-8";
  const ctaWrapClass = embed
    ? "flex w-full flex-col gap-1.5"
    : "flex w-full flex-col gap-1.5 md:max-w-[min(100%,280px)] md:items-end md:justify-center md:justify-self-end";
  const titleClass = embed
    ? "mt-1.5 text-lg font-bold leading-snug tracking-tight text-zinc-900"
    : "mt-1.5 text-xl font-bold leading-snug tracking-tight text-zinc-900 md:text-2xl md:leading-tight";
  const cardPad = embed ? "p-3.5 sm:p-4" : "p-4 sm:p-5 md:p-4";

  const ctaWidthEmbed = embed ? "!w-full md:!w-full md:min-w-0" : "";

  return (
    <>
      {!embed ? (
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-800/90 md:text-left">
          {t("contactSectionEyebrow")}
        </p>
      ) : null}

      <section
          className={`group relative overflow-hidden rounded-3xl border border-orange-200/55 bg-gradient-to-br from-orange-50 via-orange-50/70 to-amber-50/80 shadow-[0_8px_30px_-12px_rgba(234,88,12,0.22)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-orange-300/60 hover:shadow-[0_16px_40px_-12px_rgba(234,88,12,0.28)] hover:ring-2 hover:ring-orange-200/50 ${cardPad}`}
          aria-labelledby={headingId}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-300/20 blur-2xl transition-all duration-500 group-hover:bg-orange-400/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-amber-200/35 blur-2xl"
            aria-hidden
          />

          <div className={`relative ${gridClass}`}>
            <div className="flex min-w-0 gap-3 sm:gap-3.5">
              <div
                className={`flex shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm ring-1 ring-orange-100/90 ${embed ? "h-11 w-11" : "h-12 w-12 sm:h-[52px] sm:w-[52px]"}`}
              >
                <Headphones
                  className={embed ? "h-5 w-5" : "h-6 w-6 sm:h-7 sm:w-7"}
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-700 shadow-sm ring-1 ring-orange-200/90">
                  {t("liveBadge")}
                </span>
                <h2 id={headingId} className={titleClass}>
                  {t("contactSectionTitle")}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm leading-snug text-zinc-600">
                  {t("contactSectionLead")}
                </p>
              </div>
            </div>

            <div className={ctaWrapClass}>
              {status === "loading" ? (
                <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-200/75 md:h-[52px]" />
              ) : status === "authenticated" ? (
                <LiveChatCta
                  onClick={() => setOpen(true)}
                  className={`bg-orange-500 text-white shadow-orange-500/30 hover:bg-orange-600 hover:shadow-lg ${ctaWidthEmbed}`}
                >
                  <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
                  {t("openChat")}
                </LiveChatCta>
              ) : (
                <LiveChatCtaLink
                  href="/cont"
                  className={`bg-orange-500 text-white shadow-orange-500/30 hover:bg-orange-600 hover:shadow-lg ${ctaWidthEmbed}`}
                >
                  {t("loginToChat")}
                </LiveChatCtaLink>
              )}
              <p
                className={`text-[11px] leading-relaxed text-zinc-400 ${embed ? "text-left" : "text-center md:text-right"}`}
              >
                {t("contactSectionHintPrivacy")}
              </p>
              <p
                className={`text-[11px] leading-relaxed text-zinc-400/95 ${embed ? "text-left" : "text-center md:text-right"}`}
              >
                {t("contactSectionHintAuth")}
              </p>
            </div>
          </div>
      </section>

      <SupportChatModal open={open} onDismissAction={() => setOpen(false)} />
    </>
  );
}
