"use server";

import { createHash, randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { localizedHref } from "@/lib/paths";
import { isMailConfigured, sendPasswordResetEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export type RequestResetState =
  | { ok: true }
  | { ok: false; error: "validation" | "mailNotConfigured" | "sendFailed" };

export type CompleteResetState =
  | { ok: true }
  | { ok: false; error: "validation" | "invalidToken" | "expired" | "mismatch" };

function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function requestPasswordReset(
  _prev: RequestResetState | undefined,
  formData: FormData,
): Promise<RequestResetState> {
  if (!isMailConfigured()) {
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
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  // Same response whether or not the account exists (avoid email enumeration).
  const genericOk: RequestResetState = { ok: true };

  if (!user?.passwordHash) {
    return genericOk;
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 h

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const path = localizedHref(locale, "/cont/reset-password");
  const link = `${base}${path}?token=${encodeURIComponent(rawToken)}`;

  const subject =
    locale === "en"
      ? "Reset your password"
      : locale === "ru"
        ? "Сброс пароля"
        : "Resetare parolă";

  const html =
    locale === "en"
      ? `<p>Click the link to set a new password (valid 1 hour):</p><p><a href="${link}">${link}</a></p>`
      : locale === "ru"
        ? `<p>Откройте ссылку, чтобы задать новый пароль (действует 1 час):</p><p><a href="${link}">${link}</a></p>`
        : `<p>Deschide linkul pentru o parolă nouă (valabil 1 oră):</p><p><a href="${link}">${link}</a></p>`;

  const sent = await sendPasswordResetEmail(user.email, subject, html);
  if (!sent.ok) {
    await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
    return { ok: false, error: "sendFailed" };
  }

  return genericOk;
}

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
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!row) {
    return { ok: false, error: "invalidToken" };
  }
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.passwordResetToken.delete({ where: { id: row.id } });
    return { ok: false, error: "expired" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash: await hash(password, 12) },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: row.userId } }),
  ]);

  return { ok: true };
}
