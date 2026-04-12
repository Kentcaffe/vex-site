"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isStaff } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";

export type DeleteListingStaffResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "forbidden" | "not_found" };

export async function deleteListingAsStaff(listingId: string): Promise<DeleteListingStaffResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isStaff(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  const row = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });
  if (!row) {
    return { ok: false, error: "not_found" };
  }

  await prisma.listing.delete({ where: { id: listingId } });

  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/"));
    revalidatePath(localizedHref(locale, "/anunturi"));
    revalidatePath(localizedHref(locale, `/anunturi/${listingId}`));
    revalidatePath(localizedHref(locale, "/admin"));
    revalidatePath(localizedHref(locale, "/admin/listings"));
    revalidatePath(localizedHref(locale, "/admin/reports"));
  }

  return { ok: true };
}
