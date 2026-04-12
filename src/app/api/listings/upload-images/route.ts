import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

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

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const files = formData.getAll("files").filter((x): x is File => x instanceof File && x.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ urls: [] as string[] });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: "too_many" }, { status: 400 });
  }

  const urls: string[] = [];
  const dir = path.join(process.cwd(), "public", "uploads", "listings");
  await mkdir(dir, { recursive: true });

  for (const file of files) {
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "file_too_large" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "invalid_type" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const ext = extFromMime(file.type);
    const name = `${crypto.randomUUID()}.${ext}`;
    const fp = path.join(dir, name);
    await writeFile(fp, buf);
    urls.push(`/uploads/listings/${name}`);
  }

  return NextResponse.json({ urls });
}
