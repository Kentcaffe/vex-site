/** Markdown minimal pentru imagini în chat: `![alt](url)` — url doar căi interne de încărcare. */

const IMG_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

export function isTrustedChatImageUrl(raw: string): boolean {
  const u = raw.trim();
  return /^\/api\/chat\/image\/[a-z0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(u);
}

export function formatChatImageMarkdown(imageUrl: string, alt = "image"): string {
  return `![${alt.replace(/]/g, "")}](${imageUrl.trim()})`;
}

export function assertMarkdownImagesTrusted(body: string): boolean {
  const re = new RegExp(IMG_RE.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    if (!isTrustedChatImageUrl(m[2] ?? "")) {
      return false;
    }
  }
  return true;
}

export type ChatBodyPart =
  | { type: "text"; text: string }
  | { type: "image"; url: string; alt: string };

export function parseChatBodyToParts(body: string): ChatBodyPart[] {
  const parts: ChatBodyPart[] = [];
  let last = 0;
  for (const m of body.matchAll(new RegExp(IMG_RE.source, "gi"))) {
    const idx = m.index ?? 0;
    if (idx > last) {
      parts.push({ type: "text", text: body.slice(last, idx) });
    }
    const url = (m[2] ?? "").trim();
    const alt = m[1] ?? "";
    if (isTrustedChatImageUrl(url)) {
      parts.push({ type: "image", url, alt: alt || "image" });
    } else {
      parts.push({ type: "text", text: m[0] });
    }
    last = idx + m[0].length;
  }
  if (last < body.length) {
    parts.push({ type: "text", text: body.slice(last) });
  }
  return parts;
}
