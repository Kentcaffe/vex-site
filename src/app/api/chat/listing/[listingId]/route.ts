import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { CHAT_MESSAGE_MAX } from "@/lib/chat-actions";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ listingId: string }> };

export async function GET(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { listingId } = await params;
  const userId = session.user.id;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!listing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (listing.userId === userId) {
    return NextResponse.json({ error: "own_listing" }, { status: 403 });
  }

  const room = await prisma.chatRoom.upsert({
    where: { listingId_buyerId: { listingId, buyerId: userId } },
    create: { listingId, buyerId: userId },
    update: {},
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 200,
        include: { sender: { select: { id: true, name: true, email: true } } },
      },
      readStates: { where: { userId: { in: [userId, listing.userId] } } },
    },
  });

  const seller = listing.user;
  const readByOther = room.readStates.find((s) => s.userId !== userId);
  const myRead = room.readStates.find((s) => s.userId === userId);

  return NextResponse.json({
    roomId: room.id,
    listing: { id: listing.id, title: listing.title },
    seller: { id: seller.id, name: seller.name ?? seller.email ?? "" },
    meIsBuyer: true,
    messages: room.messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
    otherLastReadAt: readByOther?.lastReadAt.toISOString() ?? null,
    myLastReadAt: myRead?.lastReadAt.toISOString() ?? null,
    maxBodyLength: CHAT_MESSAGE_MAX,
  });
}
