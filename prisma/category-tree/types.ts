export type CatDef = {
  slug: string;
  ro: string;
  ru?: string;
  en?: string;
  children?: CatDef[];
};

/** Creează frunze cu slug-uri unice sub același prefix de secțiune. */
export function leaf(prefix: string, slugPart: string, ro: string, ru?: string, en?: string): CatDef {
  return {
    slug: `${prefix}-${slugPart}`,
    ro,
    ru: ru ?? ro,
    en: en ?? ro,
  };
}

export function section(
  prefix: string,
  slugPart: string,
  ro: string,
  leaves: CatDef[],
  ru?: string,
  en?: string,
): CatDef {
  return {
    slug: `${prefix}-${slugPart}`,
    ro,
    ru: ru ?? ro,
    en: en ?? ro,
    children: leaves,
  };
}
