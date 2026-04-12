"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isStaff } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";
import type { ReportStatus } from "@prisma/client";
import { routing } from "@/i18n/routing";

export type AdminReportResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "forbidden" | "not_found" };

async function revalidateAdminAndListing(listingId: string) {
  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/admin"));
    revalidatePath(localizedHref(locale, "/admin/reports"));
    revalidatePath(localizedHref(locale, `/anunturi/${listingId}`));
    revalidatePath(localizedHref(locale, "/anunturi"));
  }
}

export async function setReportStatus(reportId: string, status: ReportStatus): Promise<AdminReportResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isStaff(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  const row = await prisma.listingReport.findUnique({
    where: { id: reportId },
    select: { listingId: true },
  });
  if (!row) {
    return { ok: false, error: "not_found" };
  }

  await prisma.listingReport.update({
    where: { id: reportId },
    data: {
      status,
      resolvedAt: status === "PENDING" ? null : new Date(),
    },
  });

  await revalidateAdminAndListing(row.listingId);
  return { ok: true };
}

export async function deleteListingFromReport(reportId: string): Promise<AdminReportResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isStaff(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  const row = await prisma.listingReport.findUnique({
    where: { id: reportId },
    select: { listingId: true },
  });
  if (!row) {
    return { ok: false, error: "not_found" };
  }

  await prisma.listing.delete({ where: { id: row.listingId } });

  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/"));
    revalidatePath(localizedHref(locale, "/anunturi"));
    revalidatePath(localizedHref(locale, "/admin"));
    revalidatePath(localizedHref(locale, "/admin/listings"));
    revalidatePath(localizedHref(locale, "/admin/reports"));
    revalidatePath(localizedHref(locale, `/anunturi/${row.listingId}`));
  }

  return { ok: true };
}
