// Service Worker for Gunasthan PWA

const CACHE_NAME = 'gunasthan-pwa-v1.0';
const urlsToCache = [
  './',
  './index.html',
  './css/main.css',
  './css/components.css',
  './css/definitions.css',
  './css/matrix.css',
  './js/core/app.js',
  './js/components/matrix.js',
  './js/components/definitions.js',
  './js/components/transitions.js',
  './js/components/search.js',
  './js/data/gunasthans.js',
  './js/data/matrix.js',
  './js/data/definitions.js',
  './js/utils/helpers.js',
  './js/utils/voice.js',
  './manifest.json'
];

// Install the service worker and cache all the app's assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache files:', err);
      })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event: serve assets from cache first
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response from cache
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      }
    )
  );
});
