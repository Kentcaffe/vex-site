"use server";

import { revalidatePath } from "next/cache";
import { compare, hash } from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth, signOut } from "@/auth";
import { localizedHref } from "@/lib/paths";
import {
  type UserPasswordAndPreferencesRow,
  type UserPreferencesRow,
  userPasswordAndPreferencesSelect,
  userPreferencesOnlySelect,
  userUpdatePasswordAndPreferences,
  userUpdatePreferences,
} from "@/lib/prisma-account-settings";
import { asListingSelect } from "@/lib/prisma-listing-casts";
import { prisma } from "@/lib/prisma";
import {
  mergePreferences,
  parsePreferences,
  pushActivity,
  type UserPrefsShape,
} from "@/lib/user-preferences";

export type ActionResult = { ok: true } | { ok: false; error: string };

const prefsSchema = z.object({
  locale: z.string().min(2).max(8),
  notifyEmail: z.boolean().optional(),
  notifyPush: z.boolean().optional(),
  notifyMessages: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  currency: z.string().min(1).max(8).optional(),
  profileVisibility: z.enum(["everyone", "registered", "minimal"]).optional(),
  showEmailPublic: z.boolean().optional(),
  showPhonePublic: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
});

export async function updateUserPreferences(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const raw = formData.get("payload");
  if (typeof raw !== "string") {
    return { ok: false, error: "validation" };
  }
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return { ok: false, error: "validation" };
  }

  const parsed = prefsSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  const { locale, ...patch } = parsed.data;
  const user = (await prisma.user.findUnique({
    where: { id: session.user.id },
    select: userPreferencesOnlySelect,
  })) as UserPreferencesRow | null;
  if (!user) {
    return { ok: false, error: "unknown" };
  }

  const current = parsePreferences(user.preferences);
  const merged = mergePreferences(current, { ...patch, theme: "light" } as Partial<UserPrefsShape>);
  const withLog = pushActivity(merged, "preferences_updated");
  const json = JSON.parse(JSON.stringify(withLog)) as Prisma.InputJsonValue;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: userUpdatePreferences(json),
    });
    revalidatePath(localizedHref(locale, "/cont"));
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}

export async function changeAccountPassword(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = z
    .object({
      locale: z.string().min(2).max(8),
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8).max(128),
    })
    .safeParse({
      locale: formData.get("locale"),
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
    });

  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  const user = (await prisma.user.findUnique({
    where: { id: session.user.id },
    select: userPasswordAndPreferencesSelect,
  })) as UserPasswordAndPreferencesRow | null;
  if (!user?.passwordHash) {
    return { ok: false, error: "no_password" };
  }

  const ok = await compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return { ok: false, error: "wrong_password" };
  }

  const newHash = await hash(parsed.data.newPassword, 12);
  const prefs = pushActivity(parsePreferences(user.preferences), "password_changed");
  const prefsJson = JSON.parse(JSON.stringify(prefs)) as Prisma.InputJsonValue;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: userUpdatePasswordAndPreferences(newHash, prefsJson),
    });
    revalidatePath(localizedHref(parsed.data.locale, "/cont"));
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}

export async function deleteUserAccount(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = z
    .object({
      locale: z.string().min(2).max(8),
      confirm: z.literal("STERGE"),
    })
    .safeParse({
      locale: formData.get("locale"),
      confirm: formData.get("confirm"),
    });

  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  try {
    await prisma.user.delete({ where: { id: session.user.id } });
    await signOut({ redirect: false });
    revalidatePath(localizedHref(parsed.data.locale, "/cont"));
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}

export async function logAccountActivityEvent(action: string, detail?: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const row = (await prisma.user.findUnique({
    where: { id: session.user.id },
    select: userPreferencesOnlySelect,
  })) as UserPreferencesRow | null;
  if (!row) return;
  const current = parsePreferences(row.preferences);
  const next = pushActivity(current, action, detail);
  const json = JSON.parse(JSON.stringify(next)) as Prisma.InputJsonValue;
  await prisma.user.update({
    where: { id: session.user.id },
    data: userUpdatePreferences(json),
  });
}

export async function exportUserDataAction(): Promise<{ ok: true; json: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      listings: {
        select: asListingSelect({
          id: true,
          title: true,
          createdAt: true,
          city: true,
          price: true,
          priceCurrency: true,
        }),
        take: 2000,
      },
      favorites: {
        take: 2000,
        select: { listingId: true, createdAt: true },
      },
    },
  });
  if (!user) {
    return { ok: false, error: "unknown" };
  }
  const { passwordHash: _passwordHash, ...safe } = user;
  void _passwordHash;
  const payload = {
    exportedAt: new Date().toISOString(),
    gdprNote: "Export generat la cerere (date cont și activitate asociată în aplicație).",
    user: safe,
  };
  return { ok: true, json: JSON.stringify(payload, null, 2) };
}
