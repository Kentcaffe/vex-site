import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable } from "@/lib/api-error";
import { CHAT_MESSAGE_MAX, getRoomAccess } from "@/lib/chat-actions";
import { listRoomMessages } from "@/lib/chat-realtime-store";
import { publicDisplayName } from "@/lib/public-privacy";
import { prisma } from "@/lib/prisma";
import { logRouteError } from "@/lib/server-log";

type Props = { params: Promise<{ roomId: string }> };

export async function GET(_req: Request, { params }: Props) {
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

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            userId: true,
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        buyer: { select: { id: true, name: true, avatarUrl: true } },
        readStates: { where: { userId: { in: [access.buyerId, access.sellerId] } } },
      },
    });
    if (!room) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const messages = await listRoomMessages(room.id, 200);

    const seller = room.listing.user;
    const readByOther = room.readStates.find((s) => s.userId !== userId);
    const myRead = room.readStates.find((s) => s.userId === userId);
    const isBuyer = userId === room.buyerId;

    return NextResponse.json({
      roomId: room.id,
      listing: { id: room.listing.id, title: room.listing.title },
      seller: { id: seller.id, name: publicDisplayName(seller.name, "Seller"), avatarUrl: seller.avatarUrl ?? null },
      buyer: {
        id: room.buyer.id,
        name: publicDisplayName(room.buyer.name, "Buyer"),
        avatarUrl: room.buyer.avatarUrl ?? null,
      },
      meIsBuyer: isBuyer,
      otherUserName: isBuyer
        ? publicDisplayName(seller.name, "Seller")
        : publicDisplayName(room.buyer.name, "Buyer"),
      otherUserAvatarUrl: isBuyer ? seller.avatarUrl ?? null : room.buyer.avatarUrl ?? null,
      myAvatarUrl: me?.avatarUrl ?? null,
      messages: messages.map((m: { id: string; senderId: string; content: string; createdAt: Date }) => ({
        id: m.id,
        senderId: m.senderId,
        body: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
      otherLastReadAt: readByOther?.lastReadAt.toISOString() ?? null,
      myLastReadAt: myRead?.lastReadAt.toISOString() ?? null,
      maxBodyLength: CHAT_MESSAGE_MAX,
    });
  } catch (err) {
    logRouteError("GET /api/chat/room/[roomId]", err);
    return jsonServiceUnavailable("Chat room is temporarily unavailable.", ApiErrorCode.DATABASE);
  }
}
