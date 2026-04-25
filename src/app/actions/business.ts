"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

export type ApplyBusinessState =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "validation" | "unknown" };

/** Backward-compatible alias for older UI imports. */
export type UpgradeBusinessState = ApplyBusinessState;

const companyTypeValues = ["SRL", "SA", "II", "PFA", "GOSPODARIE", "ALTELE"] as const;

const applySchema = z.object({
  locale: z.string().min(2).max(8),
  companyName: z.string().trim().min(2).max(120),
  companyType: z.enum(companyTypeValues),
  idno: z
    .string()
    .trim()
    .regex(/^\d{13}$/),
  vatNumber: z.string().trim().max(64).optional(),
  administratorName: z.string().trim().min(2).max(120),
  companyAddress: z.string().trim().min(5).max(220),
  companyCity: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(5).max(32),
  companyEmail: z.string().trim().email().max(160),
  registrationNumber: z.string().trim().min(2).max(64),
  registrationDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  companyLogo: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || /^\/api\/business\/logo\/[a-z0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(v), "invalid")
    .optional(),
  companyDocument: z
    .string()
    .trim()
    .max(500)
    .refine((v) => /^\/api\/business\/document\/[a-z0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(v), "invalid"),
});

function toNull(v: string | undefined): string | null {
  if (!v) return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type BusinessApplicationRow = {
  id: string;
  user_id: string;
  status: string;
};

export async function applyForBusiness(
  _prev: ApplyBusinessState | undefined,
  formData: FormData,
): Promise<ApplyBusinessState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = applySchema.safeParse({
    locale: formData.get("locale"),
    companyName: formData.get("company_name"),
    companyType: formData.get("company_type"),
    idno: formData.get("idno"),
    vatNumber: formData.get("vat_number"),
    administratorName: formData.get("administrator_name"),
    companyAddress: formData.get("company_address"),
    companyCity: formData.get("company_city"),
    phone: formData.get("phone"),
    companyEmail: formData.get("company_email"),
    registrationNumber: formData.get("registration_number"),
    registrationDate: formData.get("registration_date"),
    companyLogo: formData.get("company_logo") || undefined,
    companyDocument: formData.get("company_document"),
  });

  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id } as Prisma.UserWhereUniqueInput,
        data: {
          accountType: "user",
          businessStatus: "pending",
          companyName: parsed.data.companyName.trim(),
          companyType: parsed.data.companyType,
          idno: parsed.data.idno,
          vatNumber: toNull(parsed.data.vatNumber),
          administratorName: parsed.data.administratorName.trim(),
          companyAddress: parsed.data.companyAddress.trim(),
          companyCity: parsed.data.companyCity.trim(),
          phone: parsed.data.phone.trim(),
          companyEmail: parsed.data.companyEmail.trim(),
          registrationNumber: parsed.data.registrationNumber.trim(),
          registrationDate: new Date(`${parsed.data.registrationDate}T00:00:00.000Z`),
          isVerified: false,
          companyLogo: toNull(parsed.data.companyLogo),
          companyDocument: parsed.data.companyDocument.trim(),
        } as unknown as Prisma.UserUpdateInput,
      });
      await tx.$executeRaw`
        INSERT INTO "business_applications" (
          "id", "user_id", "status", "company_name", "company_type", "idno", "vat_number",
          "administrator_name", "company_address", "company_city", "phone", "company_email",
          "company_logo", "company_document", "registration_number", "registration_date",
          "created_at", "updated_at"
        ) VALUES (
          ${crypto.randomUUID()},
          ${session.user.id},
          'pending',
          ${parsed.data.companyName.trim()},
          ${parsed.data.companyType},
          ${parsed.data.idno},
          ${toNull(parsed.data.vatNumber)},
          ${parsed.data.administratorName.trim()},
          ${parsed.data.companyAddress.trim()},
          ${parsed.data.companyCity.trim()},
          ${parsed.data.phone.trim()},
          ${parsed.data.companyEmail.trim()},
          ${toNull(parsed.data.companyLogo)},
          ${parsed.data.companyDocument.trim()},
          ${parsed.data.registrationNumber.trim()},
          ${new Date(`${parsed.data.registrationDate}T00:00:00.000Z`)},
          now(),
          now()
        )
      `;
    });
    revalidatePath(localizedHref(parsed.data.locale, "/cont"));
    revalidatePath(localizedHref(parsed.data.locale, "/anunturi"));
    revalidatePath(localizedHref(parsed.data.locale, "/"));
    revalidatePath(localizedHref(parsed.data.locale, "/apply-business"));
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}

/** Backward-compatible alias for older UI imports. */
export async function upgradeToBusiness(
  prev: UpgradeBusinessState | undefined,
  formData: FormData,
): Promise<UpgradeBusinessState> {
  return applyForBusiness(prev, formData);
}

export async function approveBusinessApplication(
  applicationId: string,
): Promise<{ ok: boolean; error?: "unauthorized" | "not_found" }> {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return { ok: false, error: "unauthorized" };
  }
  const id = applicationId.trim();
  if (!id) {
    return { ok: false, error: "not_found" };
  }

  const appRows = await prisma.$queryRaw<BusinessApplicationRow[]>`
    SELECT "id", "user_id", "status"
    FROM "business_applications"
    WHERE "id" = ${id}
    LIMIT 1
  `;
  const app = appRows[0];
  if (!app || app.status !== "pending") {
    return { ok: false, error: "not_found" };
  }
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "business_applications"
      SET "status" = 'approved', "reviewed_at" = now(), "reviewed_by" = ${session.user.id}, "updated_at" = now()
      WHERE "id" = ${id}
    `;
    await tx.user.update({
      where: { id: app.user_id } as Prisma.UserWhereUniqueInput,
      data: {
        accountType: "business",
        businessStatus: "approved",
        isVerified: true,
      } as unknown as Prisma.UserUpdateInput,
    });
  });
  return { ok: true };
}

export async function rejectBusinessApplication(
  applicationId: string,
): Promise<{ ok: boolean; error?: "unauthorized" | "not_found" }> {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return { ok: false, error: "unauthorized" };
  }
  const id = applicationId.trim();
  if (!id) {
    return { ok: false, error: "not_found" };
  }

  const appRows = await prisma.$queryRaw<BusinessApplicationRow[]>`
    SELECT "id", "user_id", "status"
    FROM "business_applications"
    WHERE "id" = ${id}
    LIMIT 1
  `;
  const app = appRows[0];
  if (!app || app.status !== "pending") {
    return { ok: false, error: "not_found" };
  }
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "business_applications"
      SET "status" = 'rejected', "reviewed_at" = now(), "reviewed_by" = ${session.user.id}, "updated_at" = now()
      WHERE "id" = ${id}
    `;
    await tx.user.update({
      where: { id: app.user_id } as Prisma.UserWhereUniqueInput,
      data: {
        accountType: "user",
        businessStatus: "rejected",
        isVerified: false,
      } as unknown as Prisma.UserUpdateInput,
    });
  });
  return { ok: true };
}
