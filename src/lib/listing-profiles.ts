/**
 * Clasificare categorii (slug-uri din seed) pentru formularul de anunț și detalii JSON.
 */

const TRANSPORT_VEHICLE_LEAF =
  /^(auto|moto|transport-(autoturisme|microbuze|camioane|autobuze|motociclete|atv|barci|tehnica-agricola|tehnica-speciala|remorci|constructii-mech|epoca|electrice))$/;

/** Vehicule cu marcă, model, an, km + detalii tehnice (nu piese, accesorii, scule, servicii, cosmetice). */
export function isVehicleWithOdometer(slug: string): boolean {
  return TRANSPORT_VEHICLE_LEAF.test(slug);
}

/** Marcă / model fără blocul an/km (piese, multe electronice, modă). */
export function isBrandModelOnlySlug(slug: string): boolean {
  if (isVehicleWithOdometer(slug) || isRealEstateSlug(slug)) {
    return false;
  }
  if (/transport-(piese|accesorii|scule)-/.test(slug)) {
    return true;
  }
  if (/^electronice-/.test(slug)) {
    return true;
  }
  if (/^moda-/.test(slug)) {
    return true;
  }
  return ["piese-auto", "telefoane", "laptop", "haine"].includes(slug);
}

export function isRealEstateSlug(slug: string): boolean {
  if (slug === "apartamente" || slug === "case") {
    return true;
  }
  if (!slug.startsWith("imobiliare-")) {
    return false;
  }
  return !slug.includes("servicii-imob");
}

export function isMotoLikeSlug(slug: string): boolean {
  return slug === "moto" || /motociclete|atv/.test(slug);
}

export function isPhoneTabletSlug(slug: string): boolean {
  return (
    slug === "telefoane" ||
    /electronice-(smartphone|telefoane-clasice|tablete|smartwatch)/.test(slug)
  );
}

export function isLaptopPcSlug(slug: string): boolean {
  return (
    slug === "laptop" ||
    /electronice-(laptop|pc-birou|monitor|componente|periferice|retea|imprimante)/.test(slug)
  );
}

/** Telefoane / laptopuri / PC — marcă și model în coloane + detalii dinamice comune. */
export function isElectronicsBrandSlug(slug: string): boolean {
  return isPhoneTabletSlug(slug) || isLaptopPcSlug(slug);
}

export function isServiceJobLeafSlug(slug: string): boolean {
  return slug === "reparatii-auto" || /^servicii-/.test(slug);
}

export function isJobSlug(slug: string): boolean {
  return /^joburi-/.test(slug);
}

export function isFashionSlug(slug: string): boolean {
  return /^moda-/.test(slug) || slug === "haine";
}

export function isAnimalSlug(slug: string): boolean {
  return /^animale-/.test(slug);
}
