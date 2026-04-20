import type { Prisma } from "@prisma/client";

/**
 * Filtre soft-delete pentru `Listing`.
 * Folosim `unknown` → tip Prisma ca IDE-ul să nu raporteze erori când cache-ul TS e înainte de `prisma generate`.
 */
export function listingWhereActive(): Prisma.ListingWhereInput {
  return { isDeleted: false } as unknown as Prisma.ListingWhereInput;
}

export function listingWhereDeleted(): Prisma.ListingWhereInput {
  return { isDeleted: true } as unknown as Prisma.ListingWhereInput;
}

export function listingUpdateSoftDelete(): Prisma.ListingUpdateInput {
  return {
    isDeleted: true,
    deletedAt: new Date(),
  } as unknown as Prisma.ListingUpdateInput;
}

export function listingUpdateRestore(): Prisma.ListingUpdateInput {
  return {
    isDeleted: false,
    deletedAt: null,
  } as unknown as Prisma.ListingUpdateInput;
}

