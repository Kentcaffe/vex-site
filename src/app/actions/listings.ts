"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { localizedHref } from "@/lib/paths";
import {
  parseDetailsJsonFromForm,
  sanitizeColumnPayload,
} from "@/lib/listing-detail-config";
import {
  listingFormSchema,
  parseListingImageUrlsStrict,
  rawFromFormData,
} from "@/lib/listing-form-schema";
import { asListingCreateInput } from "@/lib/prisma-listing-casts";
import { prisma } from "@/lib/prisma";

export type CreateListingState =
  | { ok: true; listingId: string; details?: string }
  | {
      ok: false;
      error: "unauthorized" | "validation" | "category" | "session" | "server";
      details?: string;
    };

export async function createListing(
  _prev: CreateListingState | undefined,
  formData: FormData,
): Promise<CreateListingState> {
  console.log("[createListing] START");
  console.log(
    "[createListing] formData keys",
    Array.from(formData.keys()),
  );

  console.warn("[createListing] request body", {
    title: String(formData.get("title") ?? ""),
    price: String(formData.get("price") ?? ""),
    category_id: String(formData.get("category_id") ?? formData.get("categoryId") ?? ""),
    images: String(formData.get("images") ?? ""),
  });

  const session = await auth();
  if (!session?.user?.id) {
    console.log("[createListing] ERROR unauthorized: missing session.user.id");
    return { ok: false, error: "unauthorized", details: "Trebuie să fii autentificat pentru a publica." };
  }

  const rawCategoryId = String(formData.get("categoryId") ?? "").trim();
  const rawSubcategoryId = String(formData.get("subcategory_id") ?? "").trim();
  const categorySlugRaw = String(formData.get("categorySlug") ?? "").trim();
  if (!rawCategoryId && !rawSubcategoryId) {
    console.log("[createListing] ERROR category: missing categoryId and subcategory_id");
    return { ok: false, error: "category", details: "Lipsește category_id / subcategory_id." };
  }

  const raw = rawFromFormData(formData);
  console.log("[createListing] parsed raw payload preview", {
    categoryId: raw.categoryId,
    titleLen: String(raw.title ?? "").length,
    descriptionLen: String(raw.description ?? "").length,
    price: raw.price,
    city: raw.city,
    imagesRawLen: String(raw.imagesRaw ?? "").length,
  });
  const parsed = listingFormSchema.safeParse(raw);
  if (!parsed.success) {
    console.log("[createListing] ERROR validation: schema parse failed", parsed.error.issues);
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: "validation",
      details: `Validare eșuată la câmpul "${String(first?.path?.[0] ?? "necunoscut")}".`,
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!dbUser) {
    console.log("[createListing] ERROR session: user not found in DB", session.user.id);
    return { ok: false, error: "session", details: "Sesiune invalidă. Reautentifică-te." };
  }

  const rawImages = parsed.data.imagesRaw ?? null;
  const urls = parseListingImageUrlsStrict(rawImages);
  if (!urls) {
    console.log("[createListing] ERROR validation: images invalid", {
      imagesRawLen: String(rawImages ?? "").length,
    });
    return {
      ok: false,
      error: "validation",
      details: "Imaginile nu sunt valide. Trimite array de URL-uri valide.",
    };
  }

  const submittedCategoryId = parsed.data.categoryId.trim();
  const submittedSubcategoryId = rawSubcategoryId || submittedCategoryId;
  console.log("[createListing] received payload", {
    categoryId: submittedCategoryId,
    subcategory_id: submittedSubcategoryId,
    categorySlug: categorySlugRaw || parsed.data.categorySlug || "",
  });

  let categoryRow = await prisma.category.findUnique({
    where: { id: submittedCategoryId },
    select: { id: true, slug: true },
  });
  if (!categoryRow) {
    const fallbackSlugs = new Set<string>();
    const explicitSlug = (categorySlugRaw || parsed.data.categorySlug || "").trim();
    if (explicitSlug) {
      fallbackSlugs.add(explicitSlug);
    }
    // Accept synthetic fallback ids like "root:transport:transport-autoturisme".
    if (submittedCategoryId.includes(":")) {
      const syntheticTail = submittedCategoryId.split(":").filter(Boolean).at(-1)?.trim() ?? "";
      if (syntheticTail) {
        fallbackSlugs.add(syntheticTail);
      }
    }

    for (const slug of fallbackSlugs) {
      categoryRow = await prisma.category.findUnique({
        where: { slug },
        select: { id: true, slug: true },
      });
      if (categoryRow) {
        console.warn("[createListing] category resolved via slug fallback", {
          submittedCategoryId,
          slug,
          resolvedId: categoryRow.id,
        });
        break;
      }
    }
  }
  if (!categoryRow) {
    console.log("[createListing] ERROR category: category not found", {
      submittedCategoryId,
      submittedSubcategoryId,
      categorySlugRaw,
    });
    return { ok: false, error: "category", details: `Categoria nu există în DB: ${submittedCategoryId}` };
  }

  const childCount = await prisma.category.count({
    where: { parentId: categoryRow.id },
  });
  if (childCount > 0) {
    console.log("[createListing] ERROR category: selected category is not leaf", {
      categoryId: categoryRow.id,
      childCount,
    });
    return { ok: false, error: "category", details: "Categoria selectată nu este subcategorie finală." };
  }

  const slug = categoryRow.slug;
  const cols = sanitizeColumnPayload(slug, {
    brand: parsed.data.brand,
    modelName: parsed.data.modelName,
    year: parsed.data.year,
    mileageKm: parsed.data.mileageKm,
    rooms: parsed.data.rooms,
    areaSqm: parsed.data.areaSqm,
  });

  const detailsObj = parseDetailsJsonFromForm(slug, (name) => formData.get(name));
  const detailsJson = detailsObj;

  let listingId: string;
  try {
    const created = await prisma.listing.create({
      data: asListingCreateInput({
        title: parsed.data.title.trim(),
        description: parsed.data.description.trim(),
        price: parsed.data.price,
        priceCurrency: parsed.data.priceCurrency,
        negotiable: parsed.data.negotiable ?? false,
        city: parsed.data.city.trim(),
        district: parsed.data.district?.trim() || null,
        phone: parsed.data.phone?.trim() || null,
        condition: parsed.data.condition,
        brand: cols.brand,
        modelName: cols.modelName,
        year: cols.year,
        mileageKm: cols.mileageKm,
        rooms: cols.rooms,
        areaSqm: cols.areaSqm,
        detailsJson,
        images: JSON.stringify(urls),
        categoryId: categoryRow.id,
        userId: session.user.id,
      }),
      select: { id: true },
    });
    listingId = created.id;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      console.log("[createListing] ERROR validation: prisma FK P2003");
      return { ok: false, error: "validation", details: "Relație invalidă în baza de date (P2003)." };
    }
    console.error("[createListing]", e);
    return {
      ok: false,
      error: "server",
      details: e instanceof Error ? e.message : "Eroare internă necunoscută la publicare.",
    };
  }

  revalidatePath(localizedHref(parsed.data.locale, "/anunturi"));
  revalidatePath(localizedHref(parsed.data.locale, "/"));
  revalidatePath(localizedHref(parsed.data.locale, `/anunturi/${listingId}`));

  console.log("[createListing] SUCCESS", { listingId });
  return { ok: true, listingId, details: "Anunț publicat cu succes." };
}
