// apps/rider/public/sw.js
/* MyStreetMenu Rider - Service Worker (v2)
 * - Static assets: cache-first
 * - Page navigations: network-first; if offline, show the last copy of THAT page
 * - API calls (/api/*) and non-GET requests are NEVER cached,
 *   so the rider never sees stale or fake delivery data.
 * - Redirected responses (e.g. logged-out -> /login) are never cached, because
 *   browsers refuse to show a redirected response from the cache.
 */
const VERSION = "msm-rider-v2";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;

const PRECACHE_URLS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/logo/logo-480.webp",
];

const OFFLINE_TEXT =
  "অফলাইন। ইন্টারনেট সংযোগ দেখুন।\nOffline. Please check your internet connection.";

/** Only plain, successful, same-origin responses are safe to store. */
function isCacheable(response) {
  return response.ok && !response.redirected && response.type === "basic";
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Never cache API calls
  if (url.pathname.startsWith("/api/")) return;

  // Page navigations: network first, last copy of the same page when offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isCacheable(response)) {
            const copy = response.clone();
            caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              new Response(OFFLINE_TEXT, {
                status: 503,
                headers: { "Content-Type": "text/plain; charset=utf-8" },
              })
          )
        )
    );
    return;
  }

  // Static assets: cache first
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/logo/") ||
    url.pathname.startsWith("/images/");

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (isCacheable(response)) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
  }
});

// Allow the app to trigger an immediate update
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
