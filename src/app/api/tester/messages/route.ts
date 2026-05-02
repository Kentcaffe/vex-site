import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import { canTesterDeleteChatMessages, normalizeTesterLevel } from "@/lib/tester-level";
import { prisma } from "@/lib/prisma";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Șterge un mesaj din `public.tester_messages` pe conexiunea Prisma (același Postgres ca aplicația).
 * Ocolosește RLS-ul din browser care poate eșua dacă `users.tester_level` nu e sincron cu JWT / politici.
 */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !canAccessTesterDashboard(session.user.role)) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const messageId = url.searchParams.get("messageId")?.trim() ?? "";
  if (!UUID_RE.test(messageId)) {
    return NextResponse.json({ message: "invalid_message_id" }, { status: 400 });
  }

  const levelRows = await prisma.$queryRaw<Array<{ tester_level: string }>>(
    Prisma.sql`SELECT tester_level::text AS tester_level FROM users WHERE id = ${session.user.id} LIMIT 1`,
  );
  const level = normalizeTesterLevel(levelRows[0]?.tester_level);
  if (!canTesterDeleteChatMessages(level, session.user.role)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  try {
    await prisma.$executeRaw(
      Prisma.sql`DELETE FROM public.tester_messages WHERE id = ${messageId}::uuid`,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "delete_failed";
    console.error("[api/tester/messages] DELETE failed", e);
    return NextResponse.json({ message: msg }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
