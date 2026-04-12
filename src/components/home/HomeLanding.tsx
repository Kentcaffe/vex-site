import { getRootCategories } from "@/lib/category-queries";
import { prisma } from "@/lib/prisma";
import { HomeMarketplace } from "@/components/home/HomeMarketplace";

type Props = {
  locale: string;
};

export async function HomeLanding({ locale }: Props) {
  const [listings, rootCategories] = await Promise.all([
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        title: true,
        price: true,
        city: true,
        district: true,
        images: true,
        mileageKm: true,
      },
    }),
    getRootCategories(),
  ]);

  return <HomeMarketplace locale={locale} listings={listings} rootCategories={rootCategories} />;
}
