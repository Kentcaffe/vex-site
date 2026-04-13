import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SimpleInfoPage } from "@/components/info/SimpleInfoPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "InfoPages.reportAd" });
  return { title: `${t("metaTitle")} | VEX`, description: t("metaDescription") };
}

export default async function RaporteazaAnuntPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("InfoPages.reportAd");

  return (
    <SimpleInfoPage title={t("title")}>
      <p>{t("p1")}</p>
      <p>{t("p2")}</p>
      <p>
        <Link href="/anunturi" className="font-semibold text-emerald-700 underline decoration-emerald-700/30 underline-offset-2 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
          {t("browseLink")}
        </Link>
      </p>
    </SimpleInfoPage>
  );
}
