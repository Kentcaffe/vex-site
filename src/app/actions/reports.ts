"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";
import { REPORT_REASONS, type ReportReasonId } from "@/lib/report-reasons";
import { routing } from "@/i18n/routing";

const ALLOWED = new Set(REPORT_REASONS.map((r) => r.id));

export type SubmitReportResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "not_found" | "own_listing" | "already_reported" | "bad_reason" };

export async function submitListingReport(
  listingId: string,
  reason: ReportReasonId,
  details: string | undefined,
): Promise<SubmitReportResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, userId: true },
  });
  if (!listing) {
    return { ok: false, error: "not_found" };
  }
  if (listing.userId === session.user.id) {
    return { ok: false, error: "own_listing" };
  }

  if (!ALLOWED.has(reason)) {
    return { ok: false, error: "bad_reason" };
  }

  const trimmed = details?.trim() ?? "";
  if (trimmed.length > 2000) {
    return { ok: false, error: "bad_reason" };
  }

  try {
    await prisma.listingReport.create({
      data: {
        listingId,
        reporterId: session.user.id,
        reason,
        details: trimmed || null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "already_reported" };
    }
    throw e;
  }

  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/admin/reports"));
  }

  return { ok: true };
}
