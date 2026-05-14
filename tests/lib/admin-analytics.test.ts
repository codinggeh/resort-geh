import { describe, expect, it, vi } from "vitest";

import {
  buildAvailableRevenueYears,
  buildRevenueChartData,
  getMonthDateRange,
  normalizeAnalyticsPeriod,
} from "@/lib/admin-analytics";

describe("admin analytics helpers", () => {
  it("normalizes invalid period values to current month and year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-30T10:00:00.000Z"));

    expect(normalizeAnalyticsPeriod({ month: 0, year: 1999 })).toEqual({
      month: 4,
      year: 2026,
    });

    vi.useRealTimers();
  });

  it("returns the correct start, end, and day count for a month", () => {
    expect(getMonthDateRange({ month: 2, year: 2024 })).toEqual({
      startDate: "2024-02-01",
      endDate: "2024-02-29",
      totalDays: 29,
    });
  });

  it("fills missing days with zero revenue for the selected month", () => {
    const chartData = buildRevenueChartData(
      { month: 4, year: 2026 },
      [
        { date: "2026-04-01", total: 1200 },
        { date: "2026-04-15", total: 800 },
        { date: "2026-04-30", total: 3000 },
      ]
    );

    expect(chartData).toHaveLength(30);
    expect(chartData[0]).toEqual({ date: "2026-04-01", revenue: 1200 });
    expect(chartData[1]).toEqual({ date: "2026-04-02", revenue: 0 });
    expect(chartData[14]).toEqual({ date: "2026-04-15", revenue: 800 });
    expect(chartData[29]).toEqual({ date: "2026-04-30", revenue: 3000 });
  });

  it("builds available revenue years as unique descending values", () => {
    expect(buildAvailableRevenueYears([2024, null, 2026, 2025, 2026], 2023)).toEqual([
      2026,
      2025,
      2024,
      2023,
    ]);
  });
});
