import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";
import { countUnreadRoomMessages } from "@/lib/chat-realtime-store";

export const CHAT_MESSAGE_MAX = 4000;

export type ChatRoomAccess = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
};

export async function getRoomAccess(roomId: string, userId: string): Promise<ChatRoomAccess | null> {
  const room = await prisma.chatRoom.findFirst({
    where: {
      id: roomId,
      AND: [
        { OR: [{ buyerId: userId }, { listing: { userId } }] },
        { listing: listingWhereActive() },
      ],
    },
    include: { listing: { select: { userId: true } } },
  });
  if (!room) {
    return null;
  }
  return {
    id: room.id,
    listingId: room.listingId,
    buyerId: room.buyerId,
    sellerId: room.listing.userId,
  };
}

export async function unreadTotalForUser(userId: string): Promise<number> {
  try {
    const rooms = await prisma.chatRoom.findMany({
      where: {
        AND: [{ OR: [{ buyerId: userId }, { listing: { userId } }] }, { listing: listingWhereActive() }],
      },
      select: { id: true },
    });
    let total = 0;
    for (const { id: roomId } of rooms) {
      const rs = await prisma.chatReadState.findUnique({
        where: { roomId_userId: { roomId, userId } },
      });
      const since = rs?.lastReadAt ?? new Date(0);
      const n = await countUnreadRoomMessages({
        roomId,
        userId,
        since,
      });
      total += n;
    }
    return total;
  } catch (e) {
    console.error("[unreadTotalForUser]", e);
    return 0;
  }
}
