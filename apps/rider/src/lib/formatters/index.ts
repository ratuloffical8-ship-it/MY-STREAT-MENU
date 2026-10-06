// apps/rider/src/lib/formatters/index.ts
import type { Language } from "@/types/rider";

/** Riders work in Bangladesh, so all times are shown in Dhaka time. */
export const APP_TIME_ZONE = "Asia/Dhaka";
export const CURRENCY_SYMBOL = "৳";

const LOCALES: Record<Language, string> = {
  bn: "bn-BD", // Bengali digits: ৬৪০
  en: "en-US",
};

/* --------------------------------- Numbers -------------------------------- */

export function formatNumber(
  value: number,
  lang: Language,
  maxFractionDigits = 0
): string {
  return new Intl.NumberFormat(LOCALES[lang], {
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

/** 640 -> "৳640" (en) / "৳৬৪০" (bn) */
export function formatMoney(amount: number, lang: Language): string {
  return `${CURRENCY_SYMBOL}${formatNumber(Math.round(amount), lang)}`;
}

/** 3.2 -> "3.2 km" / "৩.২ কিমি". Under 1 km it shows metres. */
export function formatDistance(km: number, lang: Language): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${formatNumber(meters, lang)} ${lang === "bn" ? "মি." : "m"}`;
  }
  return `${formatNumber(km, lang, 1)} ${lang === "bn" ? "কিমি" : "km"}`;
}

/** 25 -> "25 min" / "২৫ মিনিট"; 80 -> "1 h 20 min" / "১ ঘণ্টা ২০ মিনিট" */
export function formatDuration(totalMinutes: number, lang: Language): string {
  const rounded = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  const hourUnit = lang === "bn" ? "ঘণ্টা" : "h";
  const minuteUnit = lang === "bn" ? "মিনিট" : "min";

  if (hours === 0) return `${formatNumber(minutes, lang)} ${minuteUnit}`;
  if (minutes === 0) return `${formatNumber(hours, lang)} ${hourUnit}`;
  return `${formatNumber(hours, lang)} ${hourUnit} ${formatNumber(minutes, lang)} ${minuteUnit}`;
}

/** Countdown for the order-ready timer, e.g. "04:07". */
export function formatCountdown(milliseconds: number, lang: Language): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const two = new Intl.NumberFormat(LOCALES[lang], {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  return `${two.format(minutes)}:${two.format(seconds)}`;
}

/* ------------------------------- Date and time ---------------------------- */

function toValidDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "2:35 PM" / "দুপুর ২:৩৫" */
export function formatTime(iso: string, lang: Language): string {
  const date = toValidDate(iso);
  if (!date) return "";
  return new Intl.DateTimeFormat(LOCALES[lang], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

/** "6 Oct 2026" / "৬ অক্টোবর ২০২৬" */
export function formatDate(iso: string, lang: Language): string {
  const date = toValidDate(iso);
  if (!date) return "";
  return new Intl.DateTimeFormat(LOCALES[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

export function formatDateTime(iso: string, lang: Language): string {
  const date = formatDate(iso, lang);
  const time = formatTime(iso, lang);
  return date && time ? `${date}, ${time}` : date || time;
}

/** Which greeting to show on the Home screen (Dhaka time). */
export type GreetingKey = "morning" | "afternoon" | "evening";

export function getGreetingKey(now: Date = new Date()): GreetingKey {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: APP_TIME_ZONE,
    }).format(now)
  );
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

/* ---------------------------------- Phone --------------------------------- */

/** "01712345678" -> "017******78". Real numbers are never shown to the rider. */
export function maskPhone(phone: string): string {
  const digits = phone.trim();
  if (digits.length < 6) return digits;
  return `${digits.slice(0, 3)}${"*".repeat(digits.length - 5)}${digits.slice(-2)}`;
}

/** Builds a tel: link. Keeps digits and a leading + only. */
export function toTelUrl(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}
