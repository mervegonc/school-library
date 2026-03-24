// Service Worker — Cache devre dışı, her zaman ağdan al
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  // Tüm eski cache'leri temizle
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
  self.clients.claim();
});
// Hiçbir şeyi cache'leme, her zaman ağdan al
self.addEventListener('fetch', () => {});
