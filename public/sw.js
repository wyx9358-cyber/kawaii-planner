self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('momo-time-v1').then((cache) =>
      cache.addAll(['/dashboard', '/schedule', '/calendar', '/analytics', '/tasks', '/settings'])
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const clone = response.clone();
      caches.open('momo-time-v1').then((cache) => cache.put(event.request, clone));
      return response;
    }).catch(() => cached))
  );
});
