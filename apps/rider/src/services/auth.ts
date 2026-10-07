// apps/rider/src/services/auth.ts
import { USE_MOCK_DATA } from "@/config/constants";
import { clearSessionToken, setSessionToken } from "@/lib/session";
import {
  authSessionSchema,
  otpRequestResultSchema,
  type OtpRequestResult,
} from "@/schemas/auth";
import { api, ApiError } from "@/services/api";
import { MOCK_LOGIN_OTP, MOCK_RIDER, MOCK_TOKEN, mockDelay } from "@/services/mock-data";
import type { AuthSession, RequestOtpPayload, VerifyOtpPayload } from "@/types/rider";

interface ResponseSchema<T> {
  safeParse(data: unknown): { success: true; data: T } | { success: false };
}

/** Checks the backend answer has the shape we expect. */
function parseResponse<T>(schema: ResponseSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError("Unexpected server response", 502, "server");
  }
  return result.data;
}

/** Step 1: ask the backend to send an OTP to the rider's phone. */
export async function requestOtp(
  payload: RequestOtpPayload
): Promise<OtpRequestResult> {
  if (USE_MOCK_DATA) {
    await mockDelay(600);
    return { resendAfterSeconds: 30 };
  }

  const data = await api.post<unknown>("/auth/request-otp", payload, {
    auth: false,
  });
  return parseResponse(otpRequestResultSchema, data);
}

/** Step 2: check the OTP. On success the login is saved on this device. */
export async function signIn(payload: VerifyOtpPayload): Promise<AuthSession> {
  let session: AuthSession;

  if (USE_MOCK_DATA) {
    await mockDelay(700);
    if (payload.otp !== MOCK_LOGIN_OTP) {
      throw new ApiError("Invalid OTP", 400, "client");
    }
    session = {
      token: MOCK_TOKEN,
      rider: { ...MOCK_RIDER, phone: payload.phone },
    };
  } else {
    const data = await api.post<unknown>("/auth/verify-otp", payload, {
      auth: false,
    });
    session = parseResponse(authSessionSchema, data);
  }

  setSessionToken(session.token);
  return session;
}

/** Forget the login on this device. */
export function signOut(): void {
  clearSessionToken();
  }
