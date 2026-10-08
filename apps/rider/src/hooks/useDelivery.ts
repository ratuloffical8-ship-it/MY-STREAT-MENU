// apps/rider/src/hooks/useDelivery.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentPoint } from "@/lib/location";
import { queryKeys } from "@/lib/query-keys";
import {
  confirmDelivery,
  confirmPickup,
  getDelivery,
  markArrived,
  reportProblem,
  startDelivery,
} from "@/services/delivery";
import type {
  Delivery,
  GeoPoint,
  ProblemReason,
  ProblemStage,
  VerificationMethod,
} from "@/types/delivery";

const DELIVERY_POLL_MS = 15_000;

/** One delivery. Checked again every 15 seconds (dispatch may change it). */
export function useDelivery(deliveryId: string) {
  return useQuery({
    queryKey: queryKeys.delivery(deliveryId),
    queryFn: () => getDelivery(deliveryId),
    refetchInterval: DELIVERY_POLL_MS,
  });
}

/** After any action, update every screen that shows this delivery. */
function useSyncDelivery() {
  const queryClient = useQueryClient();
  return (delivery: Delivery) => {
    queryClient.setQueryData(queryKeys.delivery(delivery.id), delivery);
    queryClient.setQueryData(queryKeys.activeDelivery, delivery);
  };
}

/** "View delivery / Start" */
export function useStartDelivery() {
  const sync = useSyncDelivery();
  return useMutation({
    mutationFn: (deliveryId: string) => startDelivery(deliveryId),
    onSuccess: sync,
  });
}

/** "I've arrived" at the restaurant or the customer. */
export function useMarkArrived() {
  const sync = useSyncDelivery();
  return useMutation({
    mutationFn: async (variables: {
      deliveryId: string;
      at: "restaurant" | "customer";
    }) =>
      markArrived({
        deliveryId: variables.deliveryId,
        at: variables.at,
        location: await getCurrentPoint(),
        arrivedAt: new Date().toISOString(),
      }),
    onSuccess: sync,
  });
}

/** "Confirm pickup" */
export function useConfirmPickup() {
  const sync = useSyncDelivery();
  return useMutation({
    mutationFn: async (deliveryId: string) =>
      confirmPickup({
        deliveryId,
        location: await getCurrentPoint(),
        confirmedAt: new Date().toISOString(),
      }),
    onSuccess: sync,
  });
}

/** "Report a problem". Waits only briefly for GPS: a problem can be urgent. */
export function useReportProblem() {
  return useMutation({
    mutationFn: async (variables: {
      deliveryId: string;
      stage: ProblemStage;
      reason: ProblemReason;
    }) =>
      reportProblem({
        ...variables,
        location: await getCurrentPoint(2_000),
        reportedAt: new Date().toISOString(),
      }),
  });
}

/**
 * "Confirm delivery". When it works, every screen that shows money or
 * deliveries is refreshed (Home tally, earnings, history).
 */
export function useConfirmDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      deliveryId: string;
      /** Rider's position; the server checks it is near the customer. */
      location: GeoPoint;
      method: VerificationMethod;
      otp?: string;
      photoDataUrl?: string;
    }) =>
      confirmDelivery({
        ...variables,
        confirmedAt: new Date().toISOString(),
      }),
    onSuccess: (delivery) => {
      queryClient.setQueryData(queryKeys.delivery(delivery.id), delivery);
      queryClient.setQueryData(queryKeys.activeDelivery, null);
      void queryClient.invalidateQueries({ queryKey: ["earnings"] });
      void queryClient.invalidateQueries({ queryKey: ["deliveries", "history"] });
    },
  });
}
