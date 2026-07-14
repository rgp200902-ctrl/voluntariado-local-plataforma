const CACHE_NAME = 'voluntariado-v2';
const STATIC_CACHE = 'voluntariado-static-v2';
const PAGES_CACHE = 'voluntariado-pages-v2';

const urlsToCache = [
    '/',
    '/oportunidades/',
    '/sobre/',
    '/contacto/',
    '/static/css/custom.css',
    '/static/manifest.json',
    '/static/icons/icon-192.png',
    '/static/icons/icon-512.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== STATIC_CACHE && name !== PAGES_CACHE)
                    .map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (event.request.method !== 'GET') return;

    if (url.pathname.startsWith('/oportunidades/') && url.pathname !== '/oportunidades/') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(PAGES_CACHE).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request).then(response => {
                    if (!response || response.status !== 200 || response.type === 'opaque') return response;
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then(cache => cache.put(event.request, clone));
                    return response;
                });
            })
            .catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('/offline/');
                }
            })
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SAVE_OPPORTUNITY') {
        const opportunity = event.data.opportunity;
        caches.open(PAGES_CACHE).then(cache => {
            const html = generateOfflinePage(opportunity);
            const response = new Response(html, { headers: { 'Content-Type': 'text/html' } });
            cache.put(`/oportunidades/${opportunity.id}/`, response);
        });
    }

    if (event.data && event.data.type === 'GET_SAVED_OPPORTUNITIES') {
        caches.open(PAGES_CACHE).then(cache => {
            cache.keys().then(keys => {
                const opportunities = keys
                    .filter(req => req.url.includes('/oportunidades/') && req.url !== '/oportunidades/')
                    .map(req => {
                        const id = req.url.split('/oportunidades/')[1]?.replace('/', '');
                        return id ? { id: id, url: req.url } : null;
                    })
                    .filter(Boolean);
                event.source.postMessage({ type: 'SAVED_OPPORTUNITIES', opportunities });
            });
        });
    }
});

function generateOfflinePage(opp) {
    return `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${opp.titulo} - Offline</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
</head>
<body style="background:#f8f9fa;">
    <nav class="navbar navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand fw-bold" href="/"><i class="bi bi-people-fill me-2"></i>Voluntariado Local</a>
            <span class="badge bg-warning text-dark"><i class="bi bi-wifi-off me-1"></i>Offline</span>
        </div>
    </nav>
    <div class="container py-5">
        <div class="card shadow-sm border-0">
            <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h3 class="fw-bold">${opp.titulo}</h3>
                    <span class="badge bg-info">Guardado offline</span>
                </div>
                <p class="text-muted mb-1"><i class="bi bi-building me-1"></i>${opp.instituicao}</p>
                <p class="text-muted mb-3"><i class="bi bi-geo-alt me-1"></i>${opp.local || 'Portugal'}</p>
                <hr>
                <p>${opp.descricao}</p>
                <div class="alert alert-info mt-3">
                    <i class="bi bi-info-circle me-1"></i>
                    Esta oportunidade foi guardada para visualização offline. Conecta-te à internet para te inscreveres.
                </div>
                <a href="/oportunidades/" class="btn btn-primary">Ver outras oportunidades</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}
