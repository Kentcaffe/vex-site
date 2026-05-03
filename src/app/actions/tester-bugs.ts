"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { routing } from "@/i18n/routing";
import { localizedHref } from "@/lib/paths";
import { getSupabaseServiceClient } from "@/lib/supabase-service-role";
import { submitTesterBugReport } from "@/lib/tester-bug-report-submit";
import { type BugStatus } from "@/lib/tester-bugs";

type SubmitState = {
  ok: boolean;
  message: string;
  error?: string;
};

type ReviewState = {
  ok: boolean;
  error?: string;
};

const VALID_STATUS = new Set<BugStatus>(["open", "accepted", "rejected"]);

/** Păstrat pentru compatibilitate; UI folosește POST /api/tester/bugs ca să evite UnrecognizedActionError la deploy. */
export async function submitBugReport(_prevState: SubmitState, formData: FormData): Promise<SubmitState> {
  return submitTesterBugReport(formData);
}

export async function reviewBugReport(_prevState: ReviewState, formData: FormData): Promise<ReviewState> {
  const session = await auth();
  const roleValue = String(session?.user?.role ?? "").toUpperCase();
  if (!session?.user?.id || roleValue !== "ADMIN") {
    return { ok: false, error: "Doar admin poate modera bug-uri." };
  }

  const bugId = String(formData.get("bugId") ?? "");
  const status = String(formData.get("status") ?? "").toLowerCase() as BugStatus;
  const reward = Math.max(0, Number(formData.get("reward") ?? 0));

  if (!bugId || !VALID_STATUS.has(status)) {
    return { ok: false, error: "Date invalide pentru moderare." };
  }

  const service = getSupabaseServiceClient();
  if (!service) {
    return { ok: false, error: "Lipseste configurarea service role pentru Supabase." };
  }

  const update = await service
    .from("bugs")
    .update({ status, reward })
    .eq("id", bugId);
  if (update.error) {
    return { ok: false, error: update.error.message || "Nu am putut actualiza bug-ul." };
  }

  revalidatePath("/admin/bugs");
  for (const loc of routing.locales) {
    revalidatePath(localizedHref(loc, "/tester"));
    revalidatePath(localizedHref(loc, "/cont"));
  }
  return { ok: true };
}

