import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const linkClass =
  "inline-block min-h-[44px] py-1 text-base leading-snug text-[#374151] sm:min-h-0 sm:text-sm lg:hover:text-[#c2410c] dark:text-[#d1d5db] lg:dark:hover:text-orange-400";
const mailClass =
  "inline-block min-h-[44px] py-1 text-base text-[#374151] sm:min-h-0 sm:text-sm lg:hover:text-[#c2410c] dark:text-[#d1d5db] lg:dark:hover:text-orange-400";
const headingClass =
  "text-[11px] font-semibold uppercase tracking-[0.2em] text-[#374151] dark:text-[#9ca3af]";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 w-full max-w-full overflow-x-clip border-t border-[var(--mp-border)] bg-[var(--mp-surface)]">
      <div className="app-shell py-8 sm:py-12 lg:py-16">
        {/* Brand — același namespace Footer ca în header (siteName, tagline) */}
        <div className="border-b border-zinc-200/80 pb-10 dark:border-zinc-800">
          <Link
            href="/"
            className="inline-block text-3xl font-black tracking-tight text-[#111827] transition hover:text-[#c2410c] dark:text-[#f9fafb] dark:hover:text-orange-400"
          >
            {t("siteName")}
          </Link>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#374151] dark:text-[#d1d5db]">{t("tagline")}</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-14 lg:grid-cols-4 lg:gap-16">
          {/* Contact */}
          <div className="space-y-5">
            <p className={headingClass}>{t("colContact")}</p>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">{t("colContactIntro")}</p>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className={`${linkClass} font-semibold text-orange-700 dark:text-orange-400`}>
                  {t("linkContactPage")}
                </Link>
              </li>
              <li>
                <a href="mailto:support@vex.md" className={mailClass}>
                  support@vex.md
                </a>
                <span className="mt-0.5 block text-[11px] text-zinc-400 dark:text-zinc-600">{t("emailSupportHint")}</span>
              </li>
              <li>
                <a href="mailto:contact@vex.md" className={mailClass}>
                  contact@vex.md
                </a>
                <span className="mt-0.5 block text-[11px] text-zinc-400 dark:text-zinc-600">{t("emailContactHint")}</span>
              </li>
            </ul>
          </div>

          {/* Ajutor */}
          <div className="space-y-5">
            <Link href="/ajutor" className={`${headingClass} inline-block hover:text-emerald-600 dark:hover:text-emerald-400`}>
              {t("colHelp")}
            </Link>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">{t("colHelpIntro")}</p>
            <ul className="space-y-3">
              <li>
                <Link href="/cum-functioneaza" className={linkClass}>
                  {t("linkHowItWorks")}
                </Link>
              </li>
              <li>
                <Link href="/cum-publici-anunt" className={linkClass}>
                  {t("linkPostingGuide")}
                </Link>
              </li>
              <li>
                <Link href="/cum-contactezi-vanzatorul" className={linkClass}>
                  {t("linkContactSeller")}
                </Link>
              </li>
              <li>
                <Link href="/gestioneaza-contul" className={linkClass}>
                  {t("linkManageAccount")}
                </Link>
              </li>
              <li>
                <Link href="/intrebari-frecvente" className={linkClass}>
                  {t("linkFaq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Siguranță */}
          <div className="space-y-5">
            <Link href="/siguranta" className={`${headingClass} inline-block hover:text-emerald-600 dark:hover:text-emerald-400`}>
              {t("colSafety")}
            </Link>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">{t("colSafetyIntro")}</p>
            <ul className="space-y-3">
              <li>
                <Link href="/sfaturi-anti-frauda" className={linkClass}>
                  {t("linkAntiFraud")}
                </Link>
              </li>
              <li>
                <Link href="/cum-recunosti-un-scam" className={linkClass}>
                  {t("linkRecognizeScam")}
                </Link>
              </li>
              <li>
                <Link href="/reguli-siguranta-cumparare" className={linkClass}>
                  {t("linkSafetyBuy")}
                </Link>
              </li>
              <li>
                <Link href="/reguli-siguranta-vanzare" className={linkClass}>
                  {t("linkSafetySell")}
                </Link>
              </li>
              <li>
                <Link href="/raporteaza-anunt" className={linkClass}>
                  {t("linkReportListing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-5">
            <p className={headingClass}>{t("colLegal")}</p>
            <ul className="space-y-3">
              <li>
                <Link href="/termeni" className={linkClass}>
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/confidentialitate" className={linkClass}>
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/stergere-date" className={linkClass}>
                  {t("linkDataDeletion")}
                </Link>
              </li>
              <li>
                <Link href="/politica-cookie" className={linkClass}>
                  {t("linkCookiePolicy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Nav rapid minimalist */}
        <nav
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-zinc-200/80 pt-12 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500"
          aria-label={t("quickNavAria")}
        >
          <Link href="/anunturi" className={`${linkClass} text-xs`}>
            {t("linkListings")}
          </Link>
          <Link href="/publica" className={`${linkClass} text-xs`}>
            {t("linkPublish")}
          </Link>
          <Link href="/categorii" className={`${linkClass} text-xs`}>
            {t("linkCategories")}
          </Link>
          <Link href="/cont" className={`${linkClass} text-xs`}>
            {t("linkAccount")}
          </Link>
        </nav>

        <div className="mt-12 flex flex-col gap-6 border-t border-zinc-200/80 pt-10 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-500">{t("rights", { year })}</p>
          <p className="text-sm font-medium tracking-wide text-zinc-700 dark:text-zinc-300">{t("madeInMoldova")}</p>
        </div>
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-zinc-500 dark:text-zinc-600">{t("disclaimer")}</p>
      </div>
    </footer>
  );
}
