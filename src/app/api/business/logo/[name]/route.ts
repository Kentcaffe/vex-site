import { NextResponse } from "next/server";
import { safeApiRoute } from "@/lib/api-error";
import { getSupabaseServiceClient } from "@/lib/supabase-service-role";
import { logRouteError } from "@/lib/server-log";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function safeName(input: string): string | null {
  const t = input.trim();
  if (!t) return null;
  return /^[a-z0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(t) ? t : null;
}

function contentTypeFor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

export const GET = safeApiRoute("GET /api/business/logo/[name]", async ({ request }, ...args) => {
  const context = args[0] as { params: Promise<{ name: string }> } | undefined;
  if (!context) {
    return NextResponse.json({ ok: false, error: "invalid_context" }, { status: 500 });
  }
  const { name: rawName } = await context.params;
  const name = safeName(rawName);
  if (!name) {
    return NextResponse.json({ ok: false, error: "invalid_image_name" }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "listings";
    const key = `company-logos/${name}`;
    const { data, error } = await supabase.storage.from(bucket).download(key);
    if (!error && data) {
      const ab = await data.arrayBuffer();
      return new NextResponse(ab, {
        status: 200,
        headers: {
          "Content-Type": contentTypeFor(name),
          "Cache-Control": "public, max-age=604800, immutable",
        },
      });
    }
    if (error) {
      logRouteError("GET /api/business/logo/[name] Supabase download", error);
    }
  }

  const localUrl = new URL(`/uploads/company-logos/${name}`, request.url);
  return NextResponse.redirect(localUrl, 307);
});
