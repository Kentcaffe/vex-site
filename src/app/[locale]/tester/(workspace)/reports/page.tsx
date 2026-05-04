import { setRequestLocale } from "next-intl/server";
import { TesterReportsView } from "@/components/tester/dashboard/TesterReportsView";

type Props = { params: Promise<{ locale: string }> };

export default async function TesterReportsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TesterReportsView />;
}
