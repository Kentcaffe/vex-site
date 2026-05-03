"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type CatalogOptionRow = { id: string; name: string };

const brandsCache = new Map<string, CatalogOptionRow[]>();
const modelsCache = new Map<string, CatalogOptionRow[]>();

/**
 * Încarcă mărci/modele din API cu cache în memorie pe sesiune (tab).
 */
export function useListingCatalogOptions(categoryId: string | undefined, catalogBrandId: string | undefined) {
  const [brands, setBrands] = useState<CatalogOptionRow[]>([]);
  const [models, setModels] = useState<CatalogOptionRow[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  /** Evită un frame cu mărci statice înainte de răspunsul API pentru categoria curentă. */
  const [brandsResolvedForCategoryId, setBrandsResolvedForCategoryId] = useState<string | null>(null);
  const [modelsResolvedForBrandId, setModelsResolvedForBrandId] = useState<string | null>(null);

  useEffect(() => {
    const cid = categoryId?.trim();
    if (!cid) {
      setBrands([]);
      setBrandsResolvedForCategoryId(null);
      setLoadingBrands(false);
      return;
    }
    const hit = brandsCache.get(cid);
    if (hit) {
      setBrands(hit);
      setBrandsResolvedForCategoryId(cid);
      setLoadingBrands(false);
      return;
    }
    const ac = new AbortController();
    setBrandsResolvedForCategoryId(null);
    setLoadingBrands(true);
    void fetch(`/api/catalog/brands?categoryId=${encodeURIComponent(cid)}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((d: { brands?: CatalogOptionRow[] }) => {
        const list = d.brands ?? [];
        brandsCache.set(cid, list);
        setBrands(list);
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setBrands([]);
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) {
          setLoadingBrands(false);
          setBrandsResolvedForCategoryId(cid);
        }
      });
    return () => ac.abort();
  }, [categoryId]);

  useEffect(() => {
    const bid = catalogBrandId?.trim();
    if (!bid) {
      setModels([]);
      setModelsResolvedForBrandId(null);
      setLoadingModels(false);
      return;
    }
    const hit = modelsCache.get(bid);
    if (hit) {
      setModels(hit);
      setModelsResolvedForBrandId(bid);
      setLoadingModels(false);
      return;
    }
    const ac = new AbortController();
    setModelsResolvedForBrandId(null);
    setLoadingModels(true);
    void fetch(`/api/catalog/models?brandId=${encodeURIComponent(bid)}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((d: { models?: CatalogOptionRow[] }) => {
        const list = d.models ?? [];
        modelsCache.set(bid, list);
        setModels(list);
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setModels([]);
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) {
          setLoadingModels(false);
          setModelsResolvedForBrandId(bid);
        }
      });
    return () => ac.abort();
  }, [catalogBrandId]);

  const useServerCatalog = useMemo(
    () => !loadingBrands && brands.length > 0,
    [brands.length, loadingBrands],
  );

  const cid = categoryId?.trim() ?? "";
  const bid = catalogBrandId?.trim() ?? "";
  const catalogBrandsStale = Boolean(cid) && brandsResolvedForCategoryId !== cid;
  const catalogModelsStale = Boolean(bid) && modelsResolvedForBrandId !== bid;

  return {
    catalogBrands: brands,
    catalogModels: models,
    loadingCatalogBrands: loadingBrands,
    loadingCatalogModels: loadingModels,
    useServerCatalog,
    catalogBrandsStale,
    catalogModelsStale,
  };
}
