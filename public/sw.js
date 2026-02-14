// Buildeezy PWA Service Worker
// This service worker provides offline functionality and caching for the PWA

const CACHE_NAME = 'buildeezy-pwa-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Resources to cache for offline functionality
const CACHE_RESOURCES = [
  '/',
  '/offline.html',
  '/favicon/android-chrome-192x192.png',
  '/favicon/android-chrome-512x512.png',
  '/favicon/apple-touch-icon.png',
  '/favicon/favicon-32x32.png',
  '/favicon/favicon-16x16.png',
  '/favicon/site.webmanifest',
];

// Resources that should be cached at runtime
const RUNTIME_CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /^https:\/\/cdnjs\.cloudflare\.com/,
];

// Resources that should never be cached
const NEVER_CACHE_PATTERNS = [
  /\/api\//,
  /\/socket\.io/,
  /\.hot-update\./,
  /sockjs-node/,
];

// Install event - cache core resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // Cache core resources
        await cache.addAll(CACHE_RESOURCES);
        console.log('[SW] Core resources cached successfully');
        
        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('[SW] Failed to cache core resources:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const oldCacheNames = cacheNames.filter(name => 
          name.startsWith('buildeezy-pwa-') && name !== CACHE_NAME
        );
        
        await Promise.all(
          oldCacheNames.map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
        );
        
        // Take control of all pages
        await self.clients.claim();
        console.log('[SW] Service worker activated and took control');
      } catch (error) {
        console.error('[SW] Failed to activate service worker:', error);
      }
    })()
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip requests that should never be cached
  if (NEVER_CACHE_PATTERNS.some(pattern => pattern.test(event.request.url))) {
    return;
  }
  
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle static assets
  if (url.origin === self.location.origin) {
    event.respondWith(handleStaticAssets(request));
    return;
  }
  
  // Handle external resources (fonts, CDN assets, etc.)
  if (RUNTIME_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(handleExternalResources(request));
    return;
  }
});

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, cache the response and return it
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed for navigation, trying cache:', error);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page as fallback
    return caches.match(OFFLINE_URL);
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to handle static asset:', request.url, error);
    
    // For critical assets, try to return a cached version
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Asset not available offline', { status: 503 });
  }
}

// Handle external resources with stale-while-revalidate strategy
async function handleExternalResources(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch from network in background
    const networkPromise = fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(error => {
      console.log('[SW] Failed to fetch external resource:', request.url, error);
    });
    
    // Return cached version immediately if available, otherwise wait for network
    return cachedResponse || await networkPromise;
  } catch (error) {
    console.error('[SW] Failed to handle external resource:', request.url, error);
    return fetch(request);
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  try {
    // Handle any pending offline actions here
    console.log('[SW] Processing background sync tasks');
    
    // This is where you would process any offline actions
    // that were queued while the app was offline
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Handle push notifications (integrate with existing Firebase messaging)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon/android-chrome-192x192.png',
      badge: '/favicon/android-chrome-192x192.png',
      image: data.image,
      data: data.data || {},
      tag: data.tag || 'buildeezy-notification',
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Buildeezy', options)
    );
  } catch (error) {
    console.error('[SW] Failed to handle push notification:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window/tab, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[SW] Buildeezy Service Worker loaded successfully');