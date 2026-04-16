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
  | { ok: true; listingId: string }
  | { ok: false; error: "unauthorized" | "validation" | "category" | "session" | "server" };

export async function createListing(
  _prev: CreateListingState | undefined,
  formData: FormData,
): Promise<CreateListingState> {
  console.log("[createListing] START");
  console.log(
    "[createListing] formData keys",
    Array.from(formData.keys()),
  );

  const session = await auth();
  if (!session?.user?.id) {
    console.log("[createListing] ERROR unauthorized: missing session.user.id");
    return { ok: false, error: "unauthorized" };
  }

  const rawCategoryId = String(formData.get("categoryId") ?? "").trim();
  const rawSubcategoryId = String(formData.get("subcategory_id") ?? "").trim();
  const categorySlugRaw = String(formData.get("categorySlug") ?? "").trim();
  if (!rawCategoryId && !rawSubcategoryId) {
    console.log("[createListing] ERROR category: missing categoryId and subcategory_id");
    return { ok: false, error: "category" };
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
    return { ok: false, error: "validation" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!dbUser) {
    console.log("[createListing] ERROR session: user not found in DB", session.user.id);
    return { ok: false, error: "session" };
  }

  const rawImages = parsed.data.imagesRaw ?? null;
  const urls = parseListingImageUrlsStrict(rawImages);
  if (!urls) {
    console.log("[createListing] ERROR validation: images invalid", {
      imagesRawLen: String(rawImages ?? "").length,
    });
    return { ok: false, error: "validation" };
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
    const fallbackSlug = (categorySlugRaw || parsed.data.categorySlug || "").trim();
    if (fallbackSlug) {
      categoryRow = await prisma.category.findUnique({
        where: { slug: fallbackSlug },
        select: { id: true, slug: true },
      });
    }
  }
  if (!categoryRow) {
    console.log("[createListing] ERROR category: category not found", {
      submittedCategoryId,
      submittedSubcategoryId,
      categorySlugRaw,
    });
    return { ok: false, error: "category" };
  }

  const childCount = await prisma.category.count({
    where: { parentId: categoryRow.id },
  });
  if (childCount > 0) {
    console.log("[createListing] ERROR category: selected category is not leaf", {
      categoryId: categoryRow.id,
      childCount,
    });
    return { ok: false, error: "category" };
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
      return { ok: false, error: "validation" };
    }
    console.error("[createListing]", e);
    return { ok: false, error: "server" };
  }

  revalidatePath(localizedHref(parsed.data.locale, "/anunturi"));
  revalidatePath(localizedHref(parsed.data.locale, "/"));
  revalidatePath(localizedHref(parsed.data.locale, `/anunturi/${listingId}`));

  console.log("[createListing] SUCCESS", { listingId });
  return { ok: true, listingId };
}
