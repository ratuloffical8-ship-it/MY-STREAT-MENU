// apps/rider/src/hooks/useHistory.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getDeliveryHistory } from "@/services/history";
import type { HistoryFilter } from "@/types/delivery";

/** Past deliveries for the chosen period. */
export function useDeliveryHistory(filter: HistoryFilter) {
  return useQuery({
    queryKey: queryKeys.history(filter),
    queryFn: () => getDeliveryHistory(filter),
  });
}
