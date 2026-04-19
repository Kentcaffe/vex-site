import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLastRoomMessage } from "@/lib/chat-realtime-store";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
            user: { select: { name: true, email: true, avatarUrl: true } },
          },
        },
        buyer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        readStates: { where: { userId }, select: { lastReadAt: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    const out = await Promise.all(rooms.map(async (r) => {
      const last = await getLastRoomMessage(r.id);
      const seller = r.listing.user;
      const isBuyer = r.buyerId === userId;
      const otherName = isBuyer
        ? seller.name ?? seller.email ?? "Seller"
        : r.buyer.name ?? r.buyer.email ?? "Buyer";
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
      };
    }));

    return NextResponse.json({ rooms: out });
  } catch (err) {
    console.error("[GET /api/chat/inbox]", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "service_unavailable", message }, { status: 503 });
  }
}
