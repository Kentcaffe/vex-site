import { NextResponse } from "next/server";
import { getCatalogBrandsByCategoryId } from "@/lib/catalog-queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId")?.trim() ?? "";
  if (!categoryId) {
    return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  }
  const brands = await getCatalogBrandsByCategoryId(categoryId);
  return NextResponse.json(
    { brands },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    },
  );
}
