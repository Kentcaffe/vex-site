import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable, safeApiRoute } from "@/lib/api-error";
import { getSupabaseServiceClient } from "@/lib/supabase-service-role";
import { logRouteError } from "@/lib/server-log";

const MAX_SIZE = 3 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  const p = mime.split("/")[1];
  return p && /^[a-z0-9]+$/i.test(p) ? p : "bin";
}

export const POST = safeApiRoute("POST /api/business/upload-logo", async ({ request }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "missing_file" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: "file_too_large" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 });
  }

  const ext = extFromMime(file.type);
  const name = `${crypto.randomUUID()}.${ext}`;
  const objectKey = `company-logos/${name}`;
  const publicApiPath = `/api/business/logo/${name}`;

  let buf: Buffer;
  try {
    buf = Buffer.from(await file.arrayBuffer());
  } catch (error) {
    logRouteError("POST /api/business/upload-logo file.arrayBuffer", error);
    return NextResponse.json({ ok: false, error: "invalid_file" }, { status: 400 });
  }

  let stored = false;
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "listings";
    const { error } = await supabase.storage.from(bucket).upload(objectKey, buf, {
      contentType: file.type,
      upsert: true,
    });
    if (error) {
      logRouteError("POST /api/business/upload-logo Supabase Storage", error);
    } else {
      stored = true;
    }
  }

  if (!stored) {
    const dir = path.join(process.cwd(), "public", "uploads", "company-logos");
    try {
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, name), buf);
    } catch (error) {
      logRouteError("POST /api/business/upload-logo writeFile", error);
      return jsonServiceUnavailable("Upload storage is temporarily unavailable.", ApiErrorCode.DATABASE);
    }
  }

  return NextResponse.json({ ok: true, url: publicApiPath });
});
