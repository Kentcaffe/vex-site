import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { CHAT_MESSAGE_MAX, getRoomAccess } from "@/lib/chat-actions";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ roomId: string }> };

export async function POST(req: Request, { params }: Props) {
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

  const msg = await prisma.chatMessage.create({
    data: { roomId, senderId: userId, body: trimmed },
  });
  await prisma.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });

  return NextResponse.json({
    message: {
      id: msg.id,
      roomId: msg.roomId,
      senderId: msg.senderId,
      body: msg.body,
      createdAt: msg.createdAt.toISOString(),
    },
  });
}
