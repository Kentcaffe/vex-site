import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListingDetailPage, { generateMetadata as generateLegacyListingMetadata } from "@/app/[locale]/anunturi/[id]/page";
import { listingIdFromSeoSlug } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { locale, slug } = await params;
    const id = listingIdFromSeoSlug(slug);
    const canonicalUrl = `https://vex.md/anunt/${slug}`;
    if (!id) {
      return {
        title: "Anunț indisponibil",
        description: "Acest anunț nu mai este disponibil pe VEX.",
        alternates: { canonical: canonicalUrl },
        openGraph: { url: canonicalUrl },
      };
    }
    const legacy = await generateLegacyListingMetadata({
      params: Promise.resolve({ locale, id }),
    });
    return {
      ...legacy,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        ...legacy.openGraph,
        url: canonicalUrl,
      },
    };
  } catch (error) {
    console.error("[anunt/[slug]] generateMetadata failed", error);
    return {
      title: "Anunț indisponibil",
      description: "Acest anunț nu mai este disponibil pe VEX.",
    };
  }
}

export default async function ListingSeoPage({ params }: Props) {
  try {
    const { locale, slug } = await params;
    const id = listingIdFromSeoSlug(slug);
    if (!id) notFound();
    return ListingDetailPage({ params: Promise.resolve({ locale, id }) });
  } catch (error) {
    console.error("[anunt/[slug]] page render failed", error);
    notFound();
  }
}
