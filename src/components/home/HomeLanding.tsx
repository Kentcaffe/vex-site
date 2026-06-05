import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { devLog } from "@/lib/dev-log";
import { getRootCategories } from "@/lib/category-queries";
import { getListingCategoryFilterIds } from "@/lib/category-filter";
import { findManyListingsResilient, countActiveListingsResilient } from "@/lib/prisma-listing-queries";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";
import { HomeMarketplace, type ListingCard } from "@/components/home/HomeMarketplace";

type Props = {
  locale: string;
};

async function getRootCategoryListingCounts(
  rootSlugs: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  await Promise.all(
    rootSlugs.map(async (slug) => {
      try {
        const ids = await getListingCategoryFilterIds(slug);
        if (!ids?.length) {
          counts[slug] = 0;
          return;
        }
        counts[slug] = await prisma.listing.count({
          where: { ...listingWhereActive(), categoryId: { in: ids } },
        });
      } catch {
        counts[slug] = 0;
      }
    }),
  );
  return counts;
}

export async function HomeLanding({ locale }: Props) {
  const session = await auth();
  let listings: ListingCard[] = [];
  let rootCategories = [] as Awaited<ReturnType<typeof getRootCategories>>;
  let categoryCounts: Record<string, number> = {};
  let activeListingsCount = 0;
  let usersCount = 0;
  let loadError = false;

  try {
    const [listingsResult, categoriesResult, listingsCount, usersCountResult] = await Promise.all([
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
          createdAt: true,
          user: {
            select: {
              accountType: true,
              isVerified: true,
              businessStatus: true,
              companyName: true,
            },
          },
        } as unknown as Prisma.ListingSelect,
      }) as unknown as Promise<ListingCard[]>,
      getRootCategories(),
      countActiveListingsResilient(),
      prisma.user.count().catch(() => 0),
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
    activeListingsCount = listingsCount;
    usersCount = usersCountResult;
    categoryCounts = await getRootCategoryListingCounts(rootCategories.map((c) => c.slug));
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
      categoryCounts={categoryCounts}
      favoritedIds={favoritedIds}
      activeListingsCount={activeListingsCount}
      usersCount={usersCount}
      loadError={loadError}
    />
  );
}
