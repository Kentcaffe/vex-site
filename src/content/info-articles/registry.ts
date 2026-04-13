import type { InfoArticle } from "./types";
import { ARTICLES_RO } from "./articles-ro";
import { ARTICLES_EN } from "./articlesEn";
import { ARTICLES_RU } from "./articlesRu";

const byLocale: Record<string, Record<string, InfoArticle>> = {
  ro: ARTICLES_RO,
  en: ARTICLES_EN,
  ru: ARTICLES_RU,
};

export function getInfoArticle(slug: string, locale: string): InfoArticle | undefined {
  const map = byLocale[locale] ?? byLocale.ro;
  return map[slug] ?? byLocale.ro[slug];
}

export const INFO_ARTICLE_SLUGS = Object.keys(ARTICLES_RO);
