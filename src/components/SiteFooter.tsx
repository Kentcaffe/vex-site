import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const linkClass =
  "inline-block text-sm text-zinc-600 transition-colors hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400";
const mailClass =
  "inline-block text-sm text-zinc-600 transition-colors hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400";
const headingClass =
  "text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200/90 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        {/* Brand — același namespace Footer ca în header (siteName, tagline) */}
        <div className="border-b border-zinc-200/80 pb-12 dark:border-zinc-800">
          <Link
            href="/"
            className="inline-block text-3xl font-black tracking-tight text-[#0b57d0] transition hover:text-[#0842a0] dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t("siteName")}
          </Link>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t("tagline")}</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-14 lg:grid-cols-4 lg:gap-16">
          {/* Contact */}
          <div className="space-y-5">
            <p className={headingClass}>{t("colContact")}</p>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">{t("colContactIntro")}</p>
            <ul className="space-y-3">
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
