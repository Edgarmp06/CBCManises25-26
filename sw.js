const CACHE_NAME = 'cbc-manises-v4';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/js/app.js',
    '/js/ui.js',
    '/js/utils.js',
    '/js/config.js',
    '/js/partidos.js',
    '/js/actas.js',
    '/js/estadisticas.js',
    '/js/admin.js',
    '/js/constants.js',
    '/js/anotaciones.js',
    '/js/clasificacion.js',
    '/js/eventBus.js',
    '/logos/cbc-manises.jpg',
    '/imagenes/fondo1.jpg',
    '/imagenes/fondo2.jpg',
    '/imagenes/fondo3.jpg',
    '/imagenes/fondo4.jpg',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Instalar Service Worker y cachear recursos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cacheando recursos críticos...');
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
        }).then(() => self.clients.claim())
    );
});

// Estrategia de Cache First con actualización en segundo plano
self.addEventListener('fetch', event => {
    // Si es una petición a Firebase, no cachear desde el SW (Firebase tiene su propio offline)
    if (event.request.url.includes('firebasejs') || event.request.url.includes('firestore.googleapis')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Si está en ASSETS, intentamos actualizar la caché en segundo plano (Stale-While-Revalidate)
                    // pero devolvemos la versión cacheada inmediatamente para velocidad y offline
                    const isStaticAsset = ASSETS.some(asset =>
                        event.request.url.endsWith(asset) || event.request.url === asset
                    );

                    if (isStaticAsset) {
                        fetch(event.request).then(response => {
                            if (response.ok) {
                                caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
                            }
                        }).catch(() => { }); // Fallo silencioso si no hay red
                    }

                    return cachedResponse;
                }

                // Si no está en caché, ir a la red
                return fetch(event.request).then(response => {
                    // Si el recurso es exitoso, lo guardamos si es parte de nuestros assets o es una imagen/script importante
                    if (response.ok && (
                        event.request.url.includes('cdn.tailwindcss.com') ||
                        event.request.url.includes('chart.js') ||
                        event.request.destination === 'image'
                    )) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                }).catch(() => {
                    // Si la red falla y no hay caché, intentamos devolver index.html para navegación
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});
