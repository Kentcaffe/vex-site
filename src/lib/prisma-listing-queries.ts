import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";

function prismaErrorCode(err: unknown): string | undefined {
  return typeof err === "object" && err !== null && "code" in err
    ? String((err as { code?: string }).code)
    : undefined;
}

/** Coloană lipsă / denumire diferită în DB față de schema Prisma (ex. migrări aplicate parțial). */
export function isMissingListingColumnError(err: unknown, column: string): boolean {
  const code = prismaErrorCode(err);
  if (code === "P2022") {
    return true;
  }
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes(`"${column}"`) ||
    msg.includes(`'${column}'`) ||
    (msg.includes("does not exist") && msg.includes(column))
  );
}

function omitIsDeletedFromWhere(
  where: Prisma.ListingWhereInput | undefined,
): Prisma.ListingWhereInput | undefined {
  if (!where) {
    return undefined;
  }
  const { isDeleted: _ignored, ...rest } = where as Prisma.ListingWhereInput & {
    isDeleted?: unknown;
  };
  return rest as Prisma.ListingWhereInput;
}

function withDefaultPriceCurrency<T extends Record<string, unknown>>(
  rows: T[],
): (T & { priceCurrency: string })[] {
  return rows.map((r) => ({
    ...r,
    priceCurrency: typeof r.priceCurrency === "string" ? r.priceCurrency : "MDL",
  }));
}

type ListingFindManyResult = Awaited<ReturnType<typeof prisma.listing.findMany>>;

/**
 * `findMany` pe Listing cu retry dacă lipsește `isDeleted` sau `priceCurrency` în DB.
 */
export async function findManyListingsResilient(
  args: Prisma.ListingFindManyArgs,
): Promise<ListingFindManyResult> {
  const wantedPriceCurrency =
    Boolean(
      args.select &&
        typeof args.select === "object" &&
        (args.select as Record<string, boolean>).priceCurrency === true,
    );
  let attempt: Prisma.ListingFindManyArgs = args;
  let fillPriceCurrencyMdl = false;

  for (let i = 0; i < 4; i += 1) {
    try {
      const rows = await prisma.listing.findMany(attempt);
      if (fillPriceCurrencyMdl && wantedPriceCurrency) {
        return withDefaultPriceCurrency(rows as Record<string, unknown>[]) as ListingFindManyResult;
      }
      return rows;
    } catch (err) {
      if (isMissingListingColumnError(err, "isDeleted")) {
        console.error(
          "[listings] findMany: coloana isDeleted lipsește sau e incompatibilă — reîncerc fără filtru soft-delete",
          err,
        );
        attempt = {
          ...attempt,
          where: omitIsDeletedFromWhere(attempt.where),
        };
        continue;
      }
      if (
        attempt.select &&
        typeof attempt.select === "object" &&
        isMissingListingColumnError(err, "priceCurrency")
      ) {
        console.error(
          "[listings] findMany: coloana priceCurrency lipsește — reîncerc fără ea (implicit MDL)",
          err,
        );
        const sel = { ...(attempt.select as Record<string, boolean>) };
        delete sel.priceCurrency;
        attempt = { ...attempt, select: sel };
        fillPriceCurrencyMdl = true;
        continue;
      }
      throw err;
    }
  }
  throw new Error("[listings] findMany: epuizate reîncercările");
}

export async function findFirstListingResilient<T extends Prisma.ListingFindFirstArgs>(
  args: T,
): Promise<Prisma.ListingGetPayload<T> | null> {
  const wantedPriceCurrency =
    Boolean(
      args.select &&
        typeof args.select === "object" &&
        (args.select as Record<string, boolean>).priceCurrency === true,
    );
  let attempt: Prisma.ListingFindFirstArgs = args;
  let fillPriceCurrencyMdl = false;

  for (let i = 0; i < 3; i += 1) {
    try {
      const row = await prisma.listing.findFirst(attempt);
      if (row && fillPriceCurrencyMdl && wantedPriceCurrency) {
        return { ...row, priceCurrency: "MDL" } as Prisma.ListingGetPayload<T>;
      }
      return row as Prisma.ListingGetPayload<T> | null;
    } catch (err) {
      if (isMissingListingColumnError(err, "isDeleted")) {
        console.error(
          "[listings] findFirst: coloana isDeleted lipsește — reîncerc fără filtru soft-delete",
          err,
        );
        attempt = {
          ...attempt,
          where: omitIsDeletedFromWhere(attempt.where),
        };
        continue;
      }
      if (
        attempt.select &&
        typeof attempt.select === "object" &&
        isMissingListingColumnError(err, "priceCurrency")
      ) {
        console.error("[listings] findFirst: priceCurrency lipsă — reîncerc fără ea", err);
        const sel = { ...(attempt.select as Record<string, boolean>) };
        delete sel.priceCurrency;
        attempt = { ...attempt, select: sel };
        fillPriceCurrencyMdl = true;
        continue;
      }
      throw err;
    }
  }
  throw new Error("[listings] findFirst: epuizate reîncercările");
}

/** Numără anunțuri „active” (sau toate dacă lipsește isDeleted). */
export async function countActiveListingsResilient(): Promise<number> {
  try {
    return await prisma.listing.count({ where: listingWhereActive() });
  } catch (err) {
    if (isMissingListingColumnError(err, "isDeleted")) {
      console.error(
        "[listings] count: coloana isDeleted lipsește — număr toate rândurile (fără filtru șters)",
        err,
      );
      return prisma.listing.count();
    }
    throw err;
  }
}
