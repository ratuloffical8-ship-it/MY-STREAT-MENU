// apps/rider/src/schemas/auth.ts
import { z } from "zod";
import { LOGIN_OTP_LENGTH } from "@/config/constants";
import { digitsOnly, normalizeBdPhone } from "@/lib/phone";

/** Error codes the login screen turns into translated messages (auth.<code>). */
export type AuthFieldError = "invalidPhone" | "invalidOtp";

/** Rider-typed phone -> clean "01XXXXXXXXX". */
export const phoneSchema = z.string().transform((value, ctx) => {
  const phone = normalizeBdPhone(value);
  if (phone === null) {
    const code: AuthFieldError = "invalidPhone";
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: code });
    return z.NEVER;
  }
  return phone;
});

/** Rider-typed OTP -> exactly LOGIN_OTP_LENGTH digits. */
export const otpSchema = z.string().transform((value, ctx) => {
  const otp = digitsOnly(value);
  if (otp.length !== LOGIN_OTP_LENGTH) {
    const code: AuthFieldError = "invalidOtp";
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: code });
    return z.NEVER;
  }
  return otp;
});

/* ----------------------------- Backend responses --------------------------- */

export const riderSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  language: z.enum(["bn", "en"]),
  availability: z.enum(["online", "offline"]),
  vehicle: z.object({
    type: z.enum(["motorcycle", "scooter", "bicycle"]),
    plateNumber: z.string(),
  }),
  payoutAccount: z
    .object({
      provider: z.enum(["bkash", "nagad"]),
      maskedNumber: z.string(),
    })
    .nullable(),
  rank: z.enum(["bronze", "silver", "gold"]),
  rating: z.number(),
  referralCode: z.string(),
});

export const authSessionSchema = z.object({
  token: z.string().min(1),
  rider: riderSchema,
});

export const otpRequestResultSchema = z.object({
  /** Seconds the rider must wait before asking for another OTP. */
  resendAfterSeconds: z.number().int().nonnegative(),
});

export type OtpRequestResult = z.infer<typeof otpRequestResultSchema>;
