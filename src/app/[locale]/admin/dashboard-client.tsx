"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  CalendarRange,
  Percent,
  Hotel,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  formatCurrency,
  formatLongDate,
  formatNumericDate,
} from "@/lib/formatters";

interface DashboardClientProps {
  analytics: {
    totalRevenue: number;
    activeBookings: number;
    totalVillas: number;
    occupancyRate: number;
    chartData: Array<{ date: string; revenue: number }>;
    selectedMonth: number;
    selectedYear: number;
    availableYears: number[];
  };
}

export function DashboardClient({ analytics }: DashboardClientProps) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const monthOptions = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { month: "long" });

    return Array.from({ length: 12 }, (_, index) => ({
      value: String(index + 1),
      label: formatter.format(new Date(Date.UTC(2026, index, 1))),
    }));
  }, [locale]);

  const periodLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }).format(new Date(Date.UTC(analytics.selectedYear, analytics.selectedMonth - 1, 1))),
    [analytics.selectedMonth, analytics.selectedYear, locale]
  );

  function updateFilters(next: { month?: string; year?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("month", next.month ?? String(analytics.selectedMonth));
    params.set("year", next.year ?? String(analytics.selectedYear));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  const metrics = [
    {
      title: t("totalRevenue"),
      value: formatCurrency(analytics.totalRevenue, locale),
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: t("activeBookings"),
      value: analytics.activeBookings.toString(),
      icon: CalendarRange,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: t("occupancyRate"),
      value: `${analytics.occupancyRate}%`,
      icon: Percent,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: t("totalVillas"),
      value: analytics.totalVillas.toString(),
      icon: Hotel,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${metric.bg}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <CardTitle>{t("revenueChart")}</CardTitle>
            <p className="text-sm text-muted-foreground">{periodLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={String(analytics.selectedMonth)}
              onValueChange={(value) => updateFilters({ month: value })}
            >
              <SelectTrigger className="min-w-32 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(analytics.selectedYear)}
              onValueChange={(value) => updateFilters({ year: value })}
            >
              <SelectTrigger className="min-w-28 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {analytics.availableYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full min-w-0">
            <ResponsiveContainer width="100%" height={350} minWidth={0}>
              <LineChart data={analytics.chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: string) =>
                    formatNumericDate(value, locale)
                  }
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    formatCurrency(value, locale)
                  }
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value), locale),
                    t("revenue"),
                  ]}
                  labelFormatter={(label) => formatLongDate(label as string, locale)}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
