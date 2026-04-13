import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InfoHubView } from "@/components/info/InfoHubView";

const SAFETY_LINKS = [
  { href: "/sfaturi-anti-frauda", labelKey: "linkAntiFraud" },
  { href: "/cum-recunosti-un-scam", labelKey: "linkRecognizeScam" },
  { href: "/reguli-siguranta-cumparare", labelKey: "linkSafetyBuy" },
  { href: "/reguli-siguranta-vanzare", labelKey: "linkSafetySell" },
  { href: "/raporteaza-anunt", labelKey: "linkReportListing" },
] as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "InfoArticle" });
  return {
    title: `${t("hubSafetyTitle")} | VEX`,
    description: t("hubSafetyIntro"),
  };
}

export default async function SigurantaHubPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <InfoHubView locale={locale} variant="siguranta" links={[...SAFETY_LINKS]} />;
}
