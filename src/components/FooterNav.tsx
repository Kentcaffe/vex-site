"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SupportContactLauncher } from "@/components/support/SupportContactLauncher";

const desktopHeading =
  "text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-700";
const desktopLink =
  "inline-block min-h-[44px] py-1 text-base font-medium leading-snug text-zinc-800 sm:min-h-0 sm:text-sm hover:text-orange-700";
const mailClass =
  "inline-block min-h-[44px] py-1 text-base font-medium text-zinc-800 sm:min-h-0 sm:text-sm hover:text-orange-700";

/** Rând acordeon mobil — albastru tip marketplace, chevron, separator */
function AccordionRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-b border-zinc-200 last:border-b-0 open:bg-zinc-50/50">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-zinc-50/80 [&::-webkit-details-marker]:hidden">
        <span className="text-[15px] font-medium leading-snug text-sky-800">{title}</span>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 ease-out group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-zinc-100 bg-white/80 px-4 pb-4 pt-3">{children}</div>
    </details>
  );
}

function MobileFooterLink({
  className = "",
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={`block rounded-lg py-2.5 text-[15px] font-medium leading-snug text-zinc-800 transition-colors hover:bg-zinc-50 hover:text-orange-800 ${className}`}
    />
  );
}

export function FooterNav() {
  const t = useTranslations("Footer");

  const emailBlock = (
    <div className="space-y-3">
      <div>
        <a href="mailto:asistenta@vex.md" className={mailClass}>
          asistenta@vex.md
        </a>
        <span className="mt-0.5 block text-[11px] text-zinc-500">{t("emailSupportHint")}</span>
      </div>
      <div>
        <a href="mailto:contact@vex.md" className={mailClass}>
          contact@vex.md
        </a>
        <span className="mt-0.5 block text-[11px] text-zinc-500">{t("emailContactHint")}</span>
      </div>
    </div>
  );

  const helpLinks = (
    <ul className="space-y-0.5">
      <li>
        <MobileFooterLink href="/cum-functioneaza">{t("linkHowItWorks")}</MobileFooterLink>
      </li>
      <li>
        <MobileFooterLink href="/cum-publici-anunt">{t("linkPostingGuide")}</MobileFooterLink>
      </li>
      <li>
        <MobileFooterLink href="/cum-contactezi-vanzatorul">{t("linkContactSeller")}</MobileFooterLink>
      </li>
      <li>
        <MobileFooterLink href="/gestioneaza-contul">{t("linkManageAccount")}</MobileFooterLink>
      </li>
      <li>
        <MobileFooterLink href="/business">Cont firmă</MobileFooterLink>
      </li>
      <li>
        <MobileFooterLink href="/intrebari-frecvente">{t("linkFaq")}</MobileFooterLink>
      </li>
    </ul>
  );

  const safetyLinks = (
    <ul className="space-y-0.5">
      <li>
        <MobileFooterLink href="/sfaturi-anti-frauda">{t("linkAntiFraud")}</MobileFooterLink>
      </li>
      <li>
        <MobileFooterLink href="/cum-recunosti-un-scam">{t("linkRecognizeScam")}</MobileFooterLink>
      </li>
      <li>
        <MobileFooterLink href="/reguli-siguranta-cumparare">{t("linkSafetyBuy")}</MobileFooterLink>
      </li>
      <li>
        <MobileFooterLink href="/reguli-siguranta-vanzare">{t("linkSafetySell")}</MobileFooterLink>
      </li>
      <li>
        <MobileFooterLink href="/raporteaza-anunt">{t("linkReportListing")}</MobileFooterLink>
      </li>
    </ul>
  );

  const legalLinks = (
    <ul className="space-y-0.5">
      <li>
        <MobileFooterLink href="/termeni">{t("terms")}</MobileFooterLink>
      </li>
      <li>
        <MobileFooterLink href="/confidentialitate">{t("privacy")}</MobileFooterLink>
      </li>
      <li>
        <MobileFooterLink href="/stergere-date">{t("linkDataDeletion")}</MobileFooterLink>
      </li>
      <li>
        <MobileFooterLink href="/politica-cookie">{t("linkCookiePolicy")}</MobileFooterLink>
      </li>
    </ul>
  );

  return (
    <div className="mt-10 md:mt-14">
      {/* Mobil: acordeon ca pe eMAG — rânduri clare, chevron, touch targets mari */}
      <nav
        aria-label={t("accordionNavAria")}
        className="md:hidden overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      >
        <AccordionRow title={t("colContact")}>
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-zinc-600">{t("colContactIntro")}</p>
            <SupportContactLauncher embed headingId="support-footer-chat-mobile" />
            {emailBlock}
          </div>
        </AccordionRow>

        <AccordionRow title={t("colHelp")}>
          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-zinc-600">{t("colHelpIntro")}</p>
            {helpLinks}
          </div>
        </AccordionRow>

        <AccordionRow title={t("colSafety")}>
          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-zinc-600">{t("colSafetyIntro")}</p>
            {safetyLinks}
          </div>
        </AccordionRow>

        <AccordionRow title={t("colLegal")}>{legalLinks}</AccordionRow>
      </nav>

      {/* Desktop: grid clasic, aliniat sus */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-14">
        <div className="space-y-4">
          <p className={desktopHeading}>{t("colContact")}</p>
          <p className="text-xs leading-relaxed text-zinc-600">{t("colContactIntro")}</p>
          <SupportContactLauncher embed headingId="support-footer-chat-desktop" />
          <ul className="space-y-3">
            <li>
              <a href="mailto:asistenta@vex.md" className={mailClass}>
                asistenta@vex.md
              </a>
              <span className="mt-0.5 block text-[11px] text-zinc-500">{t("emailSupportHint")}</span>
            </li>
            <li>
              <a href="mailto:contact@vex.md" className={mailClass}>
                contact@vex.md
              </a>
              <span className="mt-0.5 block text-[11px] text-zinc-500">{t("emailContactHint")}</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link href="/ajutor" className={`${desktopHeading} inline-block hover:text-emerald-800`}>
            {t("colHelp")}
          </Link>
          <p className="text-xs leading-relaxed text-zinc-600">{t("colHelpIntro")}</p>
          <ul className="space-y-3">
            <li>
              <Link href="/cum-functioneaza" className={desktopLink}>
                {t("linkHowItWorks")}
              </Link>
            </li>
            <li>
              <Link href="/cum-publici-anunt" className={desktopLink}>
                {t("linkPostingGuide")}
              </Link>
            </li>
            <li>
              <Link href="/cum-contactezi-vanzatorul" className={desktopLink}>
                {t("linkContactSeller")}
              </Link>
            </li>
            <li>
              <Link href="/gestioneaza-contul" className={desktopLink}>
                {t("linkManageAccount")}
              </Link>
            </li>
            <li>
              <Link href="/business" className={desktopLink}>
                Cont firmă
              </Link>
            </li>
            <li>
              <Link href="/intrebari-frecvente" className={desktopLink}>
                {t("linkFaq")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link href="/siguranta" className={`${desktopHeading} inline-block hover:text-emerald-800`}>
            {t("colSafety")}
          </Link>
          <p className="text-xs leading-relaxed text-zinc-600">{t("colSafetyIntro")}</p>
          <ul className="space-y-3">
            <li>
              <Link href="/sfaturi-anti-frauda" className={desktopLink}>
                {t("linkAntiFraud")}
              </Link>
            </li>
            <li>
              <Link href="/cum-recunosti-un-scam" className={desktopLink}>
                {t("linkRecognizeScam")}
              </Link>
            </li>
            <li>
              <Link href="/reguli-siguranta-cumparare" className={desktopLink}>
                {t("linkSafetyBuy")}
              </Link>
            </li>
            <li>
              <Link href="/reguli-siguranta-vanzare" className={desktopLink}>
                {t("linkSafetySell")}
              </Link>
            </li>
            <li>
              <Link href="/raporteaza-anunt" className={desktopLink}>
                {t("linkReportListing")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className={desktopHeading}>{t("colLegal")}</p>
          <ul className="space-y-3">
            <li>
              <Link href="/termeni" className={desktopLink}>
                {t("terms")}
              </Link>
            </li>
            <li>
              <Link href="/confidentialitate" className={desktopLink}>
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/stergere-date" className={desktopLink}>
                {t("linkDataDeletion")}
              </Link>
            </li>
            <li>
              <Link href="/politica-cookie" className={desktopLink}>
                {t("linkCookiePolicy")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
