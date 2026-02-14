/*
  Service Worker for caching media from Firebase Storage and other remote sources.
  - Cache-first strategy for images, videos, and audio.
  - New: small video/audio are cached as full files and Range requests are served from cache.
*/

const SW_VERSION = 'v2';
const MEDIA_CACHE = `media-cache-${SW_VERSION}`;

// Max size (bytes) to fully cache video/audio. Adjust as needed.
// Default ~25 MB
const MAX_MEDIA_BYTES = 1024 * 1024 * 1024;

const FIREBASE_HOSTS = new Set([
    'firebasestorage.googleapis.com',
    'storage.googleapis.com',
]);

self.addEventListener('install', (event) => {
    // Activate immediately on install
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            // Claim clients so the SW starts controlling pages immediately
            await self.clients.claim();
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter((k) => !k.startsWith('media-cache-') || k !== MEDIA_CACHE)
                    .map((k) => caches.delete(k))
            );
        })()
    );
});

function isMediaRequest(request) {
    // Prefer the Request.destination hint when available
    const dest = request.destination;
    if (dest === 'image' || dest === 'video' || dest === 'audio') return true;

    // Fallback by extension in URL
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();
    if (/(\.(png|jpg|jpeg|gif|webp|avif|svg|mp4|webm|ogv|mov|m4v|mp3|wav|ogg|m4a|aac))$/.test(pathname)) {
        return true;
    }

    // Heuristic: Firebase hosts often serve media with token parameters
    if (FIREBASE_HOSTS.has(url.hostname)) {
        // We still limit to GET and non-Range below
        return true;
    }

    return false;
}

function parseRangeHeader(rangeHeader, total) {
    // Supports single range: bytes=start-end
    if (!rangeHeader || !rangeHeader.startsWith('bytes=')) return null;
    const s = rangeHeader.substring(6).trim();
    const [startStr, endStr] = s.split('-', 2);
    let start = startStr ? parseInt(startStr, 10) : NaN;
    let end = endStr ? parseInt(endStr, 10) : NaN;
    if (Number.isNaN(start)) {
        // suffix range: bytes=-N (last N bytes)
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

function partialResponseFromBuffer(buffer, range, contentType) {
    const {start, end} = range;
    const chunk = buffer.slice(start, end + 1);
    const headers = new Headers({
        'Content-Type': contentType || 'application/octet-stream',
        'Content-Range': `bytes ${start}-${end}/${buffer.byteLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunk.byteLength),
    });
    return new Response(chunk, {status: 206, headers});
}

async function headContentLength(url) {
    try {
        const r = await fetch(url, {method: 'HEAD'});
        if (!r.ok) return null;
        const len = r.headers.get('Content-Length');
        return len ? parseInt(len, 10) : null;
    } catch (_) {
        return null;
    }
}

self.addEventListener('fetch', (event) => {
    const {request} = event;
    if (request.method !== 'GET') return; // only cache GET

    const hasRange = request.headers.has('range');
    if (!isMediaRequest(request)) {
        return; // not a media request
    }

    event.respondWith(
        (async () => {
            const cache = await caches.open(MEDIA_CACHE);
            // Use URL as the cache key; we intentionally ignore Range header for keying full file
            const url = new URL(request.url);
            const cacheKey = new Request(url.toString(), {method: 'GET'});

            // If we already have a full cached response, serve from it
            const existing = await cache.match(cacheKey, {ignoreSearch: false});

            if (existing) {
                // For images or non-range requests, return cached as-is
                if (!hasRange || request.destination === 'image') {
                    return existing;
                }
                // Range requested: synthesize partial from full cached body when possible
                try {
                    const totalBuf = await existing.clone().arrayBuffer();
                    const total = totalBuf.byteLength;
                    const ct = existing.headers.get('Content-Type') || request.headers.get('Accept') || '';
                    const range = parseRangeHeader(request.headers.get('Range'), total);
                    if (!range) return existing; // fallback to full if parsing failed
                    return partialResponseFromBuffer(totalBuf, range, ct);
                } catch (_) {
                    // If anything fails, fall back to network
                }
            }

            // No existing cache entry
            try {
                // If Range requested for video/audio, attempt to prefetch full when small enough
                const isImage = request.destination === 'image';
                if (hasRange && !isImage) {
                    const contentLen = await headContentLength(url.toString());
                    if (contentLen != null && contentLen <= MAX_MEDIA_BYTES) {
                        const full = await fetch(url.toString(), {method: 'GET'});
                        if (full.ok && full.type !== 'opaque') {
                            // Cache full response
                            await cache.put(cacheKey, full.clone());
                            // Build partial from cached/full body
                            const totalBuf = await full.clone().arrayBuffer();
                            const range = parseRangeHeader(request.headers.get('Range'), totalBuf.byteLength);
                            const ct = full.headers.get('Content-Type') || '';
                            if (range) {
                                return partialResponseFromBuffer(totalBuf, range, ct);
                            }
                            return full;
                        }
                    }
                    // Fallback: just fetch the ranged request normally
                    return fetch(request);
                }

                // Non-range media request: cache-first
                const networkResp = await fetch(request);
                if (networkResp && (networkResp.status === 200 || networkResp.type === 'opaque')) {
                    try {
                        // For image: cache as-is. For video/audio: only cache if size is <= MAX_MEDIA_BYTES or unknown
                        let shouldCache = true;
                        if (request.destination === 'video' || request.destination === 'audio') {
                            // Try to determine size
                            let total = parseInt(networkResp.headers.get('Content-Length') || '0', 10);
                            if (Number.isFinite(total) && total > 0) {
                                shouldCache = total <= MAX_MEDIA_BYTES;
                            }
                        }
                        if (shouldCache) {
                            await cache.put(cacheKey, networkResp.clone());
                        }
                    } catch (_) {
                        // ignore caching errors
                    }
                }
                return networkResp;
            } catch (e) {
                // Network failed and no cache available; just throw
                throw e;
            }
        })()
    );
});
