// apps/rider/src/schemas/earnings.ts
import { z } from "zod";

export const daySummarySchema = z.object({
  /** Calendar day, format YYYY-MM-DD. */
  date: z.string(),
  deliveriesCompleted: z.number().int().nonnegative(),
  deliveryEarnings: z.number().nonnegative(),
  tips: z.number().nonnegative(),
  bonus: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export const weekSummarySchema = z.object({
  periodStart: z.string(),
  periodEnd: z.string(),
  deliveriesCompleted: z.number().int().nonnegative(),
  deliveryEarnings: z.number().nonnegative(),
  tips: z.number().nonnegative(),
  bonus: z.number().nonnegative(),
  total: z.number().nonnegative(),
  days: z.array(daySummarySchema),
});

export const earningsSummarySchema = z.object({
  today: daySummarySchema,
  week: weekSummarySchema,
});
