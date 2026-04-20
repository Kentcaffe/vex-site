"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-roles";
import { isMailConfigured, sendTransactionalEmail } from "@/lib/mail";
import { localizedHref } from "@/lib/paths";
import { broadcastUserNotification } from "@/lib/notification-broadcast";
import {
  feedback as feedbackTable,
  feedbackReply as feedbackReplyTable,
  userNotification,
} from "@/lib/prisma-delegates";
import { routing } from "@/i18n/routing";

function htmlFromPlain(body: string): string {
  const safe = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<div style="font-family:system-ui,sans-serif;line-height:1.5">${safe
    .split("\n")
    .map((line) => `<p>${line || "&nbsp;"}</p>`)
    .join("")}</div>`;
}

const REPLY_TITLE = "Răspuns la feedback-ul tău";

export type AdminReplyFeedbackResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "not_found" | "invalid" };

export async function adminReplyToFeedback(feedbackId: string, replyText: string): Promise<AdminReplyFeedbackResult> {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return { ok: false, error: "unauthorized" };
  }

  const text = replyText.trim();
  if (text.length < 1 || text.length > 8000) {
    return { ok: false, error: "invalid" };
  }

  const row = await feedbackTable.findUnique({ where: { id: feedbackId } });
  if (!row) {
    return { ok: false, error: "not_found" };
  }

  const reply = await feedbackReplyTable.create({
    data: {
      feedbackId,
      adminId: session.user.id,
      reply: text,
    },
  });

  if (row.userId) {
    const notif = await userNotification.create({
      data: {
        userId: row.userId,
        kind: "feedback_reply",
        refId: reply.id,
        title: REPLY_TITLE,
        body: text,
      },
    });

    await broadcastUserNotification(row.userId, {
      id: notif.id,
      title: notif.title,
      body: notif.body,
      kind: "feedback_reply",
    });
  } else {
    const guestEmail = row.email?.trim();
    if (guestEmail && isMailConfigured()) {
      await sendTransactionalEmail(guestEmail, REPLY_TITLE, htmlFromPlain(text));
    }
  }

  for (const loc of routing.locales) {
    revalidatePath(localizedHref(loc, "/admin/feedback"));
    revalidatePath(localizedHref(loc, "/cont/notificari"));
    revalidatePath(localizedHref(loc, "/"));
  }

  return { ok: true };
}
