// apps/rider/src/types/delivery.ts

/** A point on the map (WGS84). */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Where a delivery is in the rider's flow. */
export type DeliveryStatus =
  | "assigned" // new assignment, rider has not started yet
  | "to_pickup" // going to the restaurant
  | "to_dropoff" // order collected, going to the customer
  | "completed"
  | "cancelled";

/** The 3 steps shown in the progress tracker: Pickup -> Drop-off -> Complete */
export const DELIVERY_STEPS = ["pickup", "dropoff", "complete"] as const;
export type DeliveryStep = (typeof DELIVERY_STEPS)[number];

/** How the customer handoff is confirmed. */
export type VerificationMethod =
  | "tap" // simple tap (GPS + time + rider ID recorded)
  | "otp" // customer gives a 4-digit code
  | "photo"; // doorstep photo (contactless delivery only)

export interface RestaurantStop {
  name: string;
  address: string;
  area: string;
  point: GeoPoint;
  pickupInstructions: string | null;
  /** ISO time when the order will be ready. null = not set yet. */
  readyAt: string | null;
}

export interface CustomerStop {
  name: string;
  address: string;
  area: string;
  point: GeoPoint;
  deliveryInstructions: string | null;
  /** Masked number shown on screen, e.g. 017*****78 (never the real number). */
  maskedPhone: string | null;
  /** Bridge number used for the in-app masked call. null = calling not available. */
  callBridgeNumber: string | null;
}

export interface BatchInfo {
  id: string;
  /** 1-based position of this order inside the batch. */
  index: number;
  total: number;
}

export interface Delivery {
  id: string;
  /** Human order code on the bag tag, e.g. "MSM-1042". */
  orderCode: string;
  status: DeliveryStatus;
  distanceKm: number;
  estimatedMinutes: number;
  restaurant: RestaurantStop;
  customer: CustomerStop;
  verification: VerificationMethod;
  /** true when the customer asked for contactless delivery. */
  isContactless: boolean;
  /** Delivery earning in taka. */
  earning: number;
  /** Customer tip in taka (0 if none). */
  tip: number;
  /** null when this is a single (non-batch) delivery. */
  batch: BatchInfo | null;
  assignedAt: string;
  arrivedAtRestaurantAt: string | null;
  pickedUpAt: string | null;
  arrivedAtCustomerAt: string | null;
  deliveredAt: string | null;
}

/* ----------------------------- Problem reports ---------------------------- */

export type ProblemStage = "pickup" | "dropoff";

export const PICKUP_PROBLEM_REASONS = [
  "restaurantClosed",
  "orderNotReady",
  "wrongOrder",
  "accident",
  "other",
] as const;

export const DROPOFF_PROBLEM_REASONS = [
  "customerUnreachable",
  "wrongAddress",
  "customerRefused",
  "accident",
  "other",
] as const;

export type PickupProblemReason = (typeof PICKUP_PROBLEM_REASONS)[number];
export type DropoffProblemReason = (typeof DROPOFF_PROBLEM_REASONS)[number];
export type ProblemReason = PickupProblemReason | DropoffProblemReason;

/* ------------------------------ Action payloads --------------------------- */

export interface ArrivedPayload {
  deliveryId: string;
  at: "restaurant" | "customer";
  location: GeoPoint | null;
  arrivedAt: string;
}

export interface ConfirmPickupPayload {
  deliveryId: string;
  location: GeoPoint | null;
  confirmedAt: string;
}

export interface ConfirmDeliveryPayload {
  deliveryId: string;
  /** Required: delivery can only be confirmed inside the geofence. */
  location: GeoPoint;
  confirmedAt: string;
  method: VerificationMethod;
  otp?: string;
  photoDataUrl?: string;
}

export interface ReportProblemPayload {
  deliveryId: string;
  stage: ProblemStage;
  reason: ProblemReason;
  location: GeoPoint | null;
  reportedAt: string;
}

/* ------------------------------ Delivery history -------------------------- */

export type HistoryFilter = "all" | "today" | "week" | "month";

export interface DeliveryHistoryEntry {
  id: string;
  orderCode: string;
  restaurantName: string;
  area: string;
  status: "completed" | "cancelled";
  earning: number;
  tip: number;
  /** ISO time of completion (or cancellation). */
  finishedAt: string;
}
