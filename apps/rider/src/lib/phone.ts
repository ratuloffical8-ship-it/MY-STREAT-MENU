// apps/rider/src/lib/phone.ts

const BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Turns Bengali digits into normal digits: "০১৭" -> "017". */
export function toAsciiDigits(input: string): string {
  return input.replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit)));
}

/** Keeps only digits (Bengali digits are converted), optionally cut to maxLength. */
export function digitsOnly(input: string, maxLength?: number): string {
  const digits = toAsciiDigits(input).replace(/\D/g, "");
  return maxLength === undefined ? digits : digits.slice(0, maxLength);
}

/**
 * Converts what the rider typed into a Bangladeshi mobile number: "01XXXXXXXXX".
 * Accepts: 01712345678, +8801712345678, 8801712345678, 008801712345678,
 *          spaces or dashes, and Bengali digits.
 * Returns null if it is not a valid number.
 */
export function normalizeBdPhone(input: string): string | null {
  let value = toAsciiDigits(input).replace(/[\s\-().]/g, "");

  if (value.startsWith("+")) value = value.slice(1);
  if (value.startsWith("00880")) value = value.slice(5);
  else if (value.startsWith("880")) value = value.slice(3);

  // "1712345678" (without the leading 0) -> "01712345678"
  if (/^1[3-9]\d{8}$/.test(value)) value = `0${value}`;

  return /^01[3-9]\d{8}$/.test(value) ? value : null;
    }
