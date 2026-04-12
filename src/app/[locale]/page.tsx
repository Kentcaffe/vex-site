import { setRequestLocale } from "next-intl/server";
import { HomeLanding } from "@/components/home/HomeLanding";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeLanding locale={locale} />;
}
