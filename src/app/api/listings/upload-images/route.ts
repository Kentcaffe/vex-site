import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ApiErrorCode, jsonServiceUnavailable, safeApiRoute } from "@/lib/api-error";
import { getSupabaseServiceClient, listingsObjectKey, listingsStorageBucket } from "@/lib/supabase-service-role";
import { logRouteError } from "@/lib/server-log";

const MAX_FILES = 8;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") {
    return "jpg";
  }
  const p = mime.split("/")[1];
  return p && /^[a-z0-9]+$/i.test(p) ? p : "bin";
}

export const POST = safeApiRoute("POST /api/listings/upload-images", async ({ request }) => {
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

  const files = formData.getAll("files").filter((x): x is File => x instanceof File && x.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ urls: [] as string[] });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ ok: false, error: "too_many" }, { status: 400 });
  }

  const urls: string[] = [];
  const dir = path.join(process.cwd(), "public", "uploads", "listings");
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    logRouteError("POST /api/listings/upload-images mkdir", error);
    return jsonServiceUnavailable("Upload storage is temporarily unavailable.", ApiErrorCode.DATABASE);
  }

  for (const file of files) {
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, error: "file_too_large" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 });
    }

    let buf: Buffer;
    try {
      buf = Buffer.from(await file.arrayBuffer());
    } catch (error) {
      logRouteError("POST /api/listings/upload-images file.arrayBuffer", error);
      return NextResponse.json({ ok: false, error: "invalid_file" }, { status: 400 });
    }
    const ext = extFromMime(file.type);
    const name = `${crypto.randomUUID()}.${ext}`;
    const supabase = getSupabaseServiceClient();
    const bucket = listingsStorageBucket();
    const objectKey = listingsObjectKey(name);

    let stored = false;
    if (supabase) {
      const { error } = await supabase.storage.from(bucket).upload(objectKey, buf, {
        contentType: file.type,
        upsert: true,
      });
      if (error) {
        logRouteError("POST /api/listings/upload-images Supabase Storage", error);
      } else {
        stored = true;
      }
    }

    if (!stored) {
      const fp = path.join(dir, name);
      try {
        await writeFile(fp, buf);
      } catch (error) {
        logRouteError("POST /api/listings/upload-images writeFile", error);
        return jsonServiceUnavailable("Upload storage is temporarily unavailable.", ApiErrorCode.DATABASE);
      }
    }

    urls.push(`/api/listings/image/${name}`);
  }

  return NextResponse.json({ urls });
});
