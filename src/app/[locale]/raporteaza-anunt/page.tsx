import type { Metadata } from "next";
import {
  createInfoArticlePage,
  type InfoArticleRouteProps,
} from "@/lib/info-article-page";

const route = createInfoArticlePage("raporteaza-anunt");

export async function generateMetadata(props: InfoArticleRouteProps): Promise<Metadata> {
  return route.generateMetadata(props);
}

export default route.Page;
