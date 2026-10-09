// apps/rider/src/hooks/useEarnings.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getEarningsSummary, getTodaySummary } from "@/services/earnings";

/** Today's finished deliveries and money. */
export function useTodaySummary() {
  return useQuery({
    queryKey: queryKeys.todaySummary,
    queryFn: getTodaySummary,
  });
}

/** Today + this week, for the Earnings screen. */
export function useEarningsSummary() {
  return useQuery({
    queryKey: queryKeys.earningsSummary,
    queryFn: getEarningsSummary,
  });
}
