"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { localizedHref } from "@/lib/paths";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";
import { otherContentReport } from "@/lib/prisma-delegates";
import { REPORT_REASONS, type ReportReasonId } from "@/lib/report-reasons";
import { REPORT_KIND, isValidReasonForKind, type ReportCenterKind } from "@/lib/other-report-center";
import { routing } from "@/i18n/routing";

const ALLOWED = new Set(REPORT_REASONS.map((r) => r.id));

export type SubmitReportResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "not_found" | "own_listing" | "already_reported" | "bad_reason" };

export type SubmitOtherReportResult =
  | { ok: true; kind: ReportCenterKind }
  | { ok: false; error: "unauthorized" | "bad_reason" | "bad_kind" };

export async function submitListingReport(
  listingId: string,
  reason: ReportReasonId,
  details: string | undefined,
): Promise<SubmitReportResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const reporter = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!reporter) {
    return { ok: false, error: "unauthorized" };
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ...listingWhereActive() },
    select: { id: true, userId: true },
  });
  if (!listing) {
    return { ok: false, error: "not_found" };
  }
  if (listing.userId === reporter.id) {
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
        reporterId: reporter.id,
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
    revalidatePath(localizedHref(locale, "/admin/reclamatii"));
    revalidatePath(localizedHref(locale, "/admin/reports"));
  }

  return { ok: true };
}

export async function submitOtherContentReport(
  _prev: SubmitOtherReportResult | undefined,
  formData: FormData,
): Promise<SubmitOtherReportResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const reporter = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!reporter) {
    return { ok: false, error: "unauthorized" };
  }

  const kindRaw = String(formData.get("reportKind") ?? "").trim();
  if (kindRaw !== REPORT_KIND.listing && kindRaw !== REPORT_KIND.site) {
    return { ok: false, error: "bad_kind" };
  }
  const kind = kindRaw as ReportCenterKind;

  const subject = String(formData.get("subject") ?? "").trim();
  const reason = String(formData.get("reason") ?? "");
  const detailsRaw = String(formData.get("details") ?? "").trim();
  const urlRaw = String(formData.get("contextUrl") ?? "").trim();

  const parsed = z
    .object({
      subject: z.string().min(3).max(200),
      details: z.string().max(2000),
    })
    .safeParse({ subject, details: detailsRaw });

  if (!parsed.success) {
    return { ok: false, error: "bad_reason" };
  }

  if (!isValidReasonForKind(kind, reason)) {
    return { ok: false, error: "bad_reason" };
  }

  let contextUrl: string | null = null;
  if (urlRaw) {
    try {
      new URL(urlRaw);
      contextUrl = urlRaw;
    } catch {
      return { ok: false, error: "bad_reason" };
    }
  }

  if (kind === REPORT_KIND.listing && !contextUrl) {
    return { ok: false, error: "bad_reason" };
  }

  await otherContentReport.create({
    data: {
      reporterId: reporter.id,
      kind,
      subject: parsed.data.subject,
      contextUrl,
      reason,
      details: parsed.data.details || null,
    },
  });

  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/admin/reclamatii"));
  }

  return { ok: true, kind };
}
