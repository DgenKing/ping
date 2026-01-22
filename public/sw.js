/// <reference lib="webworker" />

const CACHE_VERSION = 'ping-v1';
const CACHE_URLS = [
  '/',
  '/settings',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-http(s) requests (chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) return;

  // Skip API requests
  if (url.pathname.startsWith('/api/')) return;

  // Skip Next.js internals
  if (url.pathname.startsWith('/_next/')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses or non-basic responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Don't cache if URL is not http(s)
        if (!event.request.url.startsWith('http')) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_VERSION).then((cache) => {
          try {
            cache.put(event.request, responseToCache);
          } catch (e) {
            console.warn('Cache put failed:', e);
          }
        });

        return response;
      });
    }).catch(() => {
      // Return offline page if available
      return caches.match('/');
    })
  );
});

// Push event - show notification
self.addEventListener('push', (event) => {
  let data = {
    title: 'Ping Alert',
    body: 'Price alert triggered!',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    tag: 'ping-alert',
    data: {}
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch (e) {
    console.error('Failed to parse push data:', e);
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.svg',
    badge: data.badge || '/icons/icon-192.svg',
    vibrate: [200, 100, 200, 100, 300],
    tag: data.tag || 'ping-alert',
    renotify: true,
    requireInteraction: true,
    data: data.data || {},
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click - open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Periodic sync for background price checking (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-prices') {
    event.waitUntil(
      fetch('/api/check-alerts')
        .then((response) => response.json())
        .then((data) => {
          console.log('Periodic sync check:', data);
        })
        .catch((error) => {
          console.error('Periodic sync failed:', error);
        })
    );
  }
});

console.log('Service Worker loaded - version:', CACHE_VERSION);
