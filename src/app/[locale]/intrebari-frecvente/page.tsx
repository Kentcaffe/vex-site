import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SimpleInfoPage } from "@/components/info/SimpleInfoPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "InfoPages.faq" });
  return { title: `${t("metaTitle")} | VEX`, description: t("metaDescription") };
}

export default async function IntrebariFrecventePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("InfoPages.faq");

  return (
    <SimpleInfoPage title={t("title")}>
      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{t("q1")}</p>
      <p>{t("a1")}</p>
      <p className="mt-6 font-semibold text-zinc-800 dark:text-zinc-200">{t("q2")}</p>
      <p>{t("a2")}</p>
      <p className="mt-6 font-semibold text-zinc-800 dark:text-zinc-200">{t("q3")}</p>
      <p>{t("a3")}</p>
    </SimpleInfoPage>
  );
}
