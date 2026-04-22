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
  | { ok: false; error: "unauthorized" | "forbidden" | "not_found" | "invalid" | "service_unavailable" };

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
  const normalizedId = listingId.trim();
  if (!normalizedId) {
    return { ok: false, error: "invalid" };
  }
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isAdmin(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const row = await prisma.listing.findFirst({
      where: { id: normalizedId, ...listingWhereActive() },
      select: { id: true },
    });
    if (!row) {
      return { ok: false, error: "not_found" };
    }

    await softDeleteListingWithAdminLog(normalizedId, session.user.id);
    revalidateListingSurfaces(normalizedId);

    return { ok: true };
  } catch (error) {
    console.error("[actions/admin-listings] deleteListingAsStaff failed", error);
    return { ok: false, error: "service_unavailable" };
  }
}

export async function restoreListingAsAdmin(listingId: string): Promise<AdminListingMutationResult> {
  const normalizedId = listingId.trim();
  if (!normalizedId) {
    return { ok: false, error: "invalid" };
  }
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isAdmin(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const row = await prisma.listing.findFirst({
      where: { id: normalizedId, ...listingWhereDeleted() },
      select: { id: true },
    });
    if (!row) {
      return { ok: false, error: "not_found" };
    }

    await prisma.$transaction([
      prisma.listing.update({
        where: { id: normalizedId },
        data: listingUpdateRestore(),
      }),
      adminLog.create({
        data: { adminId: session.user.id, action: "RESTORE_LISTING", targetId: normalizedId },
      }),
    ]);
    revalidateListingSurfaces(normalizedId);

    return { ok: true };
  } catch (error) {
    console.error("[actions/admin-listings] restoreListingAsAdmin failed", error);
    return { ok: false, error: "service_unavailable" };
  }
}

export async function permanentlyDeleteListingAsAdmin(listingId: string): Promise<AdminListingMutationResult> {
  const normalizedId = listingId.trim();
  if (!normalizedId) {
    return { ok: false, error: "invalid" };
  }
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isAdmin(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const row = await prisma.listing.findFirst({
      where: { id: normalizedId, ...listingWhereDeleted() },
      select: { id: true },
    });
    if (!row) {
      return { ok: false, error: "not_found" };
    }

    await prisma.$transaction([
      prisma.listing.delete({ where: { id: normalizedId } }),
      adminLog.create({
        data: { adminId: session.user.id, action: "PERMANENT_DELETE_LISTING", targetId: normalizedId },
      }),
    ]);
    revalidateListingSurfaces(normalizedId);

    return { ok: true };
  } catch (error) {
    console.error("[actions/admin-listings] permanentlyDeleteListingAsAdmin failed", error);
    return { ok: false, error: "service_unavailable" };
  }
}
