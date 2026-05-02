import { getTranslations } from "next-intl/server";
import { ChevronRight, Gift, Headphones, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HomeListingCard } from "@/components/home/HomeListingCard";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import type { CategoryRow } from "@/lib/category-queries";
import { emojiForRootSlug } from "@/lib/category-icons";
import { formatPrice } from "@/lib/formatPrice";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import type { PriceCurrencyCode } from "@/lib/currency";
import { listingSeoPath } from "@/lib/seo";
import { localizedHref } from "@/lib/paths";
import { HomeHeroSearchForm } from "@/components/home/HomeHeroSearchForm";

type LabelJson = { ro?: string; ru?: string; en?: string };

function labelFor(cat: CategoryRow, locale: string): string {
  try {
    const L = JSON.parse(cat.labels) as LabelJson;
    const loc = locale as keyof LabelJson;
    return L[loc] ?? L.ro ?? cat.slug;
  } catch {
    return cat.slug;
  }
}

/** Icon container pe homepage — culori distincte, fără logică de routing. */
function categoryAccentRing(slug: string): string {
  const map: Record<string, string> = {
    transport: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25",
    imobiliare: "bg-sky-500/15 text-sky-800 ring-sky-500/25",
    electronice: "bg-violet-500/15 text-violet-800 ring-violet-500/25",
    "casa-gradina": "bg-amber-500/15 text-amber-900 ring-amber-500/25",
    moda: "bg-rose-500/15 text-rose-800 ring-rose-500/25",
    "sport-hobby": "bg-lime-500/20 text-lime-900 ring-lime-600/25",
    animale: "bg-orange-500/15 text-orange-900 ring-orange-500/25",
    agricol: "bg-green-600/15 text-green-900 ring-green-600/25",
    business: "bg-slate-500/15 text-slate-800 ring-slate-500/25",
    joburi: "bg-cyan-500/15 text-cyan-900 ring-cyan-500/25",
    servicii: "bg-indigo-500/15 text-indigo-900 ring-indigo-500/25",
    "mama-copil": "bg-pink-500/15 text-pink-800 ring-pink-500/25",
    diverse: "bg-zinc-400/20 text-zinc-800 ring-zinc-400/30",
  };
  return map[slug] ?? "bg-emerald-500/12 text-emerald-900 ring-emerald-500/20";
}

export type ListingCard = {
  id: string;
  title: string;
  price: number;
  priceCurrency: string;
  city: string;
  district: string | null;
  images: string | null;
  mileageKm: number | null;
  user?: {
    accountType?: string | null;
    isVerified?: boolean | null;
    businessStatus?: string | null;
    companyName?: string | null;
  } | null;
};

type Props = {
  locale: string;
  listings: ListingCard[];
  rootCategories: CategoryRow[];
  favoritedIds: ReadonlySet<string>;
  loadError?: boolean;
};

