"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";
import { otherContentReport } from "@/lib/prisma-delegates";
import { REPORT_REASONS, type ReportReasonId } from "@/lib/report-reasons";
import { routing } from "@/i18n/routing";

const ALLOWED = new Set(REPORT_REASONS.map((r) => r.id));

export type SubmitReportResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "not_found" | "own_listing" | "already_reported" | "bad_reason" };

export type SubmitOtherReportResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "bad_reason" };

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

  if (!ALLOWED.has(reason as ReportReasonId)) {
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

  await otherContentReport.create({
    data: {
      reporterId: session.user.id,
      subject: parsed.data.subject,
      contextUrl,
      reason,
      details: parsed.data.details || null,
    },
  });

  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/admin/reclamatii"));
  }

  return { ok: true };
}
