const CACHE_NAME = 'smartsale-v1';

// 1. Install Event (Chrome looks for this)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 3. Fetch Event (Chrome NEEDS this to allow installation)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
