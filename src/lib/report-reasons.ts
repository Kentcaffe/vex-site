/** Codes stored in DB and used in forms */
export const REPORT_REASONS = [
  { id: "spam", labelKey: "reasonSpam" },
  { id: "fraud", labelKey: "reasonFraud" },
  { id: "inappropriate", labelKey: "reasonInappropriate" },
  { id: "duplicate", labelKey: "reasonDuplicate" },
  { id: "other", labelKey: "reasonOther" },
] as const;

export type ReportReasonId = (typeof REPORT_REASONS)[number]["id"];
