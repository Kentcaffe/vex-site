"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isAdmin, isStaff } from "@/lib/auth-roles";
import { softDeleteListingWithAdminLog } from "@/lib/admin-listing-soft-delete";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { localizedHref } from "@/lib/paths";
import { notifyListingReportResolved } from "@/lib/report-notifications";
import { prisma } from "@/lib/prisma";
import type { ReportStatus } from "@prisma/client";
import { routing } from "@/i18n/routing";

export type AdminReportResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "forbidden" | "not_found" };

async function revalidateComplaintPaths(listingId?: string) {
  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/admin/reclamatii"));
    revalidatePath(localizedHref(locale, "/admin/reports"));
    revalidatePath(localizedHref(locale, "/cont/notificari"));
    if (listingId) {
      revalidatePath(localizedHref(locale, `/anunturi/${listingId}`));
      revalidatePath(localizedHref(locale, "/anunturi"));
    }
  }
}

export async function setReportStatus(
  reportId: string,
  status: ReportStatus,
  resolutionNote?: string | null,
): Promise<AdminReportResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isStaff(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  const prev = await prisma.listingReport.findUnique({
    where: { id: reportId },
    include: {
      reporter: { select: { id: true, email: true } },
      listing: { select: { id: true, title: true } },
    },
  });
  if (!prev) {
    return { ok: false, error: "not_found" };
  }

  const note = resolutionNote?.trim() || null;

  await prisma.listingReport.update({
    where: { id: reportId },
    data: {
      status,
      resolutionNote: note,
      resolvedAt: status === "PENDING" ? null : new Date(),
    },
  });

  const shouldNotify =
    prev.status === "PENDING" && (status === "REVIEWED" || status === "DISMISSED") && prev.reporter.email;

  if (shouldNotify) {
    await notifyListingReportResolved({
      reporterId: prev.reporter.id,
      reporterEmail: prev.reporter.email,
      listingTitle: prev.listing.title,
      status,
      resolutionNote: note,
      reportId: prev.id,
    });
  }

  await revalidateComplaintPaths(prev.listing.id);
  return { ok: true };
}

export async function deleteListingFromReport(reportId: string): Promise<AdminReportResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isAdmin(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  const row = await prisma.listingReport.findUnique({
    where: { id: reportId },
    select: { listingId: true },
  });
  if (!row) {
    return { ok: false, error: "not_found" };
  }

  const listing = await prisma.listing.findFirst({
    where: { id: row.listingId, ...listingWhereActive() },
    select: { id: true },
  });
  if (!listing) {
    return { ok: false, error: "not_found" };
  }

  await softDeleteListingWithAdminLog(row.listingId, session.user.id);

  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/"));
    revalidatePath(localizedHref(locale, "/anunturi"));
    revalidatePath(localizedHref(locale, "/admin"));
    revalidatePath(localizedHref(locale, "/admin/listings"));
    revalidatePath(localizedHref(locale, "/admin/reclamatii"));
    revalidatePath(localizedHref(locale, "/admin/reports"));
    revalidatePath(localizedHref(locale, "/admin/trash"));
    revalidatePath(localizedHref(locale, "/admin/logs"));
    revalidatePath(localizedHref(locale, `/anunturi/${row.listingId}`));
  }

  return { ok: true };
}
