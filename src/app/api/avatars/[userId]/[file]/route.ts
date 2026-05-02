import { NextResponse } from "next/server";
import { safeApiRoute } from "@/lib/api-error";
import { getSupabaseServiceClient } from "@/lib/supabase-service-role";
import { logRouteError } from "@/lib/server-log";

const AVATAR_BUCKET = "avatars";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function contentTypeFor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.trim());
}

function isSafeAvatarFileName(name: string): boolean {
  const t = name.trim();
  if (!t || t.length > 240) return false;
  if (t.includes("..") || t.includes("/") || t.includes("\\")) return false;
  return /^[\w.()+\s-]+\.(jpe?g|png|webp|gif)$/i.test(t);
}

export const GET = safeApiRoute(
  "GET /api/avatars/[userId]/[file]",
  async (_ctx, ...args) => {
    const context = args[0] as { params: Promise<{ userId: string; file: string }> } | undefined;
    if (!context) {
      return NextResponse.json({ ok: false, error: "invalid_context" }, { status: 500 });
    }
    const { userId: rawUserId, file: rawFile } = await context.params;
    const userId = rawUserId?.trim() ?? "";
    let file = rawFile?.trim() ?? "";
    try {
      file = decodeURIComponent(file);
    } catch {
      /* param deja decodat */
    }
    if (!isUuid(userId) || !isSafeAvatarFileName(file)) {
      return NextResponse.json({ ok: false, error: "invalid_path" }, { status: 400 });
    }

    const objectPath = `${userId}/${file}`;

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
      if (base) {
        try {
          const origin = new URL(base).origin;
          const pub = `${origin}/storage/v1/object/public/${AVATAR_BUCKET}/${userId}/${encodeURIComponent(file)}`;
          return NextResponse.redirect(pub, 307);
        } catch {
          /* fall through */
        }
      }
      return NextResponse.json({ ok: false, error: "storage_unavailable" }, { status: 503 });
    }

    const { data, error } = await supabase.storage.from(AVATAR_BUCKET).download(objectPath);
    if (!error && data) {
      const ab = await data.arrayBuffer();
      return new NextResponse(ab, {
        status: 200,
        headers: {
          "Content-Type": contentTypeFor(file),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
    if (error) {
      logRouteError("GET /api/avatars/[userId]/[file] Supabase download", error);
    }

    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  },
);
