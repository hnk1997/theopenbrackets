// Bump version string whenever assets change — old caches are auto-deleted on activate
const CACHE = 'tob-v3';

// Critical assets pre-cached on install (fonts, icons, logos)
const PRECACHE = [
  '/',
  '/index.html',
  '/Logo White.svg',
  '/Favicon.png',
  '/Icons/mdi-light_menu.svg',
  '/Icons/bitcoin-icons_cross-outline.svg',
  // Background images
  '/Background.webp',
  '/Background Purple.webp',
  '/Background Green.webp',
  // Case study assets
  '/CS1.webp',
  '/CS2.webp',
  '/CS3.webp',
  '/CS4.webp',
  '/Cadillac Mockup.webp',
  '/Yap Mockup.webp',
  '/KFH Mockup.webp',
  '/Alfanar Mockup.webp',
  '/Design.webp',
  '/Develop.webp',
  // Client logos
  '/Client Logos/NEOM.svg',
  '/Client Logos/EIB.svg',
  '/Client Logos/Aramco.svg',
  '/Client Logos/DXB.svg',
  '/Client Logos/Gucci.svg',
  '/Client Logos/Cadillac.svg',
  '/Client Logos/IQ.svg',
  '/Client Logos/KFH.svg',
  '/Client Logos/CFJ.svg',
  '/Client Logos/Aroya.svg',
  '/Client Logos/Chevrolet.svg',
  '/Client Logos/Olayan.svg',
  '/Client Logos/Kia.svg',
  '/Client Logos/Entertainer.svg',
  '/Client Logos/ACDelco.svg',
  '/Client Logos/GM.svg',
  '/Client Logos/KDC.svg',
  '/Client Logos/Darna.svg',
];

// Install: pre-cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static assets; network-first for HTML
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Network-first for the HTML page so updates are always picked up
  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else (assets, fonts, images, video)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
