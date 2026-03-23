const CACHE = 'kutuphane-v1';
const ASSETS = [
  '/school-library/',
  '/school-library/index.html',
  '/school-library/css/style.css',
  '/school-library/js/config.js',
  '/school-library/js/storage.js',
  '/school-library/js/auth.js',
  '/school-library/js/books.js',
  '/school-library/js/loans.js',
  '/school-library/js/students.js',
  '/school-library/js/reports.js',
  '/school-library/js/app.js',
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
