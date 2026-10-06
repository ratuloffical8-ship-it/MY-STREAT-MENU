// apps/rider/src/types/rider.ts
import type { GeoPoint } from "@/types/delivery";

export type Language = "bn" | "en";

export type AvailabilityStatus = "online" | "offline";

export type VehicleType = "motorcycle" | "scooter" | "bicycle";

/** Rider ranks: Bronze -> Silver -> Gold. Better rating = more orders. */
export type RiderRank = "bronze" | "silver" | "gold";

/** Mobile wallets used for payout / cashout. */
export type PayoutProvider = "bkash" | "nagad";

export interface Vehicle {
  type: VehicleType;
  plateNumber: string;
}

export interface PayoutAccount {
  provider: PayoutProvider;
  /** Masked number, e.g. 017*****78 */
  maskedNumber: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  language: Language;
  availability: AvailabilityStatus;
  vehicle: Vehicle;
  payoutAccount: PayoutAccount | null;
  rank: RiderRank;
  /** Average customer rating, 0 - 5. */
  rating: number;
  referralCode: string;
}

/* --------------------------------- Auth ----------------------------------- */

export interface RequestOtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface AuthSession {
  token: string;
  rider: Rider;
}

/* --------------------------------- Rewards -------------------------------- */

export interface RankProgress {
  current: RiderRank;
  /** null when the rider is already at the top rank. */
  next: RiderRank | null;
  deliveriesDone: number;
  /** Total deliveries needed for the next rank. null at top rank. */
  deliveriesForNext: number | null;
}

export interface LeaderboardEntry {
  position: number;
  riderId: string;
  name: string;
  deliveries: number;
  isCurrentRider: boolean;
  /** Weekly prize in taka, null if this position wins nothing. */
  prize: number | null;
}

export interface ReferralSummary {
  code: string;
  referredCount: number;
  /** Bonus in taka for each referred rider who completes a first delivery. */
  bonusPerRider: number;
}

/* ----------------------------------- SOS ---------------------------------- */

export interface SosPayload {
  location: GeoPoint | null;
  /** Active delivery, if the rider has one. */
  deliveryId: string | null;
  sentAt: string;
}

/* ---------------------------- Notifications / Support --------------------- */

export type NotificationType = "settlement" | "dispatch" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export type TicketStatus = "open" | "resolved";

export interface SupportTicket {
  id: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
}
