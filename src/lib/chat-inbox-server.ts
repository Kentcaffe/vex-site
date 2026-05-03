import { getLastRoomMessage } from "@/lib/chat-realtime-store";
import { resolvePublicMediaUrl } from "@/lib/media-url";
import { publicDisplayName } from "@/lib/public-privacy";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";

export type ChatInboxServerItem = {
  roomId: string;
  listingTitle: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
  unread: boolean;
  isFavorite: boolean;
};

export async function getChatInboxItemsForUser(userId: string): Promise<ChatInboxServerItem[]> {
  const rooms = await prisma.chatRoom.findMany({
    where: {
      AND: [{ OR: [{ buyerId: userId }, { listing: { userId } }] }, { listing: listingWhereActive() }],
    },
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

  const roomList = Array.isArray(rooms) ? rooms : [];
  const roomIds = roomList.map((r) => r.id);
  const favRows =
    roomIds.length === 0
      ? []
      : await prisma.chatRoomFavorite.findMany({
          where: { userId, roomId: { in: roomIds } },
          select: { roomId: true },
        });
  const favoriteRoomIds = new Set(favRows.map((f) => f.roomId));

  return Promise.all(
    roomList.map(async (r) => {
      let last: Awaited<ReturnType<typeof getLastRoomMessage>> = null;
      try {
        last = await getLastRoomMessage(r.id);
      } catch {
        last = null;
      }
      const seller = r.listing.user;
      const isBuyer = r.buyerId === userId;
      const otherName = isBuyer ? publicDisplayName(seller.name, "Seller") : publicDisplayName(r.buyer.name, "Buyer");
      const otherAvatarRaw = isBuyer ? seller.avatarUrl ?? null : r.buyer.avatarUrl ?? null;
      const lastReadAt = r.readStates[0]?.lastReadAt;
      const unread = Boolean(
        last &&
          last.receiverId === userId &&
          (!lastReadAt || last.createdAt.getTime() > lastReadAt.getTime()),
      );
      return {
        roomId: r.id,
        listingTitle: r.listing.title,
        otherUserName: otherName,
        otherUserAvatarUrl: resolvePublicMediaUrl(otherAvatarRaw),
        lastMessageBody: last?.content ?? null,
        lastMessageAt: last?.createdAt.toISOString() ?? null,
        unread,
        isFavorite: favoriteRoomIds.has(r.id),
      };
    }),
  );
}
