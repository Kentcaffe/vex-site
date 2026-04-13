"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

export type UpdateProfileState =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "validation" | "unknown" };

const profileSchema = z.object({
  locale: z.string().min(2).max(8),
  name: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(32).optional(),
  city: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || /^https?:\/\//i.test(v), "invalid")
    .optional(),
});

function toNull(v: string | undefined): string | null {
  if (!v) return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateProfile(
  _prev: UpdateProfileState | undefined,
  formData: FormData,
): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = profileSchema.safeParse({
    locale: formData.get("locale"),
    name: formData.get("name") || undefined,
    phone: formData.get("phone") || undefined,
    city: formData.get("city") || undefined,
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: toNull(parsed.data.name),
        phone: toNull(parsed.data.phone),
        city: toNull(parsed.data.city),
        bio: toNull(parsed.data.bio),
        avatarUrl: toNull(parsed.data.avatarUrl),
      },
    });
    revalidatePath(localizedHref(parsed.data.locale, "/cont"));
    revalidatePath(localizedHref(parsed.data.locale, "/chat"));
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}
