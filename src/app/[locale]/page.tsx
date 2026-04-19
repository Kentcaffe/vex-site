import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HomeLanding } from "@/components/home/HomeLanding";

export const metadata: Metadata = {
  title: "VEX - Anunțuri gratuite în Moldova | Cumpără și vinde rapid",
  description:
    "VEX este o platformă de anunțuri gratuite din Moldova. Publică anunțuri rapid sau găsește mașini, apartamente, telefoane și multe altele.",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeLanding locale={locale} />;
}
