"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-roles";
import { softDeleteListingWithAdminLog } from "@/lib/admin-listing-soft-delete";
import {
  listingUpdateRestore,
  listingWhereActive,
  listingWhereDeleted,
} from "@/lib/prisma-listing-soft-delete-filter";
import { localizedHref } from "@/lib/paths";
import { adminLog } from "@/lib/prisma-delegates";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";

export type AdminListingMutationResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "forbidden" | "not_found" };

function revalidateListingSurfaces(listingId: string) {
  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/"));
    revalidatePath(localizedHref(locale, "/anunturi"));
    revalidatePath(localizedHref(locale, `/anunturi/${listingId}`));
    revalidatePath(localizedHref(locale, "/cont/anunturi"));
    revalidatePath(localizedHref(locale, "/cont/favorite"));
    revalidatePath(localizedHref(locale, "/admin"));
    revalidatePath(localizedHref(locale, "/admin/listings"));
    revalidatePath(localizedHref(locale, "/admin/trash"));
    revalidatePath(localizedHref(locale, "/admin/logs"));
    revalidatePath(localizedHref(locale, "/admin/reports"));
    revalidatePath(localizedHref(locale, "/admin/reclamatii"));
  }
}

/** Ștergere soft (admin) + jurnal. Înlocuiește ștergerea fizică din panou. */
export async function deleteListingAsStaff(listingId: string): Promise<AdminListingMutationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isAdmin(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  const row = await prisma.listing.findFirst({
    where: { id: listingId, ...listingWhereActive() },
    select: { id: true },
  });
  if (!row) {
    return { ok: false, error: "not_found" };
  }

  await softDeleteListingWithAdminLog(listingId, session.user.id);
  revalidateListingSurfaces(listingId);

  return { ok: true };
}

export async function restoreListingAsAdmin(listingId: string): Promise<AdminListingMutationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isAdmin(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  const row = await prisma.listing.findFirst({
    where: { id: listingId, ...listingWhereDeleted() },
    select: { id: true },
  });
  if (!row) {
    return { ok: false, error: "not_found" };
  }

  await prisma.$transaction([
    prisma.listing.update({
      where: { id: listingId },
      data: listingUpdateRestore(),
    }),
    adminLog.create({
      data: { adminId: session.user.id, action: "RESTORE_LISTING", targetId: listingId },
    }),
  ]);
  revalidateListingSurfaces(listingId);

  return { ok: true };
}

export async function permanentlyDeleteListingAsAdmin(listingId: string): Promise<AdminListingMutationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isAdmin(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  const row = await prisma.listing.findFirst({
    where: { id: listingId, ...listingWhereDeleted() },
    select: { id: true },
  });
  if (!row) {
    return { ok: false, error: "not_found" };
  }

  await prisma.$transaction([
    prisma.listing.delete({ where: { id: listingId } }),
    adminLog.create({
      data: { adminId: session.user.id, action: "PERMANENT_DELETE_LISTING", targetId: listingId },
    }),
  ]);
  revalidateListingSurfaces(listingId);

  return { ok: true };
}
