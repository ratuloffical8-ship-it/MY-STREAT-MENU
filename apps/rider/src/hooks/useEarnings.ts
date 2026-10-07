// apps/rider/src/hooks/useEarnings.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getTodaySummary } from "@/services/earnings";

/** Today's finished deliveries and money. */
export function useTodaySummary() {
  return useQuery({
    queryKey: queryKeys.todaySummary,
    queryFn: getTodaySummary,
  });
}
