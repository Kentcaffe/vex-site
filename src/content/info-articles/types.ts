export type InfoSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type InfoArticle = {
  slug: string;
  category: "ajutor" | "siguranta";
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro?: string;
  sections: InfoSection[];
};
