const CACHE_NAME = 'todo-app-v2';

// 使用相对路径，适配 GitHub Pages 子目录
const urlsToCache = [
    './',
    './index.html',
    './manifest.json'
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

// 拦截请求 - 优先使用缓存，支持离线
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 缓存命中直接返回
                if (response) {
                    return response;
                }
                
                // 尝试网络请求
                return fetch(event.request)
                    .then(networkResponse => {
                        // 缓存新请求
                        if (networkResponse && networkResponse.status === 200) {
                            const clone = networkResponse.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, clone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // 离线且没有缓存时，尝试返回默认页面
                        return caches.match('./index.html');
                    });
            })
    );
});
