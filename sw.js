const CACHE_NAME = 'cbc-manises-v3';
const ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './js/ui.js',
    './js/utils.js',
    './js/config.js',
    './js/partidos.js',
    './js/actas.js',
    './js/estadisticas.js',
    './js/admin.js',
    './js/constants.js',
    './logos/cbc-manises.jpg'
];

// Instalar Service Worker y cachear recursos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activar y limpiar caches antiguos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// Estrategia de Cache First para estáticos, Network First para otros
self.addEventListener('fetch', event => {
    // Si es una petición a Firebase, no cachear desde el SW (Firebase tiene su propio offline)
    if (event.request.url.includes('firebasejs') || event.request.url.includes('firestore.googleapis')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then(response => {
                    // Cachear nuevas respuestas de assets estáticos
                    if (response.ok && ASSETS.includes(new URL(event.request.url).pathname)) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                });
            })
    );
});
