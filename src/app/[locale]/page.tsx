import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HomeLanding } from "@/components/home/HomeLanding";

export const metadata: Metadata = {
  title: "Anunțuri gratuite Moldova | Vex.md",
  description:
    "Publică și găsește anunțuri gratuite în Moldova. Auto, imobiliare, electronice și multe altele.",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeLanding locale={locale} />;
}
