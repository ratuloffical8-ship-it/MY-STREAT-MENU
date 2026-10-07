// apps/rider/src/lib/query-keys.ts
import type { HistoryFilter } from "@/types/delivery";

/**
 * One place for every React Query key, so a screen that changes data
 * (e.g. confirming a delivery) refreshes exactly the right screens.
 */
export const queryKeys = {
  rider: ["rider"] as const,

  activeDelivery: ["deliveries", "active"] as const,
  delivery: (deliveryId: string) => ["deliveries", deliveryId] as const,
  history: (filter: HistoryFilter) => ["deliveries", "history", filter] as const,

  todaySummary: ["earnings", "today"] as const,
  earningsSummary: ["earnings", "summary"] as const,
  dailyTarget: ["earnings", "daily-target"] as const,
  tips: ["earnings", "tips"] as const,
  cashoutAvailability: ["cashout", "availability"] as const,
  cashoutHistory: ["cashout", "history"] as const,

  rankProgress: ["rewards", "rank"] as const,
  leaderboard: ["rewards", "leaderboard"] as const,
  referral: ["rewards", "referral"] as const,

  notifications: ["notifications"] as const,
  tickets: ["support", "tickets"] as const,
} as const;
