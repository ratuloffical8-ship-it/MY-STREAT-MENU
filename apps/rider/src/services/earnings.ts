// apps/rider/src/services/earnings.ts
import { USE_MOCK_DATA } from "@/config/constants";
import { daySummarySchema } from "@/schemas/earnings";
import { api } from "@/services/api";
import { mockDelay } from "@/services/mock-data";
import { mockDb } from "@/services/mock-store";
import { parseResponse } from "@/services/parse";
import type { DaySummary } from "@/types/earnings";

/** Today's finished deliveries and money (the small summary on Home). */
export async function getTodaySummary(): Promise<DaySummary> {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return { ...mockDb.today };
  }

  const data = await api.get<unknown>("/earnings/today");
  return parseResponse(daySummarySchema, data);
}
