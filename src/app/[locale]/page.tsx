import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HomeLanding } from "@/components/home/HomeLanding";
import { explicitPageCanonicalMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = explicitPageCanonicalMetadata(locale, "/");
  return {
    title: "VEX - Anunțuri gratuite în Moldova | Cumpără și vinde rapid",
    description:
      "VEX este o platformă de anunțuri gratuite din Moldova. Publică anunțuri rapid sau găsește mașini, apartamente, telefoane și multe altele.",
    alternates: { canonical: canonicalUrl.alternates.canonical },
    openGraph: {
      title: "VEX - Anunțuri gratuite în Moldova",
      description:
        "VEX este o platformă de anunțuri gratuite din Moldova. Publică anunțuri rapid sau găsește mașini, apartamente, telefoane și multe altele.",
      url: canonicalUrl.openGraph.url,
      type: "website",
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeLanding locale={locale} />;
}
