// apps/rider/src/schemas/history.ts
import { z } from "zod";

export const deliveryHistoryEntrySchema = z.object({
  id: z.string(),
  orderCode: z.string(),
  restaurantName: z.string(),
  area: z.string(),
  status: z.enum(["completed", "cancelled"]),
  earning: z.number().nonnegative(),
  tip: z.number().nonnegative(),
  /** ISO time the delivery finished (or was cancelled). */
  finishedAt: z.string(),
});

export const deliveryHistorySchema = z.array(deliveryHistoryEntrySchema);
