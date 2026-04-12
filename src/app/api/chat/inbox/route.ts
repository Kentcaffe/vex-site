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
          user: { select: { name: true, email: true } },
        },
      },
      buyer: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
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
    const last = r.messages[0];
    return {
      roomId: r.id,
      listingId: r.listingId,
      listingTitle: r.listing.title,
      otherUserName: otherName,
      lastMessageBody: last?.body ?? null,
      lastMessageAt: last?.createdAt.toISOString() ?? null,
      lastSenderId: last?.senderId ?? null,
    };
  });

  return NextResponse.json({ rooms: out });
}
