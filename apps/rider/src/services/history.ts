// apps/rider/src/services/history.ts
import { USE_MOCK_DATA } from "@/config/constants";
import { deliveryHistorySchema } from "@/schemas/history";
import { api } from "@/services/api";
import { mockDelay } from "@/services/mock-data";
import { dhakaDate, mockDb } from "@/services/mock-store";
import { parseResponse } from "@/services/parse";
import type { DeliveryHistoryEntry, HistoryFilter } from "@/types/delivery";

function daysBetween(earlier: string, later: string): number {
  return (Date.parse(`${later}T00:00:00Z`) - Date.parse(`${earlier}T00:00:00Z`)) / 86_400_000;
}

/**
 * Keeps the entries of the chosen period (calendar days in Dhaka):
 * today = today, week = last 7 days, month = last 30 days, all = everything.
 */
export function filterHistory(
  entries: DeliveryHistoryEntry[],
  filter: HistoryFilter,
  nowMs: number = Date.now()
): DeliveryHistoryEntry[] {
  if (filter === "all") return entries;

  const today = dhakaDate(new Date(nowMs));
  const maxAgeInDays = filter === "today" ? 0 : filter === "week" ? 6 : 29;

  return entries.filter((entry) => {
    const time = Date.parse(entry.finishedAt);
    if (Number.isNaN(time)) return false;
    const age = daysBetween(dhakaDate(new Date(time)), today);
    return age >= 0 && age <= maxAgeInDays;
  });
}

/** Past deliveries, newest first. */
export async function getDeliveryHistory(
  filter: HistoryFilter
): Promise<DeliveryHistoryEntry[]> {
  if (USE_MOCK_DATA) {
    await mockDelay(350);

    // Deliveries finished in this demo session + the older fake ones
    const finishedNow: DeliveryHistoryEntry[] = mockDb.completed.map((delivery) => ({
      id: `h_${delivery.id}`,
      orderCode: delivery.orderCode,
      restaurantName: delivery.restaurant.name,
      area: delivery.restaurant.area,
      status: "completed",
      earning: delivery.earning,
      tip: delivery.tip,
      finishedAt: delivery.deliveredAt ?? new Date().toISOString(),
    }));

    const all = [...finishedNow, ...mockDb.history].sort((a, b) =>
      b.finishedAt.localeCompare(a.finishedAt)
    );
    return structuredClone(filterHistory(all, filter));
  }

  const data = await api.get<unknown>(
    `/deliveries/history?filter=${encodeURIComponent(filter)}`
  );
  return parseResponse(deliveryHistorySchema, data);
                    }
