/**
 * Normalizare payload-uri Supabase Realtime pentru mesaje marketplace.
 * Tabel `messages`: snake_case; `ChatMessage`: camelCase (Prisma).
 */

export type NormalizedChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Validează că mesajul aparține camerei așteptate (apărare în plus față de filter). */
export function normalizeRealtimeInsert(
  raw: unknown,
  source: "messages" | "ChatMessage",
  expectedRoomId: string,
): NormalizedChatMessage | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const row = raw as Record<string, unknown>;

  if (source === "messages") {
    const roomId = str(row.room_id ?? row.roomId);
    if (roomId !== expectedRoomId) {
      return null;
    }
    const id = str(row.id);
    const senderId = str(row.sender_id ?? row.senderId);
    const body = str(row.content ?? row.body);
    const createdAt = str(row.created_at ?? row.createdAt);
    if (!id || !senderId) {
      return null;
    }
    return {
      id,
      roomId,
      senderId,
      body,
      createdAt: createdAt || new Date().toISOString(),
    };
  }

  const roomId = str(row.roomId ?? row.room_id);
  if (roomId !== expectedRoomId) {
    return null;
  }
  const id = str(row.id);
  const senderId = str(row.senderId ?? row.sender_id);
  const body = str(row.body ?? row.content);
  const createdAt = str(row.createdAt ?? row.created_at);
  if (!id || !senderId) {
    return null;
  }
  return {
    id,
    roomId,
    senderId,
    body,
    createdAt: createdAt || new Date().toISOString(),
  };
}
