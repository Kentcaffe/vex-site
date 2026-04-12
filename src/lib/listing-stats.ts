import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getActiveListingCount = unstable_cache(
  async () => prisma.listing.count(),
  ["listing-count"],
  { revalidate: 60 },
);
