// apps/rider/src/services/earnings.ts
import { USE_MOCK_DATA } from "@/config/constants";
import { daySummarySchema, earningsSummarySchema } from "@/schemas/earnings";
import { api } from "@/services/api";
import { mockDelay } from "@/services/mock-data";
import { dhakaDate, mockDb, shiftDate } from "@/services/mock-store";
import { parseResponse } from "@/services/parse";
import type { DaySummary, EarningsSummary, WeekSummary } from "@/types/earnings";

/** Today's finished deliveries and money (the small summary on Home). */
export async function getTodaySummary(): Promise<DaySummary> {
  if (USE_MOCK_DATA) {
    await mockDelay(300);
    return { ...mockDb.today };
  }

  const data = await api.get<unknown>("/earnings/today");
  return parseResponse(daySummarySchema, data);
}

/** Demo only: a day's totals from the fake history. */
function summarizeMockDay(date: string): DaySummary {
  const finished = mockDb.history.filter(
    (entry) =>
      entry.status === "completed" &&
      dhakaDate(new Date(entry.finishedAt)) === date
  );
  const deliveryEarnings = finished.reduce((sum, entry) => sum + entry.earning, 0);
  const tips = finished.reduce((sum, entry) => sum + entry.tip, 0);
  // Demo rule: 10 or more deliveries in a day earns a ৳100 bonus
  const bonus = finished.length >= 10 ? 100 : 0;

  return {
    date,
    deliveriesCompleted: finished.length,
    deliveryEarnings,
    tips,
    bonus,
    total: deliveryEarnings + tips + bonus,
  };
}

/** Today + the last 7 days (newest day first). */
export async function getEarningsSummary(): Promise<EarningsSummary> {
  if (USE_MOCK_DATA) {
    await mockDelay(350);

    const todayDate = mockDb.today.date;
    const days: DaySummary[] = [{ ...mockDb.today }];
    for (let back = 1; back < 7; back += 1) {
      days.push(summarizeMockDay(shiftDate(todayDate, -back)));
    }

    const sum = (pick: (day: DaySummary) => number) =>
      days.reduce((total, day) => total + pick(day), 0);

    const week: WeekSummary = {
      periodStart: days[days.length - 1].date,
      periodEnd: days[0].date,
      deliveriesCompleted: sum((day) => day.deliveriesCompleted),
      deliveryEarnings: sum((day) => day.deliveryEarnings),
      tips: sum((day) => day.tips),
      bonus: sum((day) => day.bonus),
      total: sum((day) => day.total),
      days,
    };

    return { today: { ...mockDb.today }, week };
  }

  const data = await api.get<unknown>("/earnings/summary");
  return parseResponse(earningsSummarySchema, data);
}
