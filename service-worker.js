const CACHE_NAME = 'jirkuv-hlidac-v1';
const CACHE_URLS = [
  './',                // Hlavní stránka (root)
  './index.html',
  './manifest.json',
  './jirkuv-hlidac.js',
  './auth.js',
  './firebaseFunctions.js',
  './favicon-loader.js'
  // Pokud máš i CSS soubor (např. style.css), přidej ho sem na nový řádek!
];

// 1. INSTALACE: Uložení souborů do mezipaměti
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalace a ukládání do cache...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CACHE_URLS);
      })
  );
  self.skipWaiting(); // Okamžitá aktivace nového SW
});

// 2. AKTIVACE: Úklid starých cache (když změníš verzi CACHE_NAME)
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Aktivace a čištění staré cache...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Mazání staré cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Převezme kontrolu nad stránkou ihned
});

// 3. FETCH: Obsluha požadavků (Cache First - nejdřív cache, pak síť)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Pokud je soubor v cache, vrátíme ho (rychlost blesku!)
        if (response) {
          return response;
        }
        // Jinak si pro něj sáhneme na internet
        return fetch(event.request);
      })
  );
});
