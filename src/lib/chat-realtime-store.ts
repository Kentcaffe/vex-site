import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type RealtimeMessageRow = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  roomId: string | null;
};

export async function listRoomMessages(roomId: string, limit = 200): Promise<RealtimeMessageRow[]> {
  const safeLimit = Math.max(1, Math.min(limit, 500));
  try {
    return await prisma.$queryRaw<RealtimeMessageRow[]>(Prisma.sql`
      SELECT
        id,
        sender_id AS "senderId",
        receiver_id AS "receiverId",
        content,
        created_at AS "createdAt",
        room_id AS "roomId"
      FROM messages
      WHERE room_id = ${roomId}
      ORDER BY created_at ASC
      LIMIT ${safeLimit}
    `);
  } catch (e) {
    console.error("[listRoomMessages]", e);
    return [];
  }
}

export async function getLastRoomMessage(roomId: string): Promise<RealtimeMessageRow | null> {
  try {
    const rows = await prisma.$queryRaw<RealtimeMessageRow[]>(Prisma.sql`
      SELECT
        id,
        sender_id AS "senderId",
        receiver_id AS "receiverId",
        content,
        created_at AS "createdAt",
        room_id AS "roomId"
      FROM messages
      WHERE room_id = ${roomId}
      ORDER BY created_at DESC
      LIMIT 1
    `);
    return rows[0] ?? null;
  } catch (e) {
    console.error("[getLastRoomMessage]", e);
    return null;
  }
}

export type InsertRoomMessageResult =
  | { ok: true; message: RealtimeMessageRow }
  | { ok: false; error: string };

export async function insertRoomMessage(input: {
  roomId: string;
  senderId: string;
  receiverId: string;
  content: string;
}): Promise<InsertRoomMessageResult> {
  try {
    const row = await prisma.message.create({
      data: {
        senderId: input.senderId,
        receiverId: input.receiverId,
        roomId: input.roomId,
        content: input.content,
      },
    });
    return {
      ok: true,
      message: {
        id: row.id,
        senderId: row.senderId,
        receiverId: row.receiverId,
        content: row.content,
        createdAt: row.createdAt,
        roomId: row.roomId,
      },
    };
  } catch (e) {
    console.error("[insertRoomMessage]", e);
    const raw = e instanceof Error ? e.message : String(e);
    const error =
      raw.length > 500 ? `${raw.slice(0, 500)}…` : raw;
    return { ok: false, error };
  }
}

export async function countUnreadRoomMessages(input: {
  roomId: string;
  userId: string;
  since: Date;
}): Promise<number> {
  try {
    const rows = await prisma.$queryRaw<Array<{ count: bigint | number }>>(Prisma.sql`
      SELECT COUNT(*)::bigint AS count
      FROM messages
      WHERE room_id = ${input.roomId}
        AND receiver_id = ${input.userId}
        AND created_at > ${input.since}
    `);
    const raw = rows[0]?.count ?? 0;
    return typeof raw === "bigint" ? Number(raw) : raw;
  } catch (e) {
    console.error("[countUnreadRoomMessages]", e);
    return 0;
  }
}
