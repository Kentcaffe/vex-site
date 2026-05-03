import { NextResponse } from "next/server";
import { getCatalogModelsByBrandId } from "@/lib/catalog-queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId")?.trim() ?? "";
  if (!brandId) {
    return NextResponse.json({ error: "brandId is required" }, { status: 400 });
  }
  const models = await getCatalogModelsByBrandId(brandId);
  return NextResponse.json(
    { models },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    },
  );
}
