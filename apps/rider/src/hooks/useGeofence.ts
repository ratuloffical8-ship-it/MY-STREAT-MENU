// apps/rider/src/hooks/useGeofence.ts
import { useEffect, useState } from "react";
import { USE_MOCK_DATA } from "@/config/constants";
import {
  GEOLOCATION_OPTIONS,
  checkGeofence,
  getGeofenceRadius,
  toGeoPoint,
} from "@/lib/geo";
import type { GeoPoint } from "@/types/delivery";

export type GeofenceStatus =
  | "checking" // waiting for the first GPS position
  | "inside" // close enough: delivery can be confirmed
  | "outside" // too far from the customer
  | "denied" // rider refused the location permission
  | "unavailable"; // no GPS signal / not supported

export interface GeofenceState {
  status: GeofenceStatus;
  distanceMeters: number | null;
  radiusMeters: number;
  /** Rider's latest position (sent with the delivery confirmation). */
  point: GeoPoint | null;
}

/**
 * Watches the rider's GPS and says whether they are within the allowed
 * distance (default 100 m) of `target`. Stops watching when the screen closes.
 *
 * Demo mode (no backend): the position is simulated AT the target, because a
 * tester is not standing at the demo customer's house.
 */
export function useGeofence(target: GeoPoint, enabled = true): GeofenceState {
  const radiusMeters = getGeofenceRadius();
  const { lat, lng } = target;

  const [state, setState] = useState<GeofenceState>({
    status: "checking",
    distanceMeters: null,
    radiusMeters,
    point: null,
  });

  useEffect(() => {
    if (!enabled) return;

    if (USE_MOCK_DATA) {
      setState({
        status: "inside",
        distanceMeters: 0,
        radiusMeters,
        point: { lat, lng },
      });
      return;
    }

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState((previous) => ({ ...previous, status: "unavailable" }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const point = toGeoPoint(position);
        const result = checkGeofence(point, { lat, lng }, radiusMeters);
        setState({
          status: result.isInside ? "inside" : "outside",
          distanceMeters: result.distanceMeters,
          radiusMeters,
          point,
        });
      },
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED;
        setState((previous) =>
          // A short GPS hiccup must not lock the rider out once we have a position
          !denied && previous.point
            ? previous
            : { ...previous, status: denied ? "denied" : "unavailable" }
        );
      },
      GEOLOCATION_OPTIONS
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled, lat, lng, radiusMeters]);

  return state;
  }
