const CACHE_NAME = 'smartsale-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest'
];

// 1. Install & Cache the core shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activate & Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// 3. Fetch Logic: Network-First for HTML, Cache-First for Assets
self.addEventListener('fetch', (event) => {
  // A. For page navigations (HTML), we try the network first so they get updates
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Save the fresh HTML
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // If NO internet, serve the cached HTML
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/');
          });
        })
    );
    return;
  }

  // B. For JS, CSS, Images (Assets), serve from cache first for speed & offline
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If we have it in cache, return it immediately
      if (cachedResponse) {
        // Simultaneously fetch a new version in the background to update the cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => { /* Ignore offline errors for background fetch */ });
        
        return cachedResponse;
      }

      // If NOT in cache, fetch it and cache it
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // If offline and not in cache, it will just fail silently (e.g., a missing image)
      });
    })
  );
});
