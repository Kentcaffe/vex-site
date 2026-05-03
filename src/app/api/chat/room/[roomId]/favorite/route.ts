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

    const existing = await prisma.chatRoomFavorite.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    if (existing) {
      await prisma.chatRoomFavorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ ok: true, favorited: false });
    }

    await prisma.chatRoomFavorite.create({
      data: { userId, roomId },
    });
    return NextResponse.json({ ok: true, favorited: true });
  } catch (err) {
    logRouteError("POST /api/chat/room/[roomId]/favorite", err);
    return jsonServiceUnavailable("Could not update favorite.", ApiErrorCode.DATABASE);
  }
}
