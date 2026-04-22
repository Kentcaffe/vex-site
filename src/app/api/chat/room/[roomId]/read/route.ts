import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable } from "@/lib/api-error";
import { getRoomAccess } from "@/lib/chat-actions";
import { prisma } from "@/lib/prisma";
import { logRouteError } from "@/lib/server-log";

type Props = { params: Promise<{ roomId: string }> };

export async function POST(_req: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    const { roomId } = await params;
    if (!roomId.trim()) {
      return NextResponse.json({ ok: false, error: "invalid_room_id" }, { status: 400 });
    }
    const userId = session.user.id;

    const access = await getRoomAccess(roomId, userId);
    if (!access) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const now = new Date();
    await prisma.chatReadState.upsert({
      where: { roomId_userId: { roomId, userId } },
      create: { roomId, userId, lastReadAt: now },
      update: { lastReadAt: now },
    });

    return NextResponse.json({ ok: true, lastReadAt: now.toISOString() });
  } catch (err) {
    logRouteError("POST /api/chat/room/[roomId]/read", err);
    return jsonServiceUnavailable("Read state service is temporarily unavailable.", ApiErrorCode.DATABASE);
  }
}
