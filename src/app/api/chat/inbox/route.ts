import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      readStates: { where: { userId }, select: { lastReadAt: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const out = rooms.map((r) => {
    const seller = r.listing.user;
    const isBuyer = r.buyerId === userId;
    const otherName = isBuyer
      ? seller.name ?? seller.email ?? "Seller"
      : r.buyer.name ?? r.buyer.email ?? "Buyer";
    const otherAvatar = isBuyer ? seller.avatarUrl ?? null : r.buyer.avatarUrl ?? null;
    const last = r.messages[0];
    const lastReadAt = r.readStates[0]?.lastReadAt;
    const unread =
      Boolean(last?.senderId && last.senderId !== userId) &&
      Boolean(!lastReadAt || last.createdAt.getTime() > lastReadAt.getTime());
    return {
      roomId: r.id,
      listingId: r.listingId,
      listingTitle: r.listing.title,
      otherUserName: otherName,
      otherUserAvatarUrl: otherAvatar,
      lastMessageBody: last?.body ?? null,
      lastMessageAt: last?.createdAt.toISOString() ?? null,
      unread,
    };
  });

  return NextResponse.json({ rooms: out });
}
