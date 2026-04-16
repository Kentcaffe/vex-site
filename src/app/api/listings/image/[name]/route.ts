import { access, readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function safeName(input: string): string | null {
  const t = input.trim();
  if (!t) {
    return null;
  }
  return /^[a-z0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(t) ? t : null;
}

function contentTypeFor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name: rawName } = await context.params;
  const name = safeName(rawName);
  if (!name) {
    return NextResponse.json({ error: "invalid_image_name" }, { status: 400 });
  }

  const candidatePaths = [
    path.join(process.cwd(), "public", "uploads", "listings", name),
    path.join(process.cwd(), "uploads", "listings", name),
  ];

  for (const filePath of candidatePaths) {
    try {
      await access(filePath);
      const buffer = await readFile(filePath);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": contentTypeFor(name),
          "Cache-Control": "public, max-age=604800, immutable",
        },
      });
    } catch {
      // try next candidate path
    }
  }

  return NextResponse.json({ error: "image_not_found" }, { status: 404 });
}
