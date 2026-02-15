const CACHE_NAME = 'todo-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// 安装时缓存
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('缓存打开');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('缓存失败:', err))
    );
    self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 拦截请求
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 缓存命中直接返回
                if (response) {
                    return response;
                }
                // 否则网络请求
                return fetch(event.request)
                    .catch(() => {
                        // 离线且没有缓存
                        return new Response('离线模式 - 请联网后刷新');
                    });
            })
    );
});
