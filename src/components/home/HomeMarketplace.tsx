import { getTranslations } from "next-intl/server";
import { ChevronRight, Flame, Gift, Headphones, ShieldCheck, Sparkles, Zap } from "lucide-react";
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
import { HeroFloatingVisual } from "@/components/home/HeroFloatingVisual";

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
      {/* Hero — gradient premium + vizual flotant (doar UI) */}
      <section
        className="relative w-full overflow-hidden border-b border-emerald-100/60"
        style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e6f4ea 55%, #f1f5f4 100%)" }}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-200/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-24 h-72 w-72 rounded-full bg-teal-200/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8 lg:pb-16 lg:pt-12">
          <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,1fr)] lg:items-center lg:gap-12">
            <div className="min-w-0 space-y-5 text-center lg:text-left">
              <p
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900/85 shadow-sm backdrop-blur-sm sm:text-xs lg:mx-0 mx-auto"
                data-nosnippet
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#22c55e]" aria-hidden />
                {t("heroBadge")}
              </p>
              <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.08]">
                <span className="text-zinc-900">{t("heroHeadlineLead")}</span>{" "}
                <span className="text-[#22c55e]">{t("heroHeadlineAccent")}</span>
              </h1>
              <p className="mx-auto max-w-xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg lg:mx-0">
                {t("heroSubheadline")}
              </p>
              <div className="mx-auto w-full max-w-2xl pt-2 lg:mx-0">
                <HomeHeroSearchForm action={anunturiAction} />
              </div>
            </div>
            <HeroFloatingVisual />
          </div>
        </div>
      </section>

      {/* Categorii — container premium, același routing `?c=` */}
      <section className="relative z-10 border-b border-zinc-100/90 bg-zinc-50/80 py-6 sm:py-8">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[20px] border border-zinc-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)] sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{t("categoriesTitle")}</h2>
              <Link
                href="/categorii"
                className="inline-flex min-h-[40px] items-center gap-0.5 text-sm font-semibold text-[#16a34a] transition hover:text-[#15803d]"
              >
                <span className="relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#22c55e] after:transition-transform after:duration-200 hover:after:scale-x-100">
                  {t("viewAll")}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </div>
            <div className="-mx-1 flex snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto overflow-y-hidden scroll-smooth px-1 pb-1 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:snap-none md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
              {rootCategories.map((cat) => {
                const rootEmoji = emojiForRootSlug(cat.slug);
                const accent = categoryAccentRing(cat.slug);
                return (
                  <Link
                    key={cat.id}
                    href={`/categorii?c=${encodeURIComponent(cat.slug)}`}
                    className="group relative flex w-[88px] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl border border-zinc-200/90 bg-white p-2 text-center shadow-[0_8px_24px_-10px_rgba(0,0,0,0.08)] transition duration-200 [-webkit-tap-highlight-color:transparent] active:scale-[0.98] hover:border-[#22c55e]/30 hover:shadow-[0_10px_28px_-8px_rgba(34,197,94,0.15)] max-md:hover:-translate-y-0.5 md:inline-flex md:h-auto md:min-h-[52px] md:w-auto md:max-w-none md:flex-row md:gap-2.5 md:rounded-full md:bg-zinc-50/90 md:px-3.5 md:py-2.5 md:text-left md:text-sm md:font-semibold md:shadow-sm md:hover:-translate-y-[5px] md:hover:border-[#22c55e]/35 md:hover:bg-white md:hover:shadow-md"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg leading-none ring-1 ring-inset md:h-9 md:w-9 md:text-lg ${accent}`}
                      aria-hidden
                    >
                      {rootEmoji}
                    </span>
                    <span className="relative min-h-0 w-full md:pr-0.5">
                      <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-zinc-800 md:line-clamp-none md:text-left md:text-sm">
                        {labelFor(cat, locale)}
                      </span>
                      <span
                        className="absolute -bottom-1 left-0 hidden h-0.5 w-full origin-left scale-x-0 rounded-full bg-emerald-600 transition-transform duration-200 ease-out group-hover:scale-x-100 md:block"
                        aria-hidden
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">{t("categoriesHint")}</p>
          </div>
        </div>
      </section>

      <div className="app-shell app-section w-full min-w-0 bg-[linear-gradient(180deg,var(--mp-page)_0%,#fafafa_100%)] pb-12 pt-8 md:pb-14 md:pt-10">
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1.5">
              <h2 className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                <Flame className="h-6 w-6 shrink-0 text-orange-500" strokeWidth={2} aria-hidden />
                {t("gridTitle")}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">{t("latestListingsSubtitle")}</p>
            </div>
            <Link
              href="/anunturi"
              className="inline-flex min-h-[44px] items-center gap-0.5 text-sm font-semibold text-[#16a34a] underline-offset-4 transition hover:text-[#15803d] hover:underline"
            >
              {t("viewAll")}
              <ChevronRight className="h-4 w-4" aria-hidden />
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

        <ScrollToTopButton />
      </div>
    </>
  );
}
