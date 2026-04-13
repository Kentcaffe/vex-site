import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SimpleInfoPage } from "@/components/info/SimpleInfoPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "InfoPages.antiFraud" });
  return { title: `${t("metaTitle")} | VEX`, description: t("metaDescription") };
}

export default async function SfaturiAntiFraudaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("InfoPages.antiFraud");

  return (
    <SimpleInfoPage title={t("title")}>
      <p>{t("intro")}</p>
      <ul className="list-inside list-disc space-y-2 pl-1">
        <li>{t("tip1")}</li>
        <li>{t("tip2")}</li>
        <li>{t("tip3")}</li>
        <li>{t("tip4")}</li>
        <li>{t("tip5")}</li>
      </ul>
      <p>{t("outro")}</p>
    </SimpleInfoPage>
  );
}
