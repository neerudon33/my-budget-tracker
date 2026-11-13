
const CACHE = 'funda-v3';

const FILES = [
  './',
  './index.html',
  './styles.css?v=2',
  './app.js?v=2',
  './manifest.webmanifest',
  './icon.svg'
];

// INSTALL
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key =>
              key.startsWith('funda-') && key !== CACHE
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// FETCH: NETWORK FIRST
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request, {
          cache: 'no-cache'
        });

        if (response.ok) {
          const cache = await caches.open(CACHE);

          await cache.put(request, response.clone());
        }

        return response;

      } catch (error) {
        const cached = await caches.match(request);

        if (cached) return cached;

        if (request.mode === 'navigate') {
          const fallback = await caches.match('./index.html');

          if (fallback) return fallback;
        }

        return new Response('Offline - Please reconnect to the internet.', {
          status: 503,
          headers: {
            'Content-Type': 'text/plain'
          }
        });
      }
    })()
  );
});
