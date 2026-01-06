// service-worker.js для кэширования статики
const CACHE_NAME = 'detailed-answer-v1';
const STATIC_CACHE = 'static-v1';

// Файлы для кэширования
const STATIC_FILES = [
    '/',
    '/index.html',
    'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Установка Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_FILES))
            .then(() => self.skipWaiting())
    );
});

// Активация
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME && key !== STATIC_CACHE)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Перехват запросов
self.addEventListener('fetch', event => {
    // Для CDN файлов используем стратегию Cache First
    if (event.request.url.includes('cdn.jsdelivr.net') || 
        event.request.url.includes('cdnjs.cloudflare.com')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
        return;
    }
    
    // Для остальных файлов - Network First
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});
