// apps/rider/src/services/parse.ts
import { ApiError } from "@/services/api";

/** Anything with a zod-style safeParse (all our schemas qualify). */
export interface ResponseSchema<T> {
  safeParse(data: unknown): { success: true; data: T } | { success: false };
}

/**
 * Checks that a backend answer has the shape the app expects.
 * If not, the rider sees a normal "something went wrong" instead of a crash.
 */
export function parseResponse<T>(schema: ResponseSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError("Unexpected server response", 502, "server");
  }
  return result.data;
}
