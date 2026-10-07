// apps/rider/src/providers/AppProviders.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { ApiError } from "@/services/api";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        refetchOnWindowFocus: true,
        // Retry weak-network failures twice, never retry a wrong request (4xx)
        retry: (failureCount, error) => {
          if (error instanceof ApiError && !error.isRetryable) return false;
          return failureCount < 2;
        },
      },
      // Never auto-retry actions (pickup, delivery, cashout):
      // the rider sees "Not saved - Retry" and decides.
      mutations: { retry: false },
    },
  });
}

/** Registers /sw.js so the app can be installed and opens without internet. */
function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Not critical: the app still works without the service worker
    });
  }, []);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>{children}</LanguageProvider>
      <ServiceWorkerRegistration />
    </QueryClientProvider>
  );
                                     }
