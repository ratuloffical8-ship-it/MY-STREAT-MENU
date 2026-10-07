// apps/rider/src/lib/session.ts
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/config/constants";

/*
 * The login token is kept in a cookie so that:
 *  - the API client can send it as "Authorization: Bearer <token>"
 *  - the middleware can send logged-out riders to the login page
 *
 * A cookie written from JavaScript cannot be HttpOnly, so this is only a
 * convenience gate. The backend must still check the token on every request.
 * These functions only work in the browser.
 */

export function getSessionToken(): string | null {
  if (typeof document === "undefined") return null;

  const prefix = `${SESSION_COOKIE}=`;
  for (const part of document.cookie.split(";")) {
    const cookie = part.trim();
    if (cookie.startsWith(prefix)) {
      try {
        const value = decodeURIComponent(cookie.slice(prefix.length));
        return value || null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function setSessionToken(token: string): void {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; ` +
    `Max-Age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearSessionToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function hasSession(): boolean {
  return getSessionToken() !== null;
  }
