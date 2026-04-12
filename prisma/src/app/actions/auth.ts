"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type RegisterState =
  | { ok: true }
  | { ok: false; error: "validation" | "emailTaken" };

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

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { ok: false, error: "emailTaken" };
  }

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: await hash(parsed.data.password, 12),
      name: parsed.data.name?.trim() || null,
    },
  });

  return { ok: true };
}
