import { unstable_cache } from "next/cache";
import { countActiveListingsResilient } from "@/lib/prisma-listing-queries";

export const getActiveListingCount = unstable_cache(
  async () => countActiveListingsResilient(),
  ["listing-count"],
  { revalidate: 60 },
);
