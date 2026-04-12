import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { CHAT_MESSAGE_MAX, getRoomAccess } from "@/lib/chat-actions";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ roomId: string }> };

export async function GET(_req: Request, { params }: Props) {
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

  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          userId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      buyer: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 200,
        include: { sender: { select: { id: true, name: true, email: true } } },
      },
      readStates: { where: { userId: { in: [access.buyerId, access.sellerId] } } },
    },
  });
  if (!room) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const seller = room.listing.user;
  const readByOther = room.readStates.find((s) => s.userId !== userId);
  const myRead = room.readStates.find((s) => s.userId === userId);
  const isBuyer = userId === room.buyerId;

  return NextResponse.json({
    roomId: room.id,
    listing: { id: room.listing.id, title: room.listing.title },
    seller: { id: seller.id, name: seller.name ?? seller.email ?? "" },
    buyer: { id: room.buyer.id, name: room.buyer.name ?? room.buyer.email ?? "" },
    meIsBuyer: isBuyer,
    otherUserName: isBuyer
      ? seller.name ?? seller.email ?? ""
      : room.buyer.name ?? room.buyer.email ?? "",
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
