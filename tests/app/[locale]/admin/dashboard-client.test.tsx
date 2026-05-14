import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardClient } from "@/app/[locale]/admin/dashboard-client";

const replaceMock = vi.fn();
const refreshMock = vi.fn();
const pathnameMock = "/admin";
const searchParamsState = { value: "month=4&year=2026" };

const translations: Record<string, string> = {
  "admin.totalRevenue": "Total Revenue",
  "admin.activeBookings": "Active Bookings",
  "admin.occupancyRate": "Occupancy Rate",
  "admin.totalVillas": "Total Villas",
  "admin.revenueChart": "Revenue",
  "admin.revenue": "Revenue",
  "admin.month": "Month",
  "admin.year": "Year",
};

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: (namespace: string) => (key: string) => translations[`${namespace}.${key}`] ?? key,
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock,
  }),
  usePathname: () => pathnameMock,
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    toString: () => searchParamsState.value,
  }),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

vi.mock("@/components/ui/select", () => {
  const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  );

  function extractOptions(children: React.ReactNode): React.ReactNode[] {
    return React.Children.toArray(children).flatMap((child) => {
      if (!React.isValidElement(child)) return [];
      if (child.type === SelectItem) {
        return [child];
      }

      return extractOptions(child.props.children);
    });
  }

  return {
    Select: ({
      value,
      onValueChange,
      children,
    }: {
      value: string;
      onValueChange: (value: string) => void;
      children: React.ReactNode;
    }) => (
      <select aria-label="filter-select" value={value} onChange={(event) => onValueChange(event.target.value)}>
        {extractOptions(children)}
      </select>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SelectValue: () => null,
    SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SelectItem,
  };
});

describe("DashboardClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsState.value = "month=4&year=2026";
  });

  afterEach(() => {
    cleanup();
  });

  it("updates month and preserves year in the query string", async () => {
    const user = userEvent.setup();

    render(
      <DashboardClient
        analytics={{
          totalRevenue: 27195,
          activeBookings: 6,
          totalVillas: 6,
          occupancyRate: 0,
          chartData: [{ date: "2026-04-01", revenue: 1200 }],
          selectedMonth: 4,
          selectedYear: 2026,
          availableYears: [2026, 2025],
        }}
      />
    );

    const selects = screen.getAllByLabelText("filter-select");
    await user.selectOptions(selects[0], "5");

    expect(replaceMock).toHaveBeenCalledWith("/admin?month=5&year=2026");
  });

  it("updates year and preserves month in the query string", async () => {
    const user = userEvent.setup();

    render(
      <DashboardClient
        analytics={{
          totalRevenue: 27195,
          activeBookings: 6,
          totalVillas: 6,
          occupancyRate: 0,
          chartData: [{ date: "2026-04-01", revenue: 1200 }],
          selectedMonth: 4,
          selectedYear: 2026,
          availableYears: [2026, 2025],
        }}
      />
    );

    const selects = screen.getAllByLabelText("filter-select");
    await user.selectOptions(selects[1], "2025");

    expect(replaceMock).toHaveBeenCalledWith("/admin?month=4&year=2025");
  });
});
