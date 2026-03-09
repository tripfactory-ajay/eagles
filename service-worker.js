const CACHE = 'eagles-v9';
const ASSETS = [
  '/eagles/',
  '/eagles/index.html',
  '/eagles/style.css',
  '/eagles/app.js',
  '/eagles/firebase-config.js',
  '/eagles/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('push', e => {
  const d = e.data?.json() || { title: 'Eagles 🦅', body: 'New family memory!' };
  e.waitUntil(
    self.registration.showNotification(d.title, {
      body: d.body,
      icon: '/eagles/assets/icons/icon-192.png',
      badge: '/eagles/assets/icons/icon-192.png'
    })
  );
});
