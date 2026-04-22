import { NextResponse } from "next/server";
import { ApiErrorCode, jsonServiceUnavailable } from "@/lib/api-error";
import { asListingSelect } from "@/lib/prisma-listing-casts";
import { findManyListingsResilient } from "@/lib/prisma-listing-queries";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { logRouteError } from "@/lib/server-log";

/**
 * Listă publică de anunțuri (JSON). Folosește aceleași filtre de bază ca homepage-ul.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const takeRaw = url.searchParams.get("take");
    const take = Math.min(100, Math.max(1, takeRaw ? Number(takeRaw) : 20));

    const listings = await findManyListingsResilient({
      where: listingWhereActive(),
      orderBy: { createdAt: "desc" },
      take: Number.isFinite(take) ? take : 20,
      select: asListingSelect({
        id: true,
        title: true,
        price: true,
        priceCurrency: true,
        city: true,
        district: true,
        images: true,
        categoryId: true,
        createdAt: true,
      }),
    });

    return NextResponse.json({ ok: true, listings }, { status: 200 });
  } catch (error) {
    logRouteError("GET /api/listings", error);
    console.error("[api/listings] GET failed", error);
    return jsonServiceUnavailable("Listings service is temporarily unavailable.", ApiErrorCode.DATABASE);
  }
}

export const dynamic = "force-dynamic";