export async function HomeMarketplace({
  locale,
  listings,
  rootCategories,
  favoritedIds,
  loadError = false,
}: Props) {
  const t = await getTranslations("Home.marketplace");
  const tList = await getTranslations("Listings");
  const anunturiAction = localizedHref(locale, "/anunturi");

  const trustPillars = [
    { Icon: Gift, titleKey: "trustPillarFreeTitle" as const, descKey: "trustPillarFreeDesc" as const },
    { Icon: Zap, titleKey: "trustPillarFastTitle" as const, descKey: "trustPillarFastDesc" as const },
    { Icon: ShieldCheck, titleKey: "trustPillarSafeTitle" as const, descKey: "trustPillarSafeDesc" as const },
    { Icon: Headphones, titleKey: "trustPillarSupportTitle" as const, descKey: "trustPillarSupportDesc" as const },
  ];

  return (
    <>
      {/* Hero — spațiu alb, accent verde, tipografie clară */}
      <section className="relative w-full overflow-hidden border-b border-emerald-100/80 bg-gradient-to-b from-white via-emerald-50/40 to-zinc-50/90">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-20 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8 lg:pb-14 lg:pt-12">
          <div className="mx-auto flex max-w-4xl flex-col gap-6 lg:mx-0 lg:max-w-none lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="min-w-0 flex-1 space-y-4 text-center lg:text-left">
              <p
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900/85 shadow-sm backdrop-blur-sm sm:text-xs"
                data-nosnippet
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                {t("heroBadge")}
              </p>
              <h1 className="text-balance text-3xl font-bold leading-[1.12] tracking-tight text-zinc-900 sm:text-4xl sm:leading-[1.1] lg:text-5xl lg:leading-[1.08]">
                {t("heroHeadline")}
              </h1>
              <p className="mx-auto max-w-xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg lg:mx-0">
                {t("heroSubheadline")}
              </p>
            </div>
            <Link
              href="/cont"
              className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-200/90 bg-white text-lg text-emerald-700 shadow-md shadow-emerald-900/5 ring-1 ring-zinc-100 transition hover:border-emerald-200 hover:bg-emerald-50/90 hover:text-emerald-800 hover:shadow-lg lg:mx-0 lg:mt-2"
              aria-label="Cont"
            >
              <span aria-hidden>👤</span>
            </Link>
          </div>

          <div className="mx-auto mt-8 max-w-3xl lg:mt-10">
            <HomeHeroSearchForm action={anunturiAction} />
          </div>
        </div>
      </section>

      {/* Bară categorii — pills sub hero, același routing `?c=` */}
      <section className="relative z-10 border-b border-zinc-200/80 bg-white/95 shadow-[0_1px_0_rgb(0_0_0/0.03)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{t("categoriesTitle")}</h2>
            <Link
              href="/categorii"
              className="inline-flex min-h-[40px] items-center gap-0.5 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              <span className="relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-emerald-600 after:transition-transform after:duration-200 hover:after:scale-x-100">
                {t("viewAll")}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {rootCategories.map((cat) => {
              const rootEmoji = emojiForRootSlug(cat.slug);
              const accent = categoryAccentRing(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/categorii?c=${encodeURIComponent(cat.slug)}`}
                  className="group relative inline-flex min-h-[48px] items-center gap-2.5 rounded-full border border-zinc-200/90 bg-zinc-50/80 px-3.5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200/90 hover:bg-white hover:shadow-md"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg leading-none ring-1 ring-inset ${accent}`}
                    aria-hidden
                  >
                    {rootEmoji}
                  </span>
                  <span className="relative pr-0.5">
                    {labelFor(cat, locale)}
                    <span
                      className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-emerald-600 transition-transform duration-200 ease-out group-hover:scale-x-100"
                      aria-hidden
                    />
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">{t("categoriesHint")}</p>
        </div>
      </section>

      <div className="app-shell app-section w-full min-w-0 bg-[linear-gradient(180deg,var(--mp-page)_0%,#fafafa_100%)] pb-12 pt-8 md:pb-14 md:pt-10">
        {/* Carduri categorii — grid, același href ca bara */}
        <section className="mb-10 md:mb-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {rootCategories.map((cat) => {
              const rootEmoji = emojiForRootSlug(cat.slug);
              const accent = categoryAccentRing(cat.slug);
              return (
                <Link
                  key={`card-${cat.id}`}
                  href={`/categorii?c=${encodeURIComponent(cat.slug)}`}
                  className="group flex min-h-[108px] flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-[0_8px_30px_-12px_rgb(15_23_42/0.08)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200/80 hover:shadow-[0_16px_40px_-14px_rgb(5_150_105/0.18)]"
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl leading-none ring-1 ring-inset ${accent}`}
                    aria-hidden
                  >
                    {rootEmoji}
                  </span>
                  <span className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-zinc-900 group-hover:text-emerald-800">
                    {labelFor(cat, locale)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">{t("latestListingsTitle")}</h2>
              <p className="max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">{t("latestListingsSubtitle")}</p>
            </div>
            <Link
              href="/anunturi"
              className="inline-flex min-h-[44px] items-center text-sm font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-800 hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>

          {loadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-semibold text-red-800">{tList("browseLoadError")}</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-10 text-center shadow-[0_12px_40px_-16px_rgb(15_23_42/0.1)]">
              <p className="text-base font-medium text-zinc-900">{t("empty")}</p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-600">{t("emptyHint")}</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((item, index) => {
                const cover = parseStoredListingImages(item.images)[0] ?? null;
                const place = item.city + (item.district ? ` · ${item.district}` : "");
                const listingHref = listingSeoPath({ id: item.id, title: item.title, city: item.city });
                return (
                  <HomeListingCard
                    key={item.id}
                    listingId={item.id}
                    listingHref={listingHref}
                    title={item.title}
                    formattedPrice={formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                    place={place}
                    coverSrc={cover}
                    coverAlt={`${item.title} de vânzare în ${item.city}`}
                    priority={index < 4}
                    initialFavorited={favoritedIds.has(item.id)}
                    noImageTitle={tList("cardNoImageTitle")}
                    noImageHint={tList("cardNoImageHint")}
                    user={item.user}
                  />
                );
              })}
            </ul>
          )}
        </section>

        {/* Trust — doar prezentare */}
        <section className="mt-14 md:mt-16">
          <h2 className="mb-6 text-center text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            {t("trustSectionTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustPillars.map(({ Icon, titleKey, descKey }) => (
              <div
                key={titleKey}
                className="flex flex-col rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_8px_28px_-12px_rgb(15_23_42/0.08)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <p className="mt-4 text-sm font-bold text-zinc-900">{t(titleKey)}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 hidden md:block">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Link
              href="/anunturi"
              className="group rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_10px_32px_-14px_rgb(15_23_42/0.1)] transition hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-[0_18px_44px_-16px_rgb(5_150_105/0.15)]"
            >
              <p className="text-sm font-bold text-zinc-900">{t("promoBrowseCardTitle")}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t("promoBrowseCardBody")}</p>
            </Link>
            <Link
              href="/chat"
              className="group rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_10px_32px_-14px_rgb(15_23_42/0.1)] transition hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-[0_18px_44px_-16px_rgb(5_150_105/0.15)]"
            >
              <p className="text-sm font-bold text-zinc-900">{t("promoTile2Title")}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t("promoTile2Body")}</p>
            </Link>
            <Link
              href="/publica"
              className="group rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_10px_32px_-14px_rgb(15_23_42/0.1)] transition hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-[0_18px_44px_-16px_rgb(5_150_105/0.15)]"
            >
              <p className="text-sm font-bold text-zinc-900">{t("promoTile3Title")}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t("promoTile3Body")}</p>
            </Link>
          </section>
        </div>

        <ScrollToTopButton />
      </div>
    </>
  );
}
