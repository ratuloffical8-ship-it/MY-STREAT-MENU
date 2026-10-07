// apps/rider/src/schemas/delivery.ts
import { z } from "zod";

export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const restaurantStopSchema = z.object({
  name: z.string(),
  address: z.string(),
  area: z.string(),
  point: geoPointSchema,
  pickupInstructions: z.string().nullable(),
  readyAt: z.string().nullable(),
});

const customerStopSchema = z.object({
  name: z.string(),
  address: z.string(),
  area: z.string(),
  point: geoPointSchema,
  deliveryInstructions: z.string().nullable(),
  maskedPhone: z.string().nullable(),
  callBridgeNumber: z.string().nullable(),
});

const batchInfoSchema = z.object({
  id: z.string(),
  index: z.number().int().positive(),
  total: z.number().int().positive(),
});

export const deliverySchema = z.object({
  id: z.string(),
  orderCode: z.string(),
  status: z.enum(["assigned", "to_pickup", "to_dropoff", "completed", "cancelled"]),
  distanceKm: z.number().nonnegative(),
  estimatedMinutes: z.number().nonnegative(),
  restaurant: restaurantStopSchema,
  customer: customerStopSchema,
  verification: z.enum(["tap", "otp", "photo"]),
  isContactless: z.boolean(),
  earning: z.number().nonnegative(),
  tip: z.number().nonnegative(),
  batch: batchInfoSchema.nullable(),
  assignedAt: z.string(),
  arrivedAtRestaurantAt: z.string().nullable(),
  pickedUpAt: z.string().nullable(),
  arrivedAtCustomerAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
});

/** "No active delivery" is a normal answer: null. */
export const activeDeliverySchema = deliverySchema.nullable();
