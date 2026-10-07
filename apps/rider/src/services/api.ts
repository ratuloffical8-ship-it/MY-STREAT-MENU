// apps/rider/src/services/api.ts
import { API_BASE_URL, REQUEST_TIMEOUT_MS, ROUTES } from "@/config/constants";
import { clearSessionToken, getSessionToken } from "@/lib/session";

export type ApiErrorKind =
  | "network" // no internet / server not reachable
  | "timeout" // took too long (weak signal)
  | "unauthorized" // 401: login expired
  | "client" // other 4xx: the request was wrong
  | "server"; // 5xx: backend problem

export class ApiError extends Error {
  /** HTTP status. 0 when no response was received (network / timeout). */
  readonly status: number;
  readonly kind: ApiErrorKind;

  constructor(message: string, status: number, kind: ApiErrorKind) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;
  }

  /** true for failures where retrying later can work (weak network, server down). */
  get isRetryable(): boolean {
    return this.kind === "network" || this.kind === "timeout" || this.kind === "server";
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Will be sent as JSON. */
  body?: unknown;
  /** false = do not send the token and do not redirect on 401 (used by login). */
  auth?: boolean;
  /** Lets the caller (e.g. React Query) cancel the request. */
  signal?: AbortSignal;
  timeoutMs?: number;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null) {
      const message = (data as Record<string, unknown>).message;
      if (typeof message === "string" && message.trim()) return message;
    }
  } catch {
    // body was empty or not JSON
  }
  return response.statusText || `HTTP ${response.status}`;
}

function kindForStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status >= 500) return "server";
  return "client";
}

/** Sends one request to the backend and returns the parsed JSON. */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    auth = true,
    signal,
    timeoutMs = REQUEST_TIMEOUT_MS,
  } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getSessionToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const forwardAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", forwardAbort);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await readErrorMessage(response);

      if (response.status === 401 && auth) {
        // Login expired: forget the token and go to the login page
        clearSessionToken();
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== ROUTES.login
        ) {
          window.location.assign(ROUTES.login);
        }
      }

      throw new ApiError(message, response.status, kindForStatus(response.status));
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timedOut) throw new ApiError("Request timed out", 0, "timeout");
    if (signal?.aborted) throw error; // the caller cancelled on purpose
    throw new ApiError("Network error", 0, "network");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  }
}

type BodylessOptions = Omit<RequestOptions, "method" | "body">;
type BodyOptions = Omit<RequestOptions, "method">;

export const api = {
  get: <T>(path: string, options?: BodylessOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: BodyOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: BodyOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: BodyOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: BodylessOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
