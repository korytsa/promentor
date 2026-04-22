import { useQuery } from "@tanstack/react-query";
import { ApiError, requestWithAutoRefresh } from "@/shared/api/http";

type DashboardMetrics = {
  teams: number;
  mentors: number;
  interns: number;
  boards: number;
};

export function useDashboardMetricsQuery() {
  return useQuery({
    queryKey: ["dashboard", "metrics"] as const,
    staleTime: 60_000,
    queryFn: async (): Promise<DashboardMetrics> => {
      const res = await requestWithAutoRefresh<DashboardMetrics>({
        url: "/dashboard/metrics",
        method: "GET",
      });
      if (res.status < 200 || res.status >= 300) {
        throw new ApiError("Failed to load dashboard metrics", res.status);
      }
      return res.data;
    },
  });
}
