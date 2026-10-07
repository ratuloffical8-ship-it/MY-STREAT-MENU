// apps/rider/src/hooks/useActiveDelivery.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getActiveDelivery } from "@/services/delivery";

/** How often the app asks "do I have a new delivery?" */
const ACTIVE_DELIVERY_POLL_MS = 15_000;

/**
 * The delivery the rider is working on (null = none).
 * Checked again every 15 seconds so new assignments show up on their own.
 */
export function useActiveDelivery() {
  return useQuery({
    queryKey: queryKeys.activeDelivery,
    queryFn: getActiveDelivery,
    refetchInterval: ACTIVE_DELIVERY_POLL_MS,
  });
}
