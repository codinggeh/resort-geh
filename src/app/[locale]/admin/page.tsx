import { getAdminAnalytics } from "@/actions/admin";
import { getTranslations } from "next-intl/server";
import { DashboardClient } from "./dashboard-client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");

  return {
    title: t("dashboard"),
  };
}

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const t = await getTranslations("admin");
  const { month, year } = await searchParams;
  const analytics = await getAdminAnalytics({
    month: month ? Number.parseInt(month, 10) : undefined,
    year: year ? Number.parseInt(year, 10) : undefined,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("dashboardDesc")}
        </p>
      </div>

      <DashboardClient analytics={analytics} />
    </div>
  );
}
