import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Lista de roomId-uri pentru utilizatorul curent — folosită la filtrare Supabase Realtime pe ChatMessage.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ roomIds: [] as string[] }, { status: 200 });
    }
    const userId = session.user.id;
    const rooms = await prisma.chatRoom.findMany({
      where: { OR: [{ buyerId: userId }, { listing: { userId } }] },
      select: { id: true },
      take: 200,
    });
    return NextResponse.json({ roomIds: rooms.map((r) => r.id) }, { status: 200 });
  } catch (e) {
    console.error("[GET /api/chat/room-ids]", e);
    return NextResponse.json({ roomIds: [] as string[] }, { status: 200 });
  }
}
