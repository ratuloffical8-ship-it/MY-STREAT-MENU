// apps/rider/src/services/delivery.ts
import { USE_MOCK_DATA } from "@/config/constants";
import { activeDeliverySchema, deliverySchema } from "@/schemas/delivery";
import { api, ApiError } from "@/services/api";
import { mockDelay } from "@/services/mock-data";
import { mockDb } from "@/services/mock-store";
import { parseResponse } from "@/services/parse";
import type {
  ArrivedPayload,
  ConfirmPickupPayload,
  Delivery,
  ReportProblemPayload,
} from "@/types/delivery";

function deliveryUrl(deliveryId: string): string {
  return `/deliveries/${encodeURIComponent(deliveryId)}`;
}

/* ------------------------------ Demo helpers ------------------------------ */

/** Demo only: finds the rider's delivery or fails like the real backend (404). */
function requireMockDelivery(deliveryId: string): Delivery {
  const current = mockDb.activeDelivery;
  if (current === null || current.id !== deliveryId) {
    throw new ApiError("Delivery not found", 404, "client");
  }
  return current;
}

/** Demo only: saves the change and returns a copy. */
function saveMockDelivery(updated: Delivery): Delivery {
  mockDb.activeDelivery = updated;
  return structuredClone(updated);
}

/* --------------------------------- Reading -------------------------------- */

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
    return structuredClone(requireMockDelivery(deliveryId));
  }

  const data = await api.get<unknown>(deliveryUrl(deliveryId));
  return parseResponse(deliverySchema, data);
}

/* --------------------------------- Actions -------------------------------- */

/** "View delivery / Start": the rider accepts the task and heads to the restaurant. */
export async function startDelivery(deliveryId: string): Promise<Delivery> {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    const current = requireMockDelivery(deliveryId);
    if (current.status === "to_pickup") return structuredClone(current); // already started
    if (current.status !== "assigned") {
      throw new ApiError("Delivery cannot be started", 409, "client");
    }
    return saveMockDelivery({ ...current, status: "to_pickup" });
  }

  const data = await api.post<unknown>(`${deliveryUrl(deliveryId)}/start`);
  return parseResponse(deliverySchema, data);
}

/** "I've arrived": tells the restaurant (or the customer) the rider is there. */
export async function markArrived(payload: ArrivedPayload): Promise<Delivery> {
  if (USE_MOCK_DATA) {
    await mockDelay(400);
    const current = requireMockDelivery(payload.deliveryId);

    if (payload.at === "restaurant") {
      if (current.status !== "to_pickup") {
        throw new ApiError("Not at the pickup step", 409, "client");
      }
      return saveMockDelivery({
        ...current,
        arrivedAtRestaurantAt: current.arrivedAtRestaurantAt ?? payload.arrivedAt,
      });
    }

    if (current.status !== "to_dropoff") {
      throw new ApiError("Not at the drop-off step", 409, "client");
    }
    return saveMockDelivery({
      ...current,
      arrivedAtCustomerAt: current.arrivedAtCustomerAt ?? payload.arrivedAt,
    });
  }

  const data = await api.post<unknown>(
    `${deliveryUrl(payload.deliveryId)}/arrived`,
    payload
  );
  return parseResponse(deliverySchema, data);
}

/** "Confirm pickup": the rider has the order bag. Moves on to the customer. */
export async function confirmPickup(
  payload: ConfirmPickupPayload
): Promise<Delivery> {
  if (USE_MOCK_DATA) {
    await mockDelay(500);
    const current = requireMockDelivery(payload.deliveryId);
    if (current.status === "to_dropoff") return structuredClone(current); // already done
    if (current.status !== "to_pickup") {
      throw new ApiError("Not at the pickup step", 409, "client");
    }
    return saveMockDelivery({
      ...current,
      status: "to_dropoff",
      pickedUpAt: payload.confirmedAt,
    });
  }

  const data = await api.post<unknown>(
    `${deliveryUrl(payload.deliveryId)}/pickup`,
    payload
  );
  return parseResponse(deliverySchema, data);
}

/** "Report a problem": sends the reason to dispatch. */
export async function reportProblem(
  payload: ReportProblemPayload
): Promise<void> {
  if (USE_MOCK_DATA) {
    await mockDelay(500);
    requireMockDelivery(payload.deliveryId);
    return;
  }

  await api.post<unknown>(`${deliveryUrl(payload.deliveryId)}/problems`, payload);
}
