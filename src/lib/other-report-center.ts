/** Raporturi din /cont/raporteaza — tipuri și coduri stocate în OtherContentReport.reason */

export const REPORT_KIND = {
  listing: "listing",
  site: "site",
} as const;

export type ReportCenterKind = (typeof REPORT_KIND)[keyof typeof REPORT_KIND];

export const LISTING_REPORT_REASONS = [
  { id: "l_spam_scam" },
  { id: "l_fake_price" },
  { id: "l_prohibited" },
  { id: "l_inappropriate" },
  { id: "l_duplicate" },
  { id: "l_other" },
] as const;

export const SITE_REPORT_REASONS = [
  { id: "s_bug" },
  { id: "s_not_loading" },
  { id: "s_wrong_link" },
  { id: "s_account" },
  { id: "s_publish" },
  { id: "s_other" },
] as const;

export type ListingReportReasonId = (typeof LISTING_REPORT_REASONS)[number]["id"];
export type SiteReportReasonId = (typeof SITE_REPORT_REASONS)[number]["id"];

const LISTING_SET = new Set<string>(LISTING_REPORT_REASONS.map((r) => r.id));
const SITE_SET = new Set<string>(SITE_REPORT_REASONS.map((r) => r.id));

export function isValidListingReason(id: string): id is ListingReportReasonId {
  return LISTING_SET.has(id);
}

export function isValidSiteReason(id: string): id is SiteReportReasonId {
  return SITE_SET.has(id);
}

export function isValidReasonForKind(kind: ReportCenterKind, reason: string): boolean {
  if (kind === "listing") return isValidListingReason(reason);
  return isValidSiteReason(reason);
}
