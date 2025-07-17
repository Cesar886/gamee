const CACHE_NAME = 'capibara-virtual-v4.0';
const urlsToCache = [
    './',
    './index.html',
    './style.css?v=4.0',
    './script.js?v=4.0',
    './manifest.json',
    './capibara_normal.png',
    './capibara_feliz.png',
    './capibara_triste.png',
    './capibara_enfermo.png',
    './capibara_durmiendo.png',
    './capibara_saltando.png',
    './capibara_dorado.png',
    './capibara_dorado_feliz.png',
    './capibara_dorado_triste.png',
    './capibara_dorado_enfermo.png',
    './capibara_dorado_durmiendo.png',
    './capibara_rosa.png',
    './capibara_rosa_feliz.png',
    './capibara_rosa_triste.png',
    './capibara_rosa_enfermo.png',
    './capibara_rosa_durmiendo.png',
    './icon-192x192.png',
    './icon-512x512.png',
    'https://unpkg.com/lottie-web@5.7.4/build/player/lottie.min.js'
];

// Instalar el service worker y cachear los archivos
self.addEventListener('install', function(event) {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Service Worker: Cache abierto');
                return cache.addAll(urlsToCache.map(url => {
                    return new Request(url, { cache: 'reload' });
                }));
            })
            .then(() => {
                console.log('Service Worker: Todos los archivos cacheados');
                return self.skipWaiting(); // Activar inmediatamente
            })
    );
});

// Estrategia Network First con fallback a cache
self.addEventListener('fetch', function(event) {
    // Solo manejar requests HTTP/HTTPS
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        fetch(event.request, {
            cache: 'no-cache' // Siempre verificar la red primero
        })
        .then(function(response) {
            // Si la respuesta es válida, clonarla y guardarla en cache
            if (response && response.status === 200 && response.type === 'basic') {
                const responseToCache = response.clone();
                
                caches.open(CACHE_NAME)
                    .then(function(cache) {
                        cache.put(event.request, responseToCache);
                    });
            }
            
            return response;
        })
        .catch(function() {
            // Si la red falla, intentar servir desde cache
            return caches.match(event.request)
                .then(function(response) {
                    if (response) {
                        console.log('Service Worker: Sirviendo desde cache:', event.request.url);
                        return response;
                    }
                    
                    // Si no está en cache y es una página, servir index.html
                    if (event.request.destination === 'document') {
                        return caches.match('./index.html');
                    }
                    
                    // Para otros recursos, devolver una respuesta de error
                    return new Response('Recurso no disponible offline', {
                        status: 404,
                        statusText: 'Not Found'
                    });
                });
        })
    );
});

// Limpiar caches antiguos al activar
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activando...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activado y listo');
            return self.clients.claim(); // Tomar control inmediatamente
        })
    );
});

// Manejar mensajes del cliente
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Notificar al cliente sobre actualizaciones
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Manejar errores
self.addEventListener('error', function(event) {
    console.error('Service Worker: Error:', event.error);
});

// Manejar errores no capturados
self.addEventListener('unhandledrejection', function(event) {
    console.error('Service Worker: Promesa rechazada:', event.reason);
    event.preventDefault();
});