// apps/rider/src/types/earnings.ts
import type { PayoutProvider } from "@/types/rider";

/** All money values are whole taka (৳). Dates are ISO strings. */

export interface DaySummary {
  /** Calendar day, format YYYY-MM-DD. */
  date: string;
  deliveriesCompleted: number;
  deliveryEarnings: number;
  tips: number;
  bonus: number;
  /** deliveryEarnings + tips + bonus */
  total: number;
}

export interface WeekSummary {
  periodStart: string;
  periodEnd: string;
  deliveriesCompleted: number;
  deliveryEarnings: number;
  tips: number;
  bonus: number;
  total: number;
  days: DaySummary[];
}

export interface EarningsSummary {
  today: DaySummary;
  week: WeekSummary;
}

/** "Do 3 more deliveries, get a bonus" progress bar. */
export interface DailyTarget {
  targetDeliveries: number;
  completedDeliveries: number;
  bonusAmount: number;
  reached: boolean;
}

export interface TipEntry {
  id: string;
  deliveryId: string;
  orderCode: string;
  amount: number;
  receivedAt: string;
}

/* --------------------------------- Cashout -------------------------------- */

export type CashoutMethod = PayoutProvider;
export type CashoutStatus = "pending" | "paid" | "failed";

export interface CashoutAvailability {
  /** Balance the rider can withdraw now. */
  availableAmount: number;
  minAmount: number;
  /** true when the 7-day period has ended and cashout is open. */
  isOpen: boolean;
  /** ISO time when cashout opens. null when already open. */
  opensAt: string | null;
}

export interface CashoutPayload {
  method: CashoutMethod;
  accountNumber: string;
  amount: number;
}

export interface CashoutRequest {
  id: string;
  method: CashoutMethod;
  /** Masked number, e.g. 017*****78 */
  accountNumber: string;
  amount: number;
  status: CashoutStatus;
  requestedAt: string;
  }
