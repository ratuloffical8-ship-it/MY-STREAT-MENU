// apps/rider/src/lib/location.ts
import { GEOLOCATION_OPTIONS, toGeoPoint } from "@/lib/geo";
import type { GeoPoint } from "@/types/delivery";

/**
 * Best-effort "where is the rider now?".
 * Never throws and never waits forever: returns null if location is
 * switched off, denied, unavailable or too slow.
 *
 * Used to stamp arrivals, pickups and problem reports with a location
 * WITHOUT blocking the rider if GPS is weak.
 */
export function getCurrentPoint(maxWaitMs = 4_000): Promise<GeoPoint | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      resolve(null);
      return;
    }

    let settled = false;
    const finish = (point: GeoPoint | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(point);
    };

    // Browsers do NOT start the GPS timeout while a permission prompt is open,
    // so an unanswered prompt would wait forever. This stops that.
    const timer = setTimeout(() => finish(null), maxWaitMs + 2_000);

    navigator.geolocation.getCurrentPosition(
      (position) => finish(toGeoPoint(position)),
      () => finish(null),
      {
        ...GEOLOCATION_OPTIONS,
        timeout: maxWaitMs,
        maximumAge: 30_000, // a fix from the last 30 seconds is fine here
      }
    );
  });
                     }
