import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable } from "@/lib/api-error";
import { CHAT_MESSAGE_MAX } from "@/lib/chat-actions";
import { listRoomMessages } from "@/lib/chat-realtime-store";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";
import { logRouteError } from "@/lib/server-log";

type Props = { params: Promise<{ listingId: string }> };

export async function GET(_req: Request, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    const { listingId } = await params;
    if (!listingId.trim()) {
      return NextResponse.json({ ok: false, error: "invalid_listing_id" }, { status: 400 });
    }
    const userId = session.user.id;

    const listing = await prisma.listing.findFirst({
      where: { id: listingId, ...listingWhereActive() },
      select: { id: true, title: true, userId: true },
    });
    if (!listing) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    if (listing.userId === userId) {
      return NextResponse.json({ ok: false, error: "own_listing" }, { status: 403 });
    }

    const seller = await prisma.user.findUnique({
      where: { id: listing.userId },
      select: { id: true, name: true, email: true },
    });
    if (!seller) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const room = await prisma.chatRoom.upsert({
      where: { listingId_buyerId: { listingId, buyerId: userId } },
      create: { listingId, buyerId: userId },
      update: {},
      include: {
        readStates: { where: { userId: { in: [userId, listing.userId] } } },
      },
    });

    const messages = await listRoomMessages(room.id, 200);

    const readByOther = room.readStates.find((s) => s.userId !== userId);
    const myRead = room.readStates.find((s) => s.userId === userId);

    return NextResponse.json({
      roomId: room.id,
      listing: { id: listing.id, title: listing.title },
      seller: { id: seller.id, name: seller.name ?? seller.email ?? "" },
      meIsBuyer: true,
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
    logRouteError("GET /api/chat/listing/[listingId]", err);
    return jsonServiceUnavailable("Chat listing room is temporarily unavailable.", ApiErrorCode.DATABASE);
  }
}
