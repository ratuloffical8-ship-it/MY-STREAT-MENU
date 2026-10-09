// apps/rider/src/services/mock-store.ts
import { APP_TIME_ZONE, maskPhone } from "@/lib/formatters";
import { MOCK_RIDER } from "@/services/mock-data";
import type { Delivery, DeliveryHistoryEntry, VerificationMethod } from "@/types/delivery";
import type { DaySummary } from "@/types/earnings";
import type { Rider } from "@/types/rider";

/*
 * Demo database (used only when NEXT_PUBLIC_USE_MOCK_DATA is not "false").
 * It lives in memory, so reloading the page resets the demo.
 * Mock services read and change `mockDb`, like a tiny fake backend.
 */

export interface MockDb {
  rider: Rider;
  activeDelivery: Delivery | null;
  /** Finished deliveries of this demo session, newest first. */
  completed: Delivery[];
  /** Older deliveries (last 30 days) for the History and Earnings screens. */
  history: DeliveryHistoryEntry[];
  today: DaySummary;
  /** Order number for the next demo delivery (MSM-1043, MSM-1044, ...). */
  nextOrderNumber: number;
}

/** The 4-digit code the demo customer "tells" the rider (OTP deliveries). */
export const MOCK_DELIVERY_OTP = "1234";

/**
 * So every handoff method can be tried in the demo:
 * MSM-1042 = simple tap, MSM-1043 = customer OTP, MSM-1044 = contactless photo, then repeat.
 */
const VERIFICATION_CYCLE: readonly VerificationMethod[] = ["tap", "otp", "photo"];

function verificationFor(orderNumber: number): VerificationMethod {
  const index = (((orderNumber - 1042) % 3) + 3) % 3;
  return VERIFICATION_CYCLE[index];
}

function minutesFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

/** Today's date in Dhaka, formatted YYYY-MM-DD. */
export function dhakaDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE }).format(date);
}

/** "2026-10-08" shifted by N days (negative = earlier). Pure calendar maths. */
export function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

/* ------------------------------ Demo history ------------------------------ */

const DAY_MS = 86_400_000;

const SEED_RESTAURANTS = [
  { name: "Green Bowl Restaurant", area: "Mirpur 10, Dhaka" },
  { name: "Burger House", area: "Mirpur 12, Dhaka" },
  { name: "Pizza Corner", area: "Pallabi, Dhaka" },
  { name: "Tasty Biryani", area: "Kafrul, Dhaka" },
  { name: "Street Food Corner", area: "Mirpur 2, Dhaka" },
  { name: "Cold Coffee Hub", area: "Mirpur 1, Dhaka" },
] as const;

/** Deliveries a past day had: 6 to 11, always the same for the same day. */
function seededCount(dayOffset: number): number {
  return 6 + ((dayOffset * 7 + 3) % 6);
}

/**
 * 30 days of fake deliveries. Day 0 (today) has exactly `todayCount` finished
 * deliveries, so History agrees with the "today" tally on Home.
 */
function buildMockHistory(todayCount: number): DeliveryHistoryEntry[] {
  const nowMs = Date.now();
  const startOfToday = Date.parse(`${dhakaDate(new Date(nowMs))}T00:00:00+06:00`);
  const entries: DeliveryHistoryEntry[] = [];
  let serial = 0;

  for (let day = 0; day < 30; day += 1) {
    const count = day === 0 ? todayCount : seededCount(day);
    for (let i = 0; i < count; i += 1) {
      serial += 1;
      const restaurant = SEED_RESTAURANTS[(day * 3 + i) % SEED_RESTAURANTS.length];
      const cancelled = day > 0 && (day * 5 + i) % 17 === 16;
      const finishedAt =
        day === 0
          ? startOfToday + ((i + 1) * (nowMs - startOfToday)) / (count + 1)
          : startOfToday - day * DAY_MS + (8 * 60 + i * 50) * 60_000;

      entries.push({
        id: `h_${serial}`,
        orderCode: `MSM-${1041 - serial}`,
        restaurantName: restaurant.name,
        area: restaurant.area,
        status: cancelled ? "cancelled" : "completed",
        earning: cancelled ? 0 : 80,
        tip: !cancelled && day > 0 && (i + day) % 4 === 0 ? 10 : 0,
        finishedAt: new Date(finishedAt).toISOString(),
      });
    }
  }

  return entries.sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
}

/** A fresh demo delivery, like the one in the plan: Green Bowl -> Mirpur 11. */
export function createMockDelivery(orderNumber: number): Delivery {
  const verification = verificationFor(orderNumber);
  return {
    id: `d_${orderNumber}`,
    orderCode: `MSM-${orderNumber}`,
    status: "assigned",
    distanceKm: 3.2,
    estimatedMinutes: 25,
    restaurant: {
      name: "Green Bowl Restaurant",
      address: "House 5, Road 2, Mirpur 10, Dhaka",
      area: "Mirpur 10, Dhaka",
      point: { lat: 23.8069, lng: 90.3687 },
      pickupInstructions: null, // the screen shows the standard translated text
      readyAt: minutesFromNow(8),
    },
    customer: {
      name: "Karim",
      address: "House 12, Road 4, Mirpur 11, Dhaka",
      area: "Mirpur 11, Dhaka",
      point: { lat: 23.8183, lng: 90.365 },
      deliveryInstructions: "Call on arrival. Leave the package with the customer.",
      maskedPhone: maskPhone("01898765432"),
      // Demo only: not a real number
      callBridgeNumber: "+8800000000000",
    },
    verification,
    isContactless: verification === "photo",
    earning: 80,
    tip: 0,
    batch: null,
    assignedAt: new Date().toISOString(),
    arrivedAtRestaurantAt: null,
    pickedUpAt: null,
    arrivedAtCustomerAt: null,
    deliveredAt: null,
  };
}

export const mockDb: MockDb = {
  rider: { ...MOCK_RIDER },
  activeDelivery: createMockDelivery(1042),
  completed: [],
  history: buildMockHistory(8),
  today: {
    date: dhakaDate(),
    deliveriesCompleted: 8,
    deliveryEarnings: 640,
    tips: 0,
    bonus: 0,
    total: 640,
  },
  nextOrderNumber: 1043,
};

/** Demo only: hands the rider a new delivery. */
export function assignNextMockDelivery(): Delivery {
  const delivery = createMockDelivery(mockDb.nextOrderNumber);
  mockDb.nextOrderNumber += 1;
  mockDb.activeDelivery = delivery;
  return delivery;
                          }
