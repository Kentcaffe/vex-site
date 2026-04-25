"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

export type UpgradeBusinessState =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "validation" | "unknown" };

const upgradeSchema = z.object({
  locale: z.string().min(2).max(8),
  companyName: z.string().trim().min(2).max(120),
  vatNumber: z.string().trim().min(2).max(64),
  companyAddress: z.string().trim().min(5).max(220),
  phone: z.string().trim().min(5).max(32),
  companyLogo: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || /^\/api\/business\/logo\/[a-z0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(v), "invalid")
    .optional(),
});

function toNull(v: string | undefined): string | null {
  if (!v) return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function upgradeToBusiness(
  _prev: UpgradeBusinessState | undefined,
  formData: FormData,
): Promise<UpgradeBusinessState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = upgradeSchema.safeParse({
    locale: formData.get("locale"),
    companyName: formData.get("company_name"),
    vatNumber: formData.get("vat_number"),
    companyAddress: formData.get("company_address"),
    phone: formData.get("phone"),
    companyLogo: formData.get("company_logo") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id } as Prisma.UserWhereUniqueInput,
      data: {
        accountType: "business",
        companyName: parsed.data.companyName.trim(),
        vatNumber: parsed.data.vatNumber.trim(),
        companyAddress: parsed.data.companyAddress.trim(),
        phone: parsed.data.phone.trim(),
        companyLogo: toNull(parsed.data.companyLogo),
      } as unknown as Prisma.UserUpdateInput,
    });
    revalidatePath(localizedHref(parsed.data.locale, "/cont"));
    revalidatePath(localizedHref(parsed.data.locale, "/anunturi"));
    revalidatePath(localizedHref(parsed.data.locale, "/"));
    revalidatePath(localizedHref(parsed.data.locale, "/upgrade-business"));
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}

export async function setBusinessVerified(userId: string): Promise<{ ok: boolean; error?: "unauthorized" | "not_found" }> {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return { ok: false, error: "unauthorized" };
  }
  const id = userId.trim();
  if (!id) {
    return { ok: false, error: "not_found" };
  }

  const updated = await prisma.user.updateMany({
    where: { id, accountType: "business" } as unknown as Prisma.UserWhereInput,
    data: { isVerified: true } as unknown as Prisma.UserUpdateManyMutationInput,
  });
  if (updated.count === 0) {
    return { ok: false, error: "not_found" };
  }
  return { ok: true };
}
