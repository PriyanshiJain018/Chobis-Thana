// Service Worker for Gunasthan App PWA

const CACHE_NAME = 'gunasthan-app-v1.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;

// Files to cache immediately
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
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
  './js/utils/voice.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('gunasthan-app-') && 
                     cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE;
            })
            .map((cacheName) => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external URLs (except for fonts and other resources)
  if (url.origin !== location.origin && !isAllowedExternalResource(url)) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('📱 Serving from cache:', request.url);
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache if not a valid response
            if (!networkResponse || 
                networkResponse.status !== 200 || 
                networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response
            const responseToCache = networkResponse.clone();
            
            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                console.log('💾 Caching dynamic resource:', request.url);
                cache.put(request, responseToCache);
              })
              .catch((error) => {
                console.warn('⚠️ Failed to cache dynamic resource:', error);
              });
            
            return networkResponse;
          })
          .catch((error) => {
            console.warn('🌐 Network request failed:', request.url, error);
            
            // For HTML requests, return a basic offline page
            if (request.destination === 'document') {
              return createOfflinePage();
            }
            
            // For other requests, try to return from cache anyway
            return caches.match(request);
          });
      })
  );
});

// Check if external resource is allowed
function isAllowedExternalResource(url) {
  const allowedDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com'
  ];
  
  return allowedDomains.some(domain => url.hostname.includes(domain));
}

// Create offline page
function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>गुणस्थान - Offline</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
                color: white;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 20px;
            }
            .container {
                max-width: 400px;
                padding: 40px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            h1 { font-size: 24px; margin-bottom: 16px; }
            .icon { font-size: 64px; margin-bottom: 20px; }
            p { margin-bottom: 24px; line-height: 1.6; opacity: 0.9; }
            button {
                background: white;
                color: #1e40af;
                border: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            button:hover { transform: translateY(-2px); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">🕉️</div>
            <h1>गुणस्थान सोपान</h1>
            <p>
                आपका कनेक्शन ऑफलाइन है।<br>
                Your connection is offline.<br><br>
                कृपया अपना इंटरनेट कनेक्शन जांचें और दोबारा कोशिश करें।
            </p>
            <button onclick="window.location.reload()">
                🔄 Try Again | पुनः प्रयास करें
            </button>
        </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Handle background sync (if supported)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle push notifications (if needed in future)
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: './manifest.json',
    badge: './manifest.json',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: './manifest.json'
      },
      {
        action: 'close',
        title: 'Close',
        icon: './manifest.json'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('गुणस्थान सोपान', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Perform any background tasks here
    console.log('🔄 Performing background sync...');
    
    // Example: Cache latest content
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.add('./');
    
    console.log('✅ Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('💬 Message received from main thread:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync triggered:', event.tag);
  
  if (event.tag === 'content-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

console.log('🎉 Service Worker loaded successfully');
