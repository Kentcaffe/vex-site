"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { localizedHref } from "@/lib/paths";
import { feedback } from "@/lib/prisma-delegates";
import { routing } from "@/i18n/routing";

export type SubmitFeedbackResult =
  | { ok: true }
  | { ok: false; error: "empty" | "too_long" | "invalid_email" | "service_unavailable" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitFeedback(formData: FormData): Promise<SubmitFeedbackResult> {
  const message = String(formData.get("message") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();

  if (message.length < 5) {
    return { ok: false, error: "empty" };
  }
  if (message.length > 8000) {
    return { ok: false, error: "too_long" };
  }

  const session = await auth();
  let email: string | null = null;
  if (emailRaw) {
    if (!EMAIL_RE.test(emailRaw)) {
      return { ok: false, error: "invalid_email" };
    }
    email = emailRaw.toLowerCase();
  }

  try {
    await feedback.create({
      data: {
        userId: session?.user?.id ?? null,
        email,
        message,
      },
    });
  } catch (error) {
    console.error("[actions/feedback] feedback.create failed", error);
    return { ok: false, error: "service_unavailable" };
  }

  for (const loc of routing.locales) {
    revalidatePath(localizedHref(loc, "/admin/feedback"));
    revalidatePath(localizedHref(loc, "/contact"));
  }

  return { ok: true };
}
