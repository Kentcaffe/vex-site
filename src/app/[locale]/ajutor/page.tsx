import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InfoHubView } from "@/components/info/InfoHubView";

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
  return {
    title: `${t("hubHelpTitle")} | VEX`,
    description: t("hubHelpIntro"),
  };
}

export default async function AjutorHubPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <InfoHubView locale={locale} variant="ajutor" links={[...HELP_LINKS]} />;
}
