import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getInfoArticle } from "@/content/info-articles/registry";
import { InfoArticleView } from "@/components/info/InfoArticleView";

type PageParams = Promise<{ locale: string }>;

export type InfoArticleRouteProps = { params: PageParams };

export type InfoArticlePageExports = {
  generateMetadata: (props: InfoArticleRouteProps) => Promise<Metadata>;
  Page: (props: InfoArticleRouteProps) => Promise<ReactNode>;
};

export function createInfoArticlePage(slug: string): InfoArticlePageExports {
  async function generateMetadata({ params }: InfoArticleRouteProps): Promise<Metadata> {
    const { locale } = await params;
    const article = getInfoArticle(slug, locale);
    if (!article) return { title: "VEX" };
    return {
      title: `${article.metaTitle} | VEX`,
      description: article.metaDescription,
    };
  }

  async function Page({ params }: InfoArticleRouteProps) {
    const { locale } = await params;
    setRequestLocale(locale);
    const article = getInfoArticle(slug, locale);
    if (!article) notFound();
    return <InfoArticleView article={article} locale={locale} />;
  }

  return { generateMetadata, Page };
}
