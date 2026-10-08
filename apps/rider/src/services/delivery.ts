// apps/rider/src/services/delivery.ts
import { USE_MOCK_DATA } from "@/config/constants";
import { checkGeofence } from "@/lib/geo";
import { activeDeliverySchema, deliverySchema } from "@/schemas/delivery";
import { api, ApiError } from "@/services/api";
import { mockDelay } from "@/services/mock-data";
import { MOCK_DELIVERY_OTP, mockDb } from "@/services/mock-store";
import { parseResponse } from "@/services/parse";
import type {
  ArrivedPayload,
  ConfirmDeliveryPayload,
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

/** One delivery by id (used by the delivery screens). Finished ones too. */
export async function getDelivery(deliveryId: string): Promise<Delivery> {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    const found =
      mockDb.activeDelivery?.id === deliveryId
        ? mockDb.activeDelivery
        : mockDb.completed.find((item) => item.id === deliveryId);
    if (!found) throw new ApiError("Delivery not found", 404, "client");
    return structuredClone(found);
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

/**
 * "Confirm delivery": the handoff is done.
 * The server also checks the rider is near the customer and the code / photo is right.
 */
export async function confirmDelivery(
  payload: ConfirmDeliveryPayload
): Promise<Delivery> {
  if (USE_MOCK_DATA) {
    await mockDelay(600);

    // Already finished (e.g. a double tap): return it unchanged
    const finished = mockDb.completed.find((item) => item.id === payload.deliveryId);
    if (finished) return structuredClone(finished);

    const current = requireMockDelivery(payload.deliveryId);
    if (current.status !== "to_dropoff") {
      throw new ApiError("Not at the drop-off step", 409, "client");
    }

    // Same rules the real backend must enforce
    if (!checkGeofence(payload.location, current.customer.point).isInside) {
      throw new ApiError("Too far from the customer", 422, "client");
    }
    if (payload.method === "otp" && payload.otp !== MOCK_DELIVERY_OTP) {
      throw new ApiError("Wrong delivery code", 400, "client");
    }
    if (payload.method === "photo" && !payload.photoDataUrl) {
      throw new ApiError("Photo is required", 400, "client");
    }

    const completed: Delivery = {
      ...current,
      status: "completed",
      deliveredAt: payload.confirmedAt,
    };
    mockDb.activeDelivery = null;
    mockDb.completed.unshift(completed);

    // Today's tally goes up
    const today = mockDb.today;
    mockDb.today = {
      ...today,
      deliveriesCompleted: today.deliveriesCompleted + 1,
      deliveryEarnings: today.deliveryEarnings + completed.earning,
      tips: today.tips + completed.tip,
      total: today.total + completed.earning + completed.tip,
    };

    return structuredClone(completed);
  }

  const data = await api.post<unknown>(
    `${deliveryUrl(payload.deliveryId)}/confirm`,
    payload
  );
  return parseResponse(deliverySchema, data);
      }
