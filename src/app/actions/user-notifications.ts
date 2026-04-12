"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { localizedHref } from "@/lib/paths";
import { userNotification } from "@/lib/prisma-delegates";
import { routing } from "@/i18n/routing";

export type NotificationActionResult = { ok: true } | { ok: false; error: "unauthorized" | "not_found" };

export async function markNotificationRead(notificationId: string): Promise<NotificationActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const row = await userNotification.findFirst({
    where: { id: notificationId, userId: session.user.id },
  });
  if (!row) {
    return { ok: false, error: "not_found" };
  }

  await userNotification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/cont/notificari"));
    revalidatePath(localizedHref(locale, "/"));
  }
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<NotificationActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  await userNotification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  for (const locale of routing.locales) {
    revalidatePath(localizedHref(locale, "/cont/notificari"));
    revalidatePath(localizedHref(locale, "/"));
  }
  return { ok: true };
}
