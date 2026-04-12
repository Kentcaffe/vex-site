import type { CatDef } from "./types";
import { casaRoot, joburiRoot, serviciiRoot } from "./casa-servicii";
import { electroniceRoot } from "./electronice";
import { imobiliareRoot } from "./imobiliare";
import {
  agricolRoot,
  animaleRoot,
  businessRoot,
  diverseRoot,
  mamaCopilRoot,
  modaRoot,
  sportRoot,
} from "./rest";
import { transportRoot } from "./transport";

export type { CatDef } from "./types";

/** Toate categoriile principale (afișate în sidebar ca la 999 / OLX). */
export const CATEGORY_ROOTS: CatDef[] = [
  transportRoot,
  imobiliareRoot,
  electroniceRoot,
  casaRoot,
  modaRoot,
  sportRoot,
  animaleRoot,
  agricolRoot,
  businessRoot,
  joburiRoot,
  serviciiRoot,
  mamaCopilRoot,
  diverseRoot,
];
