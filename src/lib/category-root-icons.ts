import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Briefcase,
  Car,
  Cpu,
  Factory,
  Home,
  LayoutGrid,
  PawPrint,
  Shirt,
  Sofa,
  Sprout,
  Trophy,
  Wrench,
} from "lucide-react";

/** Iconuri Lucide consistente pentru categoriile principale (slug DB). */
export const ROOT_CATEGORY_ICONS: Record<string, LucideIcon> = {
  transport: Car,
  imobiliare: Home,
  electronice: Cpu,
  "casa-gradina": Sofa,
  moda: Shirt,
  "sport-hobby": Trophy,
  animale: PawPrint,
  agricol: Sprout,
  business: Factory,
  joburi: Briefcase,
  servicii: Wrench,
  "mama-copil": Baby,
  diverse: LayoutGrid,
};

export function getRootCategoryLucideIcon(slug: string): LucideIcon {
  return ROOT_CATEGORY_ICONS[slug] ?? LayoutGrid;
}
