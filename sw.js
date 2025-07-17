const CACHE_NAME = 'capibara-virtual-v5.0';
const STATIC_CACHE = 'capibara-static-v5.0';
const DYNAMIC_CACHE = 'capibara-dynamic-v5.0';

const STATIC_FILES = [
    './',
    './index_final.html',
    './style_final.css?v=5.0',
    './script_final.js?v=5.0',
    './manifest.json',
    './icon-192x192.png',
    './icon-512x512.png'
];

const DYNAMIC_FILES = [
    './capibara_normal.png',
    './capibara_feliz.png',
    './capibara_triste.png',
    './capibara_enfermo.png',
    './capibara_durmiendo.png',
    './capibara_saltando.png',
    './capibara_purple.png',
    './capibara_purple_feliz.png',
    './capibara_purple_triste.png',
    './capibara_purple_enfermo.png',
    './capibara_purple_durmiendo.png',
    './capibara_violet.png',
    './capibara_violet_feliz.png',
    './capibara_violet_triste.png',
    './capibara_violet_enfermo.png',
    './capibara_violet_durmiendo.png',
    'https://unpkg.com/lottie-web@5.7.4/build/player/lottie.min.js'
];

// Instalar el service worker
self.addEventListener('install', function(event) {
    console.log('Service Worker: Instalando versión', CACHE_NAME);
    
    event.waitUntil(
        Promise.all([
            // Cache de archivos estáticos (críticos)
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Service Worker: Cacheando archivos estáticos');
                return cache.addAll(STATIC_FILES.map(url => {
                    return new Request(url, { 
                        cache: 'reload',
                        mode: 'cors',
                        credentials: 'same-origin'
                    });
                }));
            }),
            
            // Cache de archivos dinámicos (imágenes, etc.)
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('Service Worker: Cacheando archivos dinámicos');
                return Promise.allSettled(
                    DYNAMIC_FILES.map(url => {
                        return cache.add(new Request(url, { 
                            cache: 'reload',
                            mode: 'cors',
                            credentials: 'same-origin'
                        })).catch(err => {
                            console.warn('No se pudo cachear:', url, err);
                        });
                    })
                );
            })
        ]).then(() => {
            console.log('Service Worker: Instalación completada');
            return self.skipWaiting(); // Activar inmediatamente
        })
    );
});

// Activar el service worker
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activando versión', CACHE_NAME);
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    // Eliminar caches antiguos pero mantener los de la versión actual
                    if (cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE && 
                        cacheName !== CACHE_NAME) {
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

// Estrategia de fetch optimizada
self.addEventListener('fetch', function(event) {
    const request = event.request;
    const url = new URL(request.url);
    
    // Solo manejar requests HTTP/HTTPS
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Estrategia diferente según el tipo de recurso
    if (STATIC_FILES.some(file => request.url.includes(file.replace('./', '')))) {
        // Archivos estáticos: Cache First con Network Fallback
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    } else if (DYNAMIC_FILES.some(file => request.url.includes(file))) {
        // Archivos dinámicos: Cache First con Network Fallback
        event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
    } else if (request.destination === 'document') {
        // Páginas HTML: Network First con Cache Fallback
        event.respondWith(networkFirstStrategy(request));
    } else {
        // Otros recursos: Network First con Cache Fallback
        event.respondWith(networkFirstStrategy(request));
    }
});

// Estrategia Cache First
async function cacheFirstStrategy(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            // Actualizar en background si es necesario
            updateCacheInBackground(request, cache);
            return cachedResponse;
        }
        
        // Si no está en cache, buscar en red
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache First Strategy failed:', error);
        
        // Fallback para páginas
        if (request.destination === 'document') {
            const cache = await caches.open(STATIC_CACHE);
            return cache.match('./index_final.html') || new Response('Página no disponible offline', {
                status: 404,
                statusText: 'Not Found'
            });
        }
        
        return new Response('Recurso no disponible', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

// Estrategia Network First
async function networkFirstStrategy(request) {
    try {
        // Intentar red primero con timeout
        const networkResponse = await Promise.race([
            fetch(request, { cache: 'no-cache' }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Network timeout')), 3000)
            )
        ]);
        
        if (networkResponse && networkResponse.status === 200) {
            // Guardar en cache dinámico
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', request.url);
        
        // Buscar en todos los caches
        const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, CACHE_NAME];
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const cachedResponse = await cache.match(request);
            
            if (cachedResponse) {
                return cachedResponse;
            }
        }
        
        // Fallback final
        if (request.destination === 'document') {
            const cache = await caches.open(STATIC_CACHE);
            return cache.match('./index_final.html') || new Response('Aplicación no disponible offline', {
                status: 503,
                statusText: 'Service Unavailable'
            });
        }
        
        return new Response('Recurso no disponible offline', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

// Actualizar cache en background
async function updateCacheInBackground(request, cache) {
    try {
        const networkResponse = await fetch(request, { cache: 'no-cache' });
        
        if (networkResponse && networkResponse.status === 200) {
            await cache.put(request, networkResponse.clone());
            console.log('Cache actualizado en background:', request.url);
        }
    } catch (error) {
        console.log('No se pudo actualizar cache en background:', error);
    }
}

// Manejar mensajes del cliente
self.addEventListener('message', function(event) {
    const data = event.data;
    
    if (data && data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (data && data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ 
            version: CACHE_NAME,
            static: STATIC_CACHE,
            dynamic: DYNAMIC_CACHE
        });
    } else if (data && data.type === 'CLEAR_CACHE') {
        // Limpiar cache específico si se solicita
        caches.delete(data.cacheName || DYNAMIC_CACHE).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    } else if (data && data.type === 'FORCE_UPDATE') {
        // Forzar actualización de todos los caches
        Promise.all([
            caches.delete(STATIC_CACHE),
            caches.delete(DYNAMIC_CACHE)
        ]).then(() => {
            self.registration.update();
            event.ports[0].postMessage({ success: true });
        });
    }
});

// Manejar errores
self.addEventListener('error', function(event) {
    console.error('Service Worker: Error:', event.error);
});

// Manejar promesas rechazadas
self.addEventListener('unhandledrejection', function(event) {
    console.error('Service Worker: Promesa rechazada:', event.reason);
    event.preventDefault();
});

// Notificar al cliente sobre actualizaciones disponibles
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        self.registration.update().then(() => {
            event.ports[0].postMessage({ 
                updateAvailable: self.registration.waiting !== null 
            });
        });
    }
});

// Limpiar caches antiguos periódicamente
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            // Mantener solo los últimos 3 caches para evitar acumulación
            const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, CACHE_NAME];
            const oldCaches = cacheNames.filter(name => 
                name.startsWith('capibara-') && !validCaches.includes(name)
            );
            
            if (oldCaches.length > 3) {
                const cachesToDelete = oldCaches.slice(0, -3);
                return Promise.all(
                    cachesToDelete.map(cacheName => {
                        console.log('Limpiando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            }
        })
    );
});

// Precargar recursos críticos cuando hay ancho de banda disponible
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'PRELOAD_RESOURCES') {
        const resources = event.data.resources || [];
        
        caches.open(DYNAMIC_CACHE).then(cache => {
            resources.forEach(url => {
                fetch(url).then(response => {
                    if (response && response.status === 200) {
                        cache.put(url, response);
                    }
                }).catch(err => {
                    console.log('No se pudo precargar:', url);
                });
            });
        });
    }
});

console.log('Service Worker: Cargado correctamente - Versión', CACHE_NAME);
