"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isStaff } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { notifyOtherReportResolved } from "@/lib/report-notifications";
import { otherContentReport } from "@/lib/prisma-delegates";
import type { ReportStatus } from "@prisma/client";
import { routing } from "@/i18n/routing";

export type AdminOtherReportResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "forbidden" | "not_found" | "invalid" | "service_unavailable" };

async function revalidatePaths() {
  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/admin/reclamatii"));
    revalidatePath(localizedHref(locale, "/cont/notificari"));
  }
}

export async function setOtherReportStatus(
  reportId: string,
  status: ReportStatus,
  resolutionNote?: string | null,
): Promise<AdminOtherReportResult> {
  const normalizedId = reportId.trim();
  if (!normalizedId) {
    return { ok: false, error: "invalid" };
  }
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  if (!isStaff(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const prev = await otherContentReport.findUnique({
      where: { id: normalizedId },
      include: { reporter: { select: { id: true, email: true } } },
    });
    if (!prev) {
      return { ok: false, error: "not_found" };
    }

    const note = resolutionNote?.trim() || null;

    await otherContentReport.update({
      where: { id: normalizedId },
      data: {
        status,
        resolutionNote: note,
        resolvedAt: status === "PENDING" ? null : new Date(),
      },
    });

    const shouldNotify =
      prev.status === "PENDING" && (status === "REVIEWED" || status === "DISMISSED") && prev.reporter.email;

    if (shouldNotify) {
      await notifyOtherReportResolved({
        reporterId: prev.reporter.id,
        reporterEmail: prev.reporter.email,
        subject: prev.subject,
        status,
        resolutionNote: note,
        reportId: prev.id,
      });
    }

    await revalidatePaths();
    return { ok: true };
  } catch (error) {
    console.error("[actions/admin-other-reports] setOtherReportStatus failed", error);
    return { ok: false, error: "service_unavailable" };
  }
}
