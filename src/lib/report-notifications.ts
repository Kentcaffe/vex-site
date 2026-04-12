import type { ReportStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { isMailConfigured, sendTransactionalEmail } from "@/lib/mail";
import { localizedHref } from "@/lib/paths";
import { userNotification } from "@/lib/prisma-delegates";
import { routing } from "@/i18n/routing";

function htmlFromPlain(body: string): string {
  const safe = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<div style="font-family:system-ui,sans-serif;line-height:1.5">${safe
    .split("\n")
    .map((line) => `<p>${line || "&nbsp;"}</p>`)
    .join("")}</div>`;
}

type Resolved = Extract<ReportStatus, "REVIEWED" | "DISMISSED">;

export async function notifyListingReportResolved(params: {
  reporterId: string;
  reporterEmail: string;
  listingTitle: string;
  status: Resolved;
  resolutionNote: string | null;
  reportId: string;
}): Promise<void> {
  const upheld = params.status === "REVIEWED";
  const title = upheld
    ? "Reclamație: încălcare confirmată"
    : "Reclamație: fără încălcare confirmată";

  const lines = [
    `Anunț raportat: «${params.listingTitle}»`,
    upheld
      ? "Moderatorii au confirmat o problemă. S-au putut lua măsuri (inclusiv eliminarea anunțului), conform regulilor site-ului."
      : "După verificare, nu s-a confirmat o încălcare a regulilor pentru acest raport.",
  ];
  if (params.resolutionNote?.trim()) {
    lines.push(`Acțiune / detalii: ${params.resolutionNote.trim()}`);
  }
  lines.push("Găsești acest mesaj și în cont → Notificări.");
  const body = lines.join("\n\n");

  await userNotification.create({
    data: {
      userId: params.reporterId,
      kind: "listing_report_resolved",
      refId: params.reportId,
      title,
      body,
    },
  });

  if (isMailConfigured()) {
    await sendTransactionalEmail(params.reporterEmail, title, htmlFromPlain(body));
  }

  for (const loc of routing.locales) {
    revalidatePath(localizedHref(loc, "/cont/notificari"));
    revalidatePath(localizedHref(loc, "/"));
  }
}

export async function notifyOtherReportResolved(params: {
  reporterId: string;
  reporterEmail: string;
  subject: string;
  status: Resolved;
  resolutionNote: string | null;
  reportId: string;
}): Promise<void> {
  const upheld = params.status === "REVIEWED";
  const title = upheld ? "Reclamație (conținut): încălcare confirmată" : "Reclamație (conținut): fără încălcare";

  const lines = [
    `Subiect: «${params.subject}»`,
    upheld
      ? "Moderatorii au confirmat o problemă legată de acest conținut."
      : "După verificare, nu s-a confirmat o încălcare a regulilor.",
  ];
  if (params.resolutionNote?.trim()) {
    lines.push(`Acțiune / detalii: ${params.resolutionNote.trim()}`);
  }
  lines.push("Găsești acest mesaj și în cont → Notificări.");
  const body = lines.join("\n\n");

  await userNotification.create({
    data: {
      userId: params.reporterId,
      kind: "other_report_resolved",
      refId: params.reportId,
      title,
      body,
    },
  });

  if (isMailConfigured()) {
    await sendTransactionalEmail(params.reporterEmail, title, htmlFromPlain(body));
  }

  for (const loc of routing.locales) {
    revalidatePath(localizedHref(loc, "/cont/notificari"));
    revalidatePath(localizedHref(loc, "/"));
  }
}
