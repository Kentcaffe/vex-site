import { prisma } from "@/lib/prisma";

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
      OR: [{ buyerId: userId }, { listing: { userId } }],
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
  const rooms = await prisma.chatRoom.findMany({
    where: { OR: [{ buyerId: userId }, { listing: { userId } }] },
    select: { id: true },
  });
  let total = 0;
  for (const { id: roomId } of rooms) {
    const rs = await prisma.chatReadState.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    const since = rs?.lastReadAt ?? new Date(0);
    const n = await prisma.chatMessage.count({
      where: {
        roomId,
        senderId: { not: userId },
        createdAt: { gt: since },
      },
    });
    total += n;
  }
  return total;
}
