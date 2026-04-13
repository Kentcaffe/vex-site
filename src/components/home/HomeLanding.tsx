import { auth } from "@/auth";
import { getRootCategories } from "@/lib/category-queries";
import { asListingSelect } from "@/lib/prisma-listing-casts";
import { prisma } from "@/lib/prisma";
import { HomeMarketplace, type ListingCard } from "@/components/home/HomeMarketplace";

type Props = {
  locale: string;
};

export async function HomeLanding({ locale }: Props) {
  const session = await auth();
  const [listings, rootCategories] = await Promise.all([
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: asListingSelect({
        id: true,
        title: true,
        price: true,
        priceCurrency: true,
        city: true,
        district: true,
        images: true,
        mileageKm: true,
      }),
    }) as unknown as Promise<ListingCard[]>,
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
