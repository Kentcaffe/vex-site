export type ChatMessageRow = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export function sortChatMessages(rows: ChatMessageRow[]): ChatMessageRow[] {
  return [...rows].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function upsertChatMessagesSorted(prev: ChatMessageRow[], incoming: ChatMessageRow): ChatMessageRow[] {
  if (prev.some((m) => m.id === incoming.id)) {
    return prev;
  }
  const incomingTs = new Date(incoming.createdAt).getTime();
  const hasLikelyDuplicate =
    Number.isFinite(incomingTs) &&
    prev.some((m) => {
      if (m.senderId !== incoming.senderId) {
        return false;
      }
      if (m.body.trim() !== incoming.body.trim()) {
        return false;
      }
      const ts = new Date(m.createdAt).getTime();
      return Number.isFinite(ts) && Math.abs(ts - incomingTs) <= 1500;
    });
  if (hasLikelyDuplicate) {
    return prev;
  }
  return sortChatMessages([...prev, incoming]);
}
