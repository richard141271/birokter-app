const CACHE_NAME = 'birokter-v2';
const ASSETS = [
  '/', 
  'index.html', 
  'login.html', 
  'register.html', 
  'dashboard.html',
  'bigard.html', 
  'ny-bigard.html', 
  'ny-bikube.html',
  'flytt-bikuber.html',
  'admin-lokasjoner.html',
  'bikuber.html', 
  'inspeksjon.html', 
  'inspeksjoner.html',
  'innstillinger.html', 
  'profil.html', 
  'profil-rediger.html',
  'kjop-honning.html', 
  'selg-honning.html',
  'assets/logo.png', 
  'manifest.json', 
  'header.js',
  'repository.js',
  'style.css'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // Take control immediately
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
      return r;
    }).catch(() => caches.match('index.html')))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('index.html'));
});
