import { auth } from "@/auth";
import { getRootCategories } from "@/lib/category-queries";
import { prisma } from "@/lib/prisma";
import { HomeMarketplace } from "@/components/home/HomeMarketplace";

type Props = {
  locale: string;
};

export async function HomeLanding({ locale }: Props) {
  const session = await auth();
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

  let favoritedIds = new Set<string>();
  if (session?.user?.id && listings.length > 0) {
    const favs = await prisma.listingFavorite.findMany({
      where: {
        userId: session.user.id,
        listingId: { in: listings.map((l) => l.id) },
      },
      select: { listingId: true },
    });
    favoritedIds = new Set(favs.map((f) => f.listingId));
  }

  return (
    <HomeMarketplace
      locale={locale}
      listings={listings}
      rootCategories={rootCategories}
      favoritedIds={favoritedIds}
    />
  );
}
