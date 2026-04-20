import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { FooterNav } from "@/components/FooterNav";

const linkClass =
  "inline-block min-h-[44px] py-1 text-xs font-medium leading-snug text-zinc-700 sm:min-h-0 hover:text-orange-700";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 w-full max-w-full overflow-x-clip border-t border-[var(--mp-border)] bg-zinc-50/80">
      <div className="app-shell py-8 sm:py-10 lg:py-14">
        <div className="border-b border-zinc-200/90 pb-8 sm:pb-10">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/logo.png"
              alt="VEX - anunțuri gratuite Moldova"
              width={140}
              height={48}
              className="h-10 w-auto transition-opacity hover:opacity-90"
            />
          </Link>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">{t("tagline")}</p>
        </div>

        <FooterNav />

        <nav
          className="mt-10 flex flex-col gap-3 border-t border-zinc-200/90 pt-8 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-2 sm:pt-10"
          aria-label={t("quickNavAria")}
        >
          <Link href="/anunturi" className={linkClass}>
            {t("linkListings")}
          </Link>
          <span className="hidden text-zinc-300 sm:inline" aria-hidden>
            ·
          </span>
          <Link href="/publica" className={linkClass}>
            {t("linkPublish")}
          </Link>
          <span className="hidden text-zinc-300 sm:inline" aria-hidden>
            ·
          </span>
          <Link href="/categorii" className={linkClass}>
            {t("linkCategories")}
          </Link>
          <span className="hidden text-zinc-300 sm:inline" aria-hidden>
            ·
          </span>
          <Link href="/cont" className={linkClass}>
            {t("linkAccount")}
          </Link>
        </nav>

        <div className="mt-8 flex flex-col gap-4 border-t border-zinc-200/90 pt-8 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-10">
          <p className="text-center text-xs text-zinc-500 sm:text-left">{t("rights", { year })}</p>
          <p className="text-center text-sm font-medium tracking-wide text-zinc-800 sm:text-right">
            {t("madeInMoldova")}
          </p>
        </div>
        <p className="mt-6 max-w-2xl text-center text-xs leading-relaxed text-zinc-500 sm:mt-8 sm:text-left">
          {t("disclaimer")}
        </p>
      </div>
    </footer>
  );
}
