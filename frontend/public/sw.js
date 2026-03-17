const CACHE_NAME = 'dolmtschr-v3';
const API_CACHE_NAME = 'dolmtschr-api-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
];

// --- Install: pre-cache static assets + offline page ---

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// --- Activate: clean old caches ---

self.addEventListener('activate', (event) => {
  const keepCaches = new Set([CACHE_NAME, API_CACHE_NAME]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !keepCaches.has(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// --- Fetch strategies ---

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // --- API routes ---
  if (url.pathname.startsWith('/api/')) {
    handleApiRequest(event, url);
    return;
  }

  // --- Hashed assets (JS/CSS with content hash) — cache-first, immutable ---
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // --- Navigation requests — network-first, offline fallback ---
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  // --- Other static files — stale-while-revalidate ---
  event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
});

// --- API request routing ---

function handleApiRequest(event, url) {
  const path = url.pathname;

  // Network-only: non-GET requests, pipeline, stt, tts, health, auth
  if (
    event.request.method !== 'GET' ||
    path.startsWith('/api/pipeline') ||
    path.startsWith('/api/stt') ||
    path.startsWith('/api/tts') ||
    path.startsWith('/api/health') ||
    path.startsWith('/api/auth')
  ) {
    // Let the browser handle it normally (network-only)
    return;
  }

  // Stale-while-revalidate: languages, config
  if (path.startsWith('/api/languages') || path.startsWith('/api/config')) {
    event.respondWith(staleWhileRevalidate(event.request, API_CACHE_NAME));
    return;
  }

  // Cache-first with background update: sessions, messages
  if (path.startsWith('/api/sessions') || path.startsWith('/api/messages')) {
    event.respondWith(cacheFirstWithUpdate(event.request, API_CACHE_NAME));
    return;
  }

  // All other API routes: network-only (no respondWith = browser default)
}

// --- Strategy: cache-first ---

function cacheFirst(request, cacheName) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(cacheName).then((cache) => cache.put(request, clone));
      }
      return response;
    });
  });
}

// --- Strategy: stale-while-revalidate ---

function staleWhileRevalidate(request, cacheName) {
  return caches.match(request).then((cached) => {
    const fetchPromise = fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(cacheName).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => cached);

    return cached || fetchPromise;
  });
}

// --- Strategy: cache-first with background network update ---

function cacheFirstWithUpdate(request, cacheName) {
  return caches.match(request).then((cached) => {
    // Always kick off a background update
    const fetchPromise = fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(cacheName).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => undefined);

    // Return cached immediately if available, otherwise wait for network
    if (cached) {
      // Fire-and-forget background update
      fetchPromise;
      return cached;
    }
    return fetchPromise.then((response) => response || new Response('{}', {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }));
  });
}

// --- Navigation: network-first with offline fallback ---

function navigationHandler(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() =>
      caches.match(request).then((cached) =>
        cached || caches.match('/offline.html')
      )
    );
}
