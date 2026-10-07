// apps/rider/src/services/rider.ts
import { USE_MOCK_DATA } from "@/config/constants";
import { riderSchema } from "@/schemas/auth";
import { api } from "@/services/api";
import { assignNextMockDelivery, mockDb } from "@/services/mock-store";
import { mockDelay } from "@/services/mock-data";
import { parseResponse } from "@/services/parse";
import type { AvailabilityStatus, Rider } from "@/types/rider";

/** The logged-in rider (name, vehicle, rank, availability...). */
export async function getRider(): Promise<Rider> {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return structuredClone(mockDb.rider);
  }

  const data = await api.get<unknown>("/rider/me");
  return parseResponse(riderSchema, data);
}

/** Go online / offline. Returns the updated rider. */
export async function setAvailability(
  status: AvailabilityStatus
): Promise<Rider> {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    mockDb.rider = { ...mockDb.rider, availability: status };
    // Demo: going online with no task hands the rider a new delivery
    if (status === "online" && mockDb.activeDelivery === null) {
      assignNextMockDelivery();
    }
    return structuredClone(mockDb.rider);
  }

  const data = await api.patch<unknown>("/rider/availability", { status });
  return parseResponse(riderSchema, data);
}
