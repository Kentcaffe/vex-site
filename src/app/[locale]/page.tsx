import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HomeLanding } from "@/components/home/HomeLanding";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Anunțuri gratuite Moldova | Vex.md",
    description:
      "Publică și găsește anunțuri gratuite în Moldova. Auto, imobiliare, electronice și multe altele.",
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeLanding locale={locale} />;
}
