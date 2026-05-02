"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { routing } from "@/i18n/routing";
import { normalizeTesterLevel } from "@/lib/tester-level";
import { prisma } from "@/lib/prisma";

export type UpdateTesterLevelState = { ok: boolean; error?: string };

export async function updateUserTesterLevel(
  _prev: UpdateTesterLevelState,
  formData: FormData,
): Promise<UpdateTesterLevelState> {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return { ok: false, error: "forbidden" };
  }

  const userId = String(formData.get("userId") ?? "").trim();
  const rawLevel = String(formData.get("testerLevel") ?? "").trim();
  if (!userId) {
    return { ok: false, error: "missing_user" };
  }

  const testerLevel = normalizeTesterLevel(rawLevel);

  try {
    await prisma.$executeRaw(
      Prisma.sql`UPDATE users SET tester_level = ${testerLevel} WHERE id = ${userId}`,
    );
  } catch {
    return { ok: false, error: "update_failed" };
  }

  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/admin/users"), "page");
  }
  return { ok: true };
}
