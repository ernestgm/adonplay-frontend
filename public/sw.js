/*
  Service Worker Optimizado para Media (Firebase Storage)
  - Estrategia: Cache-First.
  - Memoria: Uso de Blobs para evitar colapsos de RAM.
  - Ahorro: Normalización de URLs para evitar duplicados por tokens.
  - Eficiencia: Eliminación de peticiones HEAD innecesarias.
*/

const SW_VERSION = 'v3';
const MEDIA_CACHE = `media-cache-${SW_VERSION}`;

// Límite de seguridad para caché (100MB es más seguro que 1GB para navegadores móviles)
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

/**
 * Normaliza la URL para usarla como clave de caché.
 * Elimina tokens de Firebase (?token=...) para que si la imagen es la misma,
 * se sirva desde caché aunque el token de acceso haya cambiado.
 */
function getCacheKey(request) {
    const url = new URL(request.url);
    if (FIREBASE_HOSTS.has(url.hostname)) {
        return url.origin + url.pathname; // Solo origen + ruta, ignoramos query params
    }
    return request.url;
}

function isMediaRequest(request) {
    const dest = request.destination;
    if (dest === 'image' || dest === 'video' || dest === 'audio') return true;

    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();
    return /(\.(png|jpg|jpeg|gif|webp|avif|svg|mp4|webm|ogv|mov|m4v|mp3|wav|ogg|m4a|aac))$/.test(pathname);
}

/**
 * Procesa peticiones parciales (Range) usando Blobs en lugar de ArrayBuffers.
 * Esto es mucho más eficiente en el uso de memoria RAM.
 */
function partialResponseFromBlob(blob, range, contentType) {
    const {start, end} = range;
    const chunk = blob.slice(start, end + 1);
    const headers = new Headers({
        'Content-Type': contentType || 'application/octet-stream',
        'Content-Range': `bytes ${start}-${end}/${blob.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunk.size),
    });
    return new Response(chunk, {status: 206, headers});
}

function parseRangeHeader(rangeHeader, total) {
    if (!rangeHeader || !rangeHeader.startsWith('bytes=')) return null;
    const s = rangeHeader.substring(6).trim();
    const [startStr, endStr] = s.split('-', 2);
    let start = startStr ? parseInt(startStr, 10) : NaN;
    let end = endStr ? parseInt(endStr, 10) : NaN;

    if (Number.isNaN(start)) {
        const n = Number.isNaN(end) ? 0 : end;
        if (!total || n <= 0) return null;
        start = Math.max(0, total - n);
        end = total - 1;
    } else {
        if (Number.isNaN(end) || end >= total) end = total - 1;
    }
    if (start < 0 || end < start || (total != null && start >= total)) return null;
    return {start, end};
}

self.addEventListener('fetch', (event) => {
    const {request} = event;
    if (request.method !== 'GET' || !isMediaRequest(request)) return;

    event.respondWith(
        (async () => {
            const cache = await caches.open(MEDIA_CACHE);
            const cacheKey = getCacheKey(request);

            // 1. Intentar buscar en caché (usando la URL normalizada)
            const cachedResponse = await cache.match(cacheKey);

            if (cachedResponse) {
                const hasRange = request.headers.has('range');
                // Si es imagen o no pide rango, devolver tal cual
                if (!hasRange || request.destination === 'image') {
                    return cachedResponse;
                }

                // 2. Si es video/audio y pide rango, sintetizar respuesta desde el caché
                try {
                    const blob = await cachedResponse.blob();
                    const range = parseRangeHeader(request.headers.get('range'), blob.size);
                    if (!range) return cachedResponse;
                    return partialResponseFromBlob(blob, range, cachedResponse.headers.get('content-type'));
                } catch (e) {
                    return fetch(request); // Fallback a red si falla el blob
                }
            }

            // 3. Si no está en caché, ir a la red
            try {
                // Hacemos el fetch normal (con sus tokens originales)
                const networkResponse = await fetch(request);

                // Si la respuesta es opaca o error, no podemos/debemos procesar rangos
                if (!networkResponse.ok && networkResponse.type !== 'opaque') {
                    return networkResponse;
                }

                // Clonamos para guardar en caché
                const responseToCache = networkResponse.clone();

                // Guardar en caché asíncronamente para no bloquear la respuesta
                event.waitUntil((async () => {
                    let shouldCache = true;
                    // Solo validar tamaño si la respuesta no es opaca (CORS habilitado)
                    if (networkResponse.type !== 'opaque') {
                        const size = parseInt(networkResponse.headers.get('content-length') || '0', 10);
                        if (size > MAX_MEDIA_BYTES) shouldCache = false;
                    }

                    if (shouldCache) {
                        await cache.put(cacheKey, responseToCache);
                    }
                })());

                return networkResponse;
            } catch (err) {
                throw err;
            }
        })()
    );
});