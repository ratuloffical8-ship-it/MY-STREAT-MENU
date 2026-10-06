// apps/rider/src/lib/geo.ts
import type { GeoPoint } from "@/types/delivery";

const EARTH_RADIUS_METERS = 6_371_000;

/** Used when NEXT_PUBLIC_GEOFENCE_RADIUS_METERS is missing or invalid. */
export const DEFAULT_GEOFENCE_RADIUS_METERS = 100;

/** Options for navigator.geolocation (accurate, but never waits forever). */
export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 5_000,
};

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** true if value is a real latitude/longitude pair. */
export function isValidPoint(value: unknown): value is GeoPoint {
  if (typeof value !== "object" || value === null) return false;
  const { lat, lng } = value as Record<string, unknown>;
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/** Straight-line distance between two points in metres (haversine formula). */
export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Geofence radius in metres, read from the environment (default 100). */
export function getGeofenceRadius(): number {
  const raw = Number(process.env.NEXT_PUBLIC_GEOFENCE_RADIUS_METERS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_GEOFENCE_RADIUS_METERS;
}

export interface GeofenceResult {
  distanceMeters: number;
  radiusMeters: number;
  isInside: boolean;
}

/** Is the rider close enough to the target to confirm delivery? */
export function checkGeofence(
  rider: GeoPoint,
  target: GeoPoint,
  radiusMeters: number = getGeofenceRadius()
): GeofenceResult {
  const distance = distanceMeters(rider, target);
  return {
    distanceMeters: distance,
    radiusMeters,
    isInside: distance <= radiusMeters,
  };
}

/** Converts a browser position into our GeoPoint. */
export function toGeoPoint(position: GeolocationPosition): GeoPoint {
  return { lat: position.coords.latitude, lng: position.coords.longitude };
}

/** One-tap link that opens exact coordinates in Google Maps / the default maps app. */
export function buildDirectionsUrl(destination: GeoPoint): string {
  const { lat, lng } = destination;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=two-wheeler`;
}
