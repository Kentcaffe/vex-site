import { setRequestLocale } from "next-intl/server";
import { BusinessLandingSections } from "@/components/business/BusinessLandingSections";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BusinessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BusinessLandingSections />;
}
