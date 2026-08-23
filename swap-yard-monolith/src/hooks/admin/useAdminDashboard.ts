"use client";

import { useCallback, useEffect, useState } from "react";

export interface DashboardMetric {
  key: string;
  title: string;
  value: number;
  isCurrency?: boolean;
  change: string;
  isUp: boolean;
  sub: string;
}

export interface ChartPoint {
  name: string;
  users: number;
  orders: number;
}

export interface CategoryDatum {
  name: string;
  value: number;
}

export interface PieDatum {
  name: string;
  value: number;
  color: string;
}

export interface TopSeller {
  name: string;
  listingCount: number;
}

export interface ActivityItem {
  type: "user" | "listing" | "order" | "report";
  label: string;
  desc: string;
  createdAt: string;
}

interface DashboardData {
  metrics: DashboardMetric[];
  chartData: ChartPoint[];
  categoryData: CategoryDatum[];
  pieData: PieDatum[];
  topSellers: TopSeller[];
  activity: ActivityItem[];
}

export function useAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message ?? "Failed to load dashboard stats");
      }

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    state: {
      metrics: data?.metrics ?? [],
      chartData: data?.chartData ?? [],
      categoryData: data?.categoryData ?? [],
      pieData: data?.pieData ?? [],
      topSellers: data?.topSellers ?? [],
      activity: data?.activity ?? [],
      isLoading,
      error,
    },
    handlers: { refetch: fetchStats },
  };
}