import { unstable_cache } from "next/cache";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";

export const getActiveListingCount = unstable_cache(
  async () => prisma.listing.count({ where: listingWhereActive() }),
  ["listing-count"],
  { revalidate: 60 },
);
