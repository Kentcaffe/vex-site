import { setRequestLocale } from "next-intl/server";
import { TesterDashboardHome } from "@/components/tester/dashboard/TesterDashboardHome";

type Props = { params: Promise<{ locale: string }> };

export default async function TesterDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TesterDashboardHome />;
}
