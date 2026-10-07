// apps/rider/src/services/delivery.ts
import { USE_MOCK_DATA } from "@/config/constants";
import { activeDeliverySchema, deliverySchema } from "@/schemas/delivery";
import { api, ApiError } from "@/services/api";
import { mockDelay } from "@/services/mock-data";
import { mockDb } from "@/services/mock-store";
import { parseResponse } from "@/services/parse";
import type { Delivery } from "@/types/delivery";

/** The delivery the rider is working on right now, or null if there is none. */
export async function getActiveDelivery(): Promise<Delivery | null> {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return structuredClone(mockDb.activeDelivery);
  }

  const data = await api.get<unknown>("/deliveries/active");
  return parseResponse(activeDeliverySchema, data);
}

/** One delivery by id (used by the delivery screens). */
export async function getDelivery(deliveryId: string): Promise<Delivery> {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    const current = mockDb.activeDelivery;
    if (current === null || current.id !== deliveryId) {
      throw new ApiError("Delivery not found", 404, "client");
    }
    return structuredClone(current);
  }

  const data = await api.get<unknown>(
    `/deliveries/${encodeURIComponent(deliveryId)}`
  );
  return parseResponse(deliverySchema, data);
}
