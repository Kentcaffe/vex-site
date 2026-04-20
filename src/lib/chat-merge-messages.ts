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
  return sortChatMessages([...prev, incoming]);
}
