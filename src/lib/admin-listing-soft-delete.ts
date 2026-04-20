import { listingUpdateSoftDelete } from "@/lib/prisma-listing-soft-delete-filter";
import { adminLog } from "@/lib/prisma-delegates";
import { prisma } from "@/lib/prisma";

/** Ștergere soft + înregistrare în jurnal admin (apel doar după verificare rol admin). */
export async function softDeleteListingWithAdminLog(listingId: string, adminId: string): Promise<void> {
  await prisma.$transaction([
    prisma.listing.update({
      where: { id: listingId },
      data: listingUpdateSoftDelete(),
    }),
    adminLog.create({
      data: { adminId, action: "DELETE_LISTING", targetId: listingId },
    }),
  ]);
}
