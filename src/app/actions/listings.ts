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
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }

  const raw = rawFromFormData(formData);
  const parsed = listingFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!dbUser) {
    return { ok: false, error: "session" };
  }

  const rawImages = parsed.data.imagesRaw ?? null;
  const urls = parseListingImageUrlsStrict(rawImages);
  if (!urls) {
    return { ok: false, error: "validation" };
  }

  const categoryRow = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
    select: { id: true, slug: true },
  });
  if (!categoryRow) {
    return { ok: false, error: "category" };
  }

  const childCount = await prisma.category.count({
    where: { parentId: parsed.data.categoryId },
  });
  if (childCount > 0) {
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
        categoryId: parsed.data.categoryId,
        userId: session.user.id,
      }),
      select: { id: true },
    });
    listingId = created.id;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return { ok: false, error: "validation" };
    }
    console.error("[createListing]", e);
    return { ok: false, error: "server" };
  }

  revalidatePath(localizedHref(parsed.data.locale, "/anunturi"));
  revalidatePath(localizedHref(parsed.data.locale, "/"));
  revalidatePath(localizedHref(parsed.data.locale, `/anunturi/${listingId}`));

  return { ok: true, listingId };
}
