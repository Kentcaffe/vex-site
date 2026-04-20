import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { CHAT_MESSAGE_MAX, getRoomAccess } from "@/lib/chat-actions";
import { insertRoomMessage } from "@/lib/chat-realtime-store";
import { prisma } from "@/lib/prisma";
import { logRouteError } from "@/lib/server-log";

type Props = { params: Promise<{ roomId: string }> };

export async function POST(req: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { roomId } = await params;
    const userId = session.user.id;

    const access = await getRoomAccess(roomId, userId);
    if (!access) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
    const text = typeof body === "object" && body !== null && "body" in body ? String((body as { body: unknown }).body) : "";
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > CHAT_MESSAGE_MAX) {
      return NextResponse.json({ error: "validation" }, { status: 400 });
    }

    const receiverId = userId === access.buyerId ? access.sellerId : access.buyerId;
    const inserted = await insertRoomMessage({
      roomId,
      senderId: userId,
      receiverId,
      content: trimmed,
    });
    if (!inserted.ok) {
      return NextResponse.json({ error: inserted.error }, { status: 500 });
    }
    const msg = inserted.message;

    try {
      await prisma.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });
    } catch (e) {
      logRouteError("POST /api/chat/room/[roomId]/message chatRoom.updatedAt", e);
    }

    return NextResponse.json({
      message: {
        id: msg.id,
        roomId: msg.roomId ?? roomId,
        senderId: msg.senderId,
        body: msg.content,
        createdAt: msg.createdAt.toISOString(),
      },
    });
  } catch (err) {
    logRouteError("POST /api/chat/room/[roomId]/message", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "service_unavailable", message }, { status: 503 });
  }
}
