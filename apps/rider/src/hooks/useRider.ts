// apps/rider/src/hooks/useRider.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getRider, setAvailability } from "@/services/rider";
import type { AvailabilityStatus } from "@/types/rider";

/** The logged-in rider (name, rank, vehicle, online/offline...). */
export function useRider() {
  return useQuery({
    queryKey: queryKeys.rider,
    queryFn: getRider,
  });
}

/**
 * Go online / offline.
 * Not optimistic on purpose: the screen changes only after the server
 * confirms, so the rider is never shown "Online" when it was not saved.
 */
export function useSetAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: AvailabilityStatus) => setAvailability(status),
    onSuccess: (rider) => {
      queryClient.setQueryData(queryKeys.rider, rider);
      // Going online can bring a new delivery
      void queryClient.invalidateQueries({ queryKey: queryKeys.activeDelivery });
    },
  });
}
