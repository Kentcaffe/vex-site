import { setRequestLocale } from "next-intl/server";
import { TesterLeaderboardView } from "@/components/tester/dashboard/TesterLeaderboardView";

type Props = { params: Promise<{ locale: string }> };

export default async function TesterLeaderboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TesterLeaderboardView />;
}
