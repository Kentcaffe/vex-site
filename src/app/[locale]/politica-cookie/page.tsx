import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SimpleInfoPage } from "@/components/info/SimpleInfoPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "InfoPages.cookies" });
  return { title: `${t("metaTitle")} | VEX`, description: t("metaDescription") };
}

export default async function PoliticaCookiePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("InfoPages.cookies");

  return (
    <SimpleInfoPage title={t("title")}>
      <p>{t("p1")}</p>
      <p>{t("p2")}</p>
      <p>{t("p3")}</p>
      <p>{t("p4")}</p>
    </SimpleInfoPage>
  );
}
