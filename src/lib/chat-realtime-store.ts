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
    console.error("[listRoomMessages] messages-table query failed, trying ChatMessage fallback", e);
    try {
      const fallback = await prisma.chatMessage.findMany({
        where: { roomId },
        orderBy: { createdAt: "asc" },
        take: safeLimit,
        select: {
          id: true,
          senderId: true,
          body: true,
          createdAt: true,
          roomId: true,
        },
      });
      return fallback.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: "",
        content: m.body,
        createdAt: m.createdAt,
        roomId: m.roomId,
      }));
    } catch (fallbackErr) {
      console.error("[listRoomMessages] ChatMessage fallback failed", fallbackErr);
      return [];
    }
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
    console.error("[getLastRoomMessage] messages-table query failed, trying ChatMessage fallback", e);
    try {
      const row = await prisma.chatMessage.findFirst({
        where: { roomId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          senderId: true,
          body: true,
          createdAt: true,
          roomId: true,
        },
      });
      if (!row) return null;
      return {
        id: row.id,
        senderId: row.senderId,
        receiverId: "",
        content: row.body,
        createdAt: row.createdAt,
        roomId: row.roomId,
      };
    } catch (fallbackErr) {
      console.error("[getLastRoomMessage] ChatMessage fallback failed", fallbackErr);
      return null;
    }
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
    } catch (primaryErr) {
      console.error("[insertRoomMessage] messages-table write failed, trying ChatMessage fallback", primaryErr);
      const fallback = await prisma.chatMessage.create({
        data: {
          roomId: input.roomId,
          senderId: input.senderId,
          body: input.content,
        },
      });
      return {
        ok: true,
        message: {
          id: fallback.id,
          senderId: fallback.senderId,
          receiverId: input.receiverId,
          content: fallback.body,
          createdAt: fallback.createdAt,
          roomId: fallback.roomId,
        },
      };
    }
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
    console.error("[countUnreadRoomMessages] messages-table query failed, trying ChatMessage fallback", e);
    try {
      return await prisma.chatMessage.count({
        where: {
          roomId: input.roomId,
          senderId: { not: input.userId },
          createdAt: { gt: input.since },
        },
      });
    } catch (fallbackErr) {
      console.error("[countUnreadRoomMessages] ChatMessage fallback failed", fallbackErr);
      return 0;
    }
  }
}
