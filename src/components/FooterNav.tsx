"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const desktopHeading = "text-sm font-medium text-[#0f172a]";
const desktopLink =
  "inline-block min-h-[44px] py-1 text-sm font-normal leading-snug text-[#64748b] sm:min-h-0 hover:text-[#1a56db]";

function AccordionRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-b border-[#e2e8f0] last:border-b-0 open:bg-[#f8fafc]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-[#f8fafc] [&::-webkit-details-marker]:hidden">
        <span className="text-[15px] font-medium leading-snug text-[#0f172a]">{title}</span>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-[#94a3b8] transition-transform duration-200 ease-out group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-[#e2e8f0] bg-white px-4 pb-4 pt-3">{children}</div>
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
      className={`block rounded-lg py-2.5 text-[15px] font-normal leading-snug text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#1a56db] ${className}`}
    />
  );
}

export function FooterNav() {
  const t = useTranslations("Footer");

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
      <li>
        <MobileFooterLink href="/ajutor">{t("colHelp")}</MobileFooterLink>
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
      <li>
        <MobileFooterLink href="/siguranta">{t("colSafety")}</MobileFooterLink>
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
    <>
      {/* Mobil */}
      <nav
        aria-label={t("accordionNavAria")}
        className="col-span-full md:hidden overflow-hidden rounded-xl border border-[#e2e8f0] bg-white"
      >
        <AccordionRow title={t("colHelp")}>{helpLinks}</AccordionRow>
        <AccordionRow title={t("colSafety")}>{safetyLinks}</AccordionRow>
        <AccordionRow title={t("colLegal")}>{legalLinks}</AccordionRow>
      </nav>

      {/* Desktop — 3 coloane (Ajutor, Siguranță, Legal) */}
      <div className="hidden md:contents">
        <div className="space-y-4">
          <p className={desktopHeading}>{t("colHelp")}</p>
          <ul className="space-y-2">
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
              <Link href="/intrebari-frecvente" className={desktopLink}>
                {t("linkFaq")}
              </Link>
            </li>
            <li>
              <Link href="/ajutor" className={desktopLink}>
                {t("colHelp")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className={desktopHeading}>{t("colSafety")}</p>
          <ul className="space-y-2">
            <li>
              <Link href="/sfaturi-anti-frauda" className={desktopLink}>
                {t("linkAntiFraud")}
              </Link>
            </li>
            <li>
              <Link href="/reguli-siguranta-cumparare" className={desktopLink}>
                {t("linkSafetyBuy")}
              </Link>
            </li>
            <li>
              <Link href="/raporteaza-anunt" className={desktopLink}>
                {t("linkReportListing")}
              </Link>
            </li>
            <li>
              <Link href="/siguranta" className={desktopLink}>
                {t("colSafety")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className={desktopHeading}>{t("colLegal")}</p>
          <ul className="space-y-2">
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
              <Link href="/politica-cookie" className={desktopLink}>
                {t("linkCookiePolicy")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
