import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InfoHubView } from "@/components/info/InfoHubView";
import { explicitPageCanonicalMetadata } from "@/lib/seo";

const HELP_LINKS = [
  { href: "/cum-functioneaza", labelKey: "linkHowItWorks" },
  { href: "/cum-publici-anunt", labelKey: "linkPostingGuide" },
  { href: "/cum-contactezi-vanzatorul", labelKey: "linkContactSeller" },
  { href: "/gestioneaza-contul", labelKey: "linkManageAccount" },
  { href: "/intrebari-frecvente", labelKey: "linkFaq" },
] as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "InfoArticle" });
  const { alternates, openGraph } = explicitPageCanonicalMetadata(locale, "/ajutor");
  return {
    title: `${t("hubHelpTitle")} | VEX`,
    description: t("hubHelpIntro"),
    alternates,
    openGraph: { ...openGraph, type: "website" },
  };
}

export default async function AjutorHubPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <InfoHubView locale={locale} variant="ajutor" links={[...HELP_LINKS]} />;
}
