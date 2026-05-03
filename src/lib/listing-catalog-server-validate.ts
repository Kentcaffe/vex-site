import {
  isBrandAllowedForCategory,
  isModelAllowedForCategoryBrand,
  type ListingCategoryKey,
} from "@/lib/listing-category-config";
import { catalogBrand, catalogModel } from "@/lib/prisma-delegates";

/**
 * Validare marcă/model: dacă există catalog DB pentru categorie, folosește-l
 * (permite și model manual 2–120 caractere dacă nu e în listă).
 */
export async function assertListingBrandModelAllowed(params: {
  categoryId: string;
  categoryConfigKey: ListingCategoryKey | null;
  brand: string | null | undefined;
  modelName: string | null | undefined;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const brandTrim = (params.brand ?? "").trim();
  const modelTrim = (params.modelName ?? "").trim();

  const catalogCount = await catalogBrand.count({ where: { categoryId: params.categoryId } });
  if (catalogCount === 0) {
    if (params.categoryConfigKey && brandTrim && !isBrandAllowedForCategory(params.categoryConfigKey, brandTrim)) {
      return { ok: false, message: "Marca selectată nu aparține categoriei curente." };
    }
    if (
      !isModelAllowedForCategoryBrand(params.categoryConfigKey, brandTrim, modelTrim)
    ) {
      return { ok: false, message: "Modelul selectat nu aparține mărcii curente." };
    }
    return { ok: true };
  }

  if (!brandTrim) {
    return { ok: true };
  }

  const brandRow = await catalogBrand.findFirst({
    where: { categoryId: params.categoryId, name: brandTrim },
  });
  if (!brandRow) {
    return { ok: false, message: "Marca nu se regăsește în catalogul acestei categorii." };
  }

  if (!modelTrim) {
    return { ok: true };
  }

  const inCatalog = await catalogModel.count({
    where: { brandId: brandRow.id, name: modelTrim },
  });
  if (inCatalog > 0) {
    return { ok: true };
  }

  if (modelTrim.length >= 2 && modelTrim.length <= 120) {
    return { ok: true };
  }

  return { ok: false, message: "Modelul trebuie să aibă între 2 și 120 caractere sau să fie din listă." };
}
