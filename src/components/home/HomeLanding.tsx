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
  let listings: ListingCard[] = [];
  let rootCategories = [] as Awaited<ReturnType<typeof getRootCategories>>;
  let loadError = false;

  try {
    const [listingsResult, categoriesResult] = await Promise.all([
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

    console.log("[home] listings query response", {
      isArray: Array.isArray(listingsResult),
      count: Array.isArray(listingsResult) ? listingsResult.length : 0,
    });
    console.log("[home] categories query response", {
      isArray: Array.isArray(categoriesResult),
      count: Array.isArray(categoriesResult) ? categoriesResult.length : 0,
    });

    listings = Array.isArray(listingsResult) ? listingsResult : [];
    rootCategories = Array.isArray(categoriesResult) ? categoriesResult : [];
  } catch (error) {
    loadError = true;
    console.error("[home] load error", error);
  }

  let favoritedIds = new Set<string>();
  if (session?.user?.id && listings.length > 0) {
    try {
      const favs = await prisma.listingFavorite.findMany({
        where: {
          userId: session.user.id,
          listingId: { in: listings.map((l) => l.id) },
        },
        select: { listingId: true },
      });
      favoritedIds = new Set(favs.map((f) => f.listingId));
    } catch (e) {
      console.error("[home] favorites load error", e);
    }
  }

  return (
    <HomeMarketplace
      locale={locale}
      listings={listings}
      rootCategories={rootCategories}
      favoritedIds={favoritedIds}
      loadError={loadError}
    />
  );
}
