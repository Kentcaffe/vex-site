import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { devLog } from "@/lib/dev-log";
import { getRootCategories } from "@/lib/category-queries";
import { findManyListingsResilient } from "@/lib/prisma-listing-queries";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
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
      findManyListingsResilient({
        where: listingWhereActive(),
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          title: true,
          price: true,
          priceCurrency: true,
          city: true,
          district: true,
          images: true,
          mileageKm: true,
          user: {
            select: {
              accountType: true,
              isVerified: true,
              companyName: true,
            },
          },
        } as unknown as Prisma.ListingSelect,
      }) as unknown as Promise<ListingCard[]>,
      getRootCategories(),
    ]);

    devLog("[home] listings query response", {
      isArray: Array.isArray(listingsResult),
      count: Array.isArray(listingsResult) ? listingsResult.length : 0,
    });
    devLog("[home] categories query response", {
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
      favoritedIds = new Set(favs.map((f: { listingId: string }) => f.listingId));
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
