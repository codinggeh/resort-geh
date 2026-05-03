export type RevenueChartPoint = {
  date: string;
  revenue: number;
};

export type RevenueDailyTotal = {
  date: string | null;
  total: number | null;
};

export type AnalyticsPeriod = {
  month: number;
  year: number;
};

const SITE_TIME_ZONE = "Asia/Jakarta";

function getCurrentSitePeriod(): AnalyticsPeriod {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "numeric",
  });
  const parts = formatter.formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);

  return { month, year };
}

export function normalizeAnalyticsPeriod(input?: Partial<AnalyticsPeriod>): AnalyticsPeriod {
  const currentPeriod = getCurrentSitePeriod();
  const fallbackMonth = currentPeriod.month;
  const fallbackYear = currentPeriod.year;

  const month =
    typeof input?.month === "number" && Number.isInteger(input.month) && input.month >= 1 && input.month <= 12
      ? input.month
      : fallbackMonth;
  const year =
    typeof input?.year === "number" && Number.isInteger(input.year) && input.year >= 2000 && input.year <= 9999
      ? input.year
      : fallbackYear;

  return { month, year };
}

export function getMonthDateRange(period: AnalyticsPeriod) {
  const start = new Date(Date.UTC(period.year, period.month - 1, 1));
  const end = new Date(Date.UTC(period.year, period.month, 0));

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    totalDays: end.getUTCDate(),
  };
}

export function buildRevenueChartData(
  period: AnalyticsPeriod,
  revenueByDay: RevenueDailyTotal[]
): RevenueChartPoint[] {
  const totalsByDate = new Map<string, number>();

  for (const row of revenueByDay) {
    if (!row.date) continue;
    totalsByDate.set(row.date.slice(0, 10), row.total ?? 0);
  }

  const { totalDays } = getMonthDateRange(period);
  const chartData: RevenueChartPoint[] = [];

  for (let day = 1; day <= totalDays; day += 1) {
    const date = `${period.year}-${String(period.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    chartData.push({
      date,
      revenue: totalsByDate.get(date) ?? 0,
    });
  }

  return chartData;
}

export function buildAvailableRevenueYears(years: Array<number | null | undefined>, selectedYear: number): number[] {
  const values = years
    .filter((year): year is number => typeof year === "number" && Number.isInteger(year))
    .concat(selectedYear);

  return Array.from(new Set(values)).sort((a, b) => b - a);
}
