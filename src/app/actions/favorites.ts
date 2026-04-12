"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";

export type ToggleFavoriteResult =
  | { ok: true; favorited: boolean }
  | { ok: false; error: "unauthorized" | "not_found" };

export async function toggleListingFavorite(listingId: string): Promise<ToggleFavoriteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });
  if (!listing) {
    return { ok: false, error: "not_found" };
  }

  const existing = await prisma.listingFavorite.findUnique({
    where: {
      userId_listingId: { userId: session.user.id, listingId },
    },
  });

  if (existing) {
    await prisma.listingFavorite.delete({ where: { id: existing.id } });
    for (const locale of routing.locales) {
      revalidatePath(localizedHref(locale, "/cont/favorite"));
      revalidatePath(localizedHref(locale, `/anunturi/${listingId}`));
    }
    return { ok: true, favorited: false };
  }

  await prisma.listingFavorite.create({
    data: { userId: session.user.id, listingId },
  });
  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/cont/favorite"));
    revalidatePath(localizedHref(locale, `/anunturi/${listingId}`));
  }
  return { ok: true, favorited: true };
}
