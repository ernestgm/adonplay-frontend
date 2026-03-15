/*
  Service Worker Optimizado para Media (Firebase Storage) - FIXED 412
  - Estrategia: Cache-First.
  - Fix: Manejo de errores 412 (Precondition Failed) mediante limpieza de headers.
  - Memoria: Uso de Blobs para peticiones de rango (video/audio).
*/

const SW_VERSION = 'v4'; // Incrementamos versión por seguridad
const MEDIA_CACHE = `media-cache-${SW_VERSION}`;
const MAX_MEDIA_BYTES = 100 * 1024 * 1024;

const FIREBASE_HOSTS = new Set([
    'firebasestorage.googleapis.com',
    'storage.googleapis.com',
]);

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            await self.clients.claim();
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter((k) => k.startsWith('media-cache-') && k !== MEDIA_CACHE)
                    .map((k) => caches.delete(k))
            );
        })()
    );
});

function getCacheKey(request) {
    const url = new URL(request.url);
    if (FIREBASE_HOSTS.has(url.hostname)) {
        return url.origin + url.pathname;
    }
    return request.url;
}

function isMediaRequest(request) {
    const dest = request.destination;
    if (dest === 'image' || dest === 'video' || dest === 'audio') return true;
    const url = new URL(request.url);
    return /(\.(png|jpg|jpeg|gif|webp|avif|svg|mp4|webm|ogv|mov|m4v|mp3|wav|ogg|m4a|aac))$/.test(url.pathname.toLowerCase());
}

function partialResponseFromBlob(blob, range, contentType) {
    const {start, end} = range;
    const chunk = blob.slice(start, end + 1);
    return new Response(chunk, {
        status: 206,
        headers: {
            'Content-Type': contentType || 'application/octet-stream',
            'Content-Range': `bytes ${start}-${end}/${blob.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunk.size),
        },
    });
}

function parseRangeHeader(rangeHeader, total) {
    if (!rangeHeader || !rangeHeader.startsWith('bytes=')) return null;
    const s = rangeHeader.substring(6).trim();
    const [startStr, endStr] = s.split('-', 2);
    let start = parseInt(startStr, 10);
    let end = parseInt(endStr, 10);
    if (isNaN(start)) {
        start = total - end;
        end = total - 1;
    } else if (isNaN(end)) {
        end = total - 1;
    }
    return {start, end};
}

/**
 * Realiza un fetch robusto que maneja el error 412 eliminando validaciones del navegador.
 */
async function robustFetch(request) {
    let response = await fetch(request);

    // SI falla con 412, el navegador está enviando ETags viejos. Reintentamos limpio.
    if (response.status === 412) {
        const cleanHeaders = new Headers(request.headers);
        cleanHeaders.delete('If-Match');
        cleanHeaders.delete('If-None-Match');
        cleanHeaders.delete('If-Modified-Since');
        cleanHeaders.delete('If-Unmodified-Since');

        const cleanRequest = new Request(request.url, {
            method: request.method,
            headers: cleanHeaders,
            mode: request.mode,
            credentials: request.credentials,
            cache: 'reload' // Forzamos a ignorar el cache del navegador
        });

        response = await fetch(cleanRequest);
    }
    return response;
}

self.addEventListener('fetch', (event) => {
    const {request} = event;
    if (request.method !== 'GET' || !isMediaRequest(request)) return;

    event.respondWith(
        (async () => {
            const cache = await caches.open(MEDIA_CACHE);
            const cacheKey = getCacheKey(request);
            const cachedResponse = await cache.match(cacheKey);

            // 1. Si está en caché, servir (y manejar rangos si es video)
            if (cachedResponse) {
                const hasRange = request.headers.has('range');
                if (!hasRange || request.destination === 'image') {
                    return cachedResponse;
                }

                try {
                    const blob = await cachedResponse.blob();
                    const range = parseRangeHeader(request.headers.get('range'), blob.size);
                    return range
                        ? partialResponseFromBlob(blob, range, cachedResponse.headers.get('content-type'))
                        : cachedResponse;
                } catch (e) {
                    return robustFetch(request);
                }
            }

            // 2. Si no está en caché, ir a la red con el fetch robusto
            try {
                const networkResponse = await robustFetch(request);

                if (!networkResponse.ok && networkResponse.type !== 'opaque') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                event.waitUntil(
                    (async () => {
                        let shouldCache = true;
                        if (networkResponse.type !== 'opaque') {
                            const size = parseInt(networkResponse.headers.get('content-length') || '0', 10);
                            if (size > MAX_MEDIA_BYTES) shouldCache = false;
                        }
                        if (shouldCache) await cache.put(cacheKey, responseToCache);
                    })()
                );

                return networkResponse;
            } catch (err) {
                return new Response('Network error', {status: 408});
            }
        })()
    );
});