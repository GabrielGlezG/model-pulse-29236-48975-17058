import { useQuery } from "@tanstack/react-query";
import { AnalyticsService, PriceDataService } from "@/services/api";

export function useAnalytics(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['analytics', filters],
    queryFn: () => AnalyticsService.getAnalytics(filters)
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: AnalyticsService.getInsights
  });
}

export function useMarketStats() {
  return useQuery({
    queryKey: ['market-stats'],
    queryFn: AnalyticsService.getMarketStats
  });
}

export function useRecentTrends() {
  return useQuery({
    queryKey: ['recent-trends'],
    queryFn: PriceDataService.getRecentTrends
  });
}