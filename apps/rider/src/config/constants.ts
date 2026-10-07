// apps/rider/src/config/constants.ts

/* ---------------------------- Environment settings ------------------------ */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "MyStreetMenu Rider";

/** Backend address, without a trailing slash. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

/**
 * true  = use built-in demo data (no backend needed). This is the default.
 * false = talk to the real backend. Set NEXT_PUBLIC_USE_MOCK_DATA=false.
 */
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

/** Dispatch / support hotline (empty string if not configured). */
export const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "";

/* ----------------------------------- API ---------------------------------- */

/** A request that takes longer than this is treated as failed (weak network). */
export const REQUEST_TIMEOUT_MS = 15_000;

/* --------------------------------- Session -------------------------------- */

export const SESSION_COOKIE = "msm_rider_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/* ---------------------------------- OTP ----------------------------------- */

/** Login OTP sent to the rider's phone. */
export const LOGIN_OTP_LENGTH = 6;
/** Delivery handoff code the customer tells the rider. */
export const DELIVERY_OTP_LENGTH = 4;

/* ---------------------------------- Routes -------------------------------- */

export const ROUTES = {
  root: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  home: "/overview",
  deliveries: "/deliveries",
  history: "/delivery-history",
  earnings: "/earnings",
  notifications: "/notifications",
  profile: "/profile",
  support: "/support",
} as const;

/** Pages a rider can open without being logged in. */
export const PUBLIC_ROUTES: readonly string[] = [
  ROUTES.login,
  ROUTES.forgotPassword,
];

/** Page of one delivery, e.g. /deliveries/d_1042 */
export function deliveryPath(deliveryId: string): string {
  return `${ROUTES.deliveries}/${encodeURIComponent(deliveryId)}`;
  }
