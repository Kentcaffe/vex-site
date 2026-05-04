import { setRequestLocale } from "next-intl/server";
import { TesterRewardsView } from "@/components/tester/dashboard/TesterRewardsView";

type Props = { params: Promise<{ locale: string }> };

export default async function TesterRewardsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TesterRewardsView />;
}
