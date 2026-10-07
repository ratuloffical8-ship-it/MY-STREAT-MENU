// apps/rider/src/services/mock-data.ts
import { maskPhone } from "@/lib/formatters";
import type { Rider } from "@/types/rider";

/** Demo mode only (NEXT_PUBLIC_USE_MOCK_DATA is not "false"). */
export const MOCK_LOGIN_OTP = "123456";
export const MOCK_TOKEN = "mock-token-rahim";

const MOCK_PHONE = "01712345678";

export const MOCK_RIDER: Rider = {
  id: "r_001",
  name: "Rahim",
  phone: MOCK_PHONE,
  language: "bn",
  availability: "online",
  vehicle: { type: "motorcycle", plateNumber: "DHAKA METRO-HA 12-3456" },
  payoutAccount: { provider: "bkash", maskedNumber: maskPhone(MOCK_PHONE) },
  rank: "silver",
  rating: 4.8,
  referralCode: "RAHIM-4821",
};

/** Makes demo requests feel like a real network call. */
export function mockDelay(milliseconds = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
