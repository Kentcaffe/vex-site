"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signOut } from "@/auth";
import { routing } from "@/i18n/routing";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

/** Folosește server action în loc de `signOut` din `next-auth/react` (evită erori CSRF / JSON pe producție). */
export async function logout(formData: FormData) {
  const raw = String(formData.get("locale") ?? routing.defaultLocale);
  const locale = (routing.locales as readonly string[]).includes(raw) ? raw : routing.defaultLocale;
  await signOut({ redirect: false });
  redirect(localizedHref(locale, "/"));
}

export type RegisterState = { ok: true } | { ok: false; error: "validation" | "emailTaken" };

export async function registerUser(
  _prev: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().max(80).optional(),
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name") || undefined,
    });

  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    return { ok: false, error: "emailTaken" };
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash: await hash(parsed.data.password, 12),
      name: parsed.data.name?.trim() || null,
    },
  });

  return { ok: true };
}
