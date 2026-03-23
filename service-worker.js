const CACHE = 'kutuphane-v1';
const ASSETS = [
  '/school-library/',
  '/school-library/index.html',
  '/school-library/style.css',
  '/school-library/config.js',
  '/school-library/storage.js',
  '/school-library/auth.js',
  '/school-library/books.js',
  '/school-library/loans.js',
  '/school-library/students.js',
  '/school-library/reports.js',
  '/school-library/app.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('googleapis') || e.request.url.includes('github.com')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/school-library/index.html')))
  );
});
