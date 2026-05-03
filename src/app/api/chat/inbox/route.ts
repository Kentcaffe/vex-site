import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable } from "@/lib/api-error";
import { getLastRoomMessage } from "@/lib/chat-realtime-store";
import { publicDisplayName } from "@/lib/public-privacy";
import { prisma } from "@/lib/prisma";
import { logRouteError } from "@/lib/server-log";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const rooms = await prisma.chatRoom.findMany({
      where: { OR: [{ buyerId: userId }, { listing: { userId } }] },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            userId: true,
            user: { select: { name: true, avatarUrl: true } },
          },
        },
        buyer: { select: { id: true, name: true, avatarUrl: true } },
        readStates: { where: { userId }, select: { lastReadAt: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    const roomIds = rooms.map((r) => r.id);
    const favRows =
      roomIds.length === 0
        ? []
        : await prisma.chatRoomFavorite.findMany({
            where: { userId, roomId: { in: roomIds } },
            select: { roomId: true },
          });
    const favoriteRoomIds = new Set(favRows.map((f) => f.roomId));

    const out = await Promise.all(rooms.map(async (r) => {
      const last = await getLastRoomMessage(r.id);
      const seller = r.listing.user;
      const isBuyer = r.buyerId === userId;
      const otherName = isBuyer
        ? publicDisplayName(seller.name, "Seller")
        : publicDisplayName(r.buyer.name, "Buyer");
      const otherAvatar = isBuyer ? seller.avatarUrl ?? null : r.buyer.avatarUrl ?? null;
      const lastReadAt = r.readStates[0]?.lastReadAt;
      const sentToCurrentUser = last?.receiverId
        ? last.receiverId === userId
        : last?.senderId !== userId;
      const unread = Boolean(
        last &&
          sentToCurrentUser &&
          (!lastReadAt || last.createdAt.getTime() > lastReadAt.getTime()),
      );
      return {
        roomId: r.id,
        listingId: r.listingId,
        listingTitle: r.listing.title,
        otherUserName: otherName,
        otherUserAvatarUrl: otherAvatar,
        lastMessageBody: last?.content ?? null,
        lastMessageAt: last?.createdAt.toISOString() ?? null,
        unread,
        isFavorite: favoriteRoomIds.has(r.id),
      };
    }));

    return NextResponse.json({ rooms: out });
  } catch (err) {
    logRouteError("GET /api/chat/inbox", err);
    return jsonServiceUnavailable("Chat inbox is temporarily unavailable.", ApiErrorCode.DATABASE);
  }
}
