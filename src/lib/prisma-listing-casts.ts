import type { Prisma } from "@prisma/client";

/**
 * Cast-uri pentru API-ul Prisma când IDE-ul folosește un `@prisma/client` generat
 * înainte de câmpul `priceCurrency` (cache TS / client neactualizat).
 * Schema + `npx prisma generate` trebuie să fie la zi la runtime.
 */

export function asListingSelect(sel: Record<string, boolean>): Prisma.ListingSelect {
  return sel as unknown as Prisma.ListingSelect;
}

export function asListingCreateInput(data: Record<string, unknown>): Prisma.ListingCreateInput {
  return data as unknown as Prisma.ListingCreateInput;
}

/** `findMany` / `findUnique` cu `include: { category: true }` — acces sigur la `priceCurrency`. */
export type ListingPayloadWithCategory = Prisma.ListingGetPayload<{
  include: { category: true };
}> & {
  priceCurrency: string;
  /** Soft-delete (schema + `prisma generate`); opțional pentru compat IDE. */
  deletedAt?: Date | null;
  isDeleted?: boolean;
};

/** Rând listă `/anunturi` (select cu categoryId). */
export type ListingBrowseRow = {
  id: string;
  title: string;
  price: number;
  priceCurrency: string;
  city: string;
  district: string | null;
  images: string | null;
  categoryId: string;
  user?: {
    accountType?: string | null;
    isVerified?: boolean | null;
    businessStatus?: string | null;
    companyName?: string | null;
    companyLogo?: string | null;
  } | null;
};
/** `listingFavorite.findMany` cu `include.listing` + câmpuri pentru listă favorite. */
export type FavoriteRowWithListing = {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
  listing: {
    id: string;
    title: string;
    price: number;
    priceCurrency: string;
    city: string;
    district: string | null;
    images: string | null;
    categoryId: string;
  };
};
