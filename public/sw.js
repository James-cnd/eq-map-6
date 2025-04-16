// Service Worker for the Icelandic Earthquake Monitor

const CACHE_NAME = "earthquake-app-v1"
const DYNAMIC_CACHE = "earthquake-dynamic-v1"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/client-page",
  "/globals.css",
  // Add other static assets here
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  // Activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE).map((name) => caches.delete(name)),
      )
    }),
  )
  // Take control of clients immediately
  return self.clients.claim()
})

// Helper function to determine if a request should be cached
function shouldCache(url) {
  // Don't cache API requests or version checks
  if (url.includes("/api/earthquakes") || url.includes("/api/version") || url.includes("/api/global-data")) {
    return false
  }

  // Cache static assets
  return true
}

// Fetch event - network first with cache fallback for API, cache first with network fallback for static assets
self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") return

  // Handle API requests (network first)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response to store in cache if needed
          const responseToCache = response.clone()

          // Only cache successful responses that should be cached
          if (response.ok && shouldCache(url.toString())) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })
          }

          return response
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(request)
        }),
    )
    return
  }

  // Handle static assets (cache first)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok && shouldCache(url.toString())) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse.clone())
              })
            }
            return networkResponse
          })
          .catch(() => {
            // Network failed, already returning cached response
          })

        // Return cached response immediately
        return cachedResponse
      }

      // If not in cache, fetch from network
      return fetch(request).then((response) => {
        // Clone the response to store in cache
        const responseToCache = response.clone()

        // Only cache successful responses that should be cached
        if (response.ok && shouldCache(url.toString())) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })
        }

        return response
      })
    }),
  )
})

// Listen for messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
