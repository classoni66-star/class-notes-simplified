const CACHE_NAME = 'smartsale-force-update-v4';

// 1. Force the new Service Worker to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. Delete ALL old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            // Delete the old broken cache
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Force the new code to take over the phone instantly
      return self.clients.claim();
    })
  );
});

// 3. Network-First for HTML (so you never get stuck on an old version again)
self.addEventListener('fetch', (event) => {
  // If the request is for a page (HTML), try the internet first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Save a copy of the fresh HTML
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // If offline, load the cached version
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/');
          });
        })
    );
    return;
  }

  // For images, JS, CSS: serve from cache first, then update in background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {});

      return cachedResponse || fetchPromise;
    })
  );
});
