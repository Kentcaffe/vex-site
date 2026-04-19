"use server";

import { createHash, randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { localizedHref } from "@/lib/paths";
import { getSupabaseAnonForAuthActions, isSupabaseAuthConfigured } from "@/lib/supabase-auth-server";
import { passwordResetToken } from "@/lib/prisma-delegates";
import { prisma } from "@/lib/prisma";

export type RequestResetState =
  | { ok: true }
  | { ok: false; error: "validation" | "mailNotConfigured" };

export type CompleteResetState =
  | { ok: true }
  | { ok: false; error: "validation" | "invalidToken" | "expired" | "mismatch" };

function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/**
 * Trimite email de reset prin Supabase Auth (același flux ca login / confirmare).
 * Parola e ținută în Supabase; fluxul vechi Prisma+SMTP nu se mai folosește la cerere.
 */
export async function requestPasswordReset(
  _prev: RequestResetState | undefined,
  formData: FormData,
): Promise<RequestResetState> {
  if (!isSupabaseAuthConfigured()) {
    console.error("[password-reset] Lipsesc NEXT_PUBLIC_SUPABASE_URL sau NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return { ok: false, error: "mailNotConfigured" };
  }

  const parsed = z
    .object({
      email: z.string().email(),
      locale: z.string().min(2).max(5),
    })
    .safeParse({
      email: formData.get("email"),
      locale: formData.get("locale"),
    });

  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  const { email, locale } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const supabase = getSupabaseAnonForAuthActions();
  if (!supabase) {
    return { ok: false, error: "mailNotConfigured" };
  }

  const base = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "https://vex.md").replace(/\/$/, "");
  const nextPath = localizedHref(locale, "/cont/reset-password");
  const redirectTo = `${base}/api/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo,
  });

  console.log("[password-reset] resetPasswordForEmail", {
    email: normalizedEmail,
    redirectTo,
    data,
    error: error
      ? {
          message: error.message,
          status: error.status,
          code: (error as { code?: string }).code,
        }
      : null,
  });

  if (error) {
    console.error("[password-reset] resetPasswordForEmail error:", error);
  }

  // Anti-enumerare: același răspuns pentru „email inexistent”, rate limit etc.
  return { ok: true };
}

/** Finalizare reset pentru linkuri vechi cu token în URL (Prisma). */
export async function completePasswordReset(
  _prev: CompleteResetState | undefined,
  formData: FormData,
): Promise<CompleteResetState> {
  const parsed = z
    .object({
      token: z.string().min(20),
      password: z.string().min(8),
      confirm: z.string().min(8),
    })
    .safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirm: formData.get("confirm"),
    });

  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  const { token, password, confirm } = parsed.data;
  if (password !== confirm) {
    return { ok: false, error: "mismatch" };
  }

  const tokenHash = hashToken(token);
  const row = await passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!row) {
    return { ok: false, error: "invalidToken" };
  }
  if (row.expiresAt.getTime() < Date.now()) {
    await passwordResetToken.delete({ where: { id: row.id } });
    return { ok: false, error: "expired" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash: await hash(password, 12) },
    }),
    passwordResetToken.deleteMany({ where: { userId: row.userId } }),
  ]);

  return { ok: true };
}
