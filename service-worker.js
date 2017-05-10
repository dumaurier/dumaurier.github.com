var cacheName = 'joshvogt-co';
var dataCacheName = 'stieb-v1';

var getPageURL = location;

var filesToCache = [
    '/manifest.json',
    '/service-worker.js',
    '/index.html',
    '/blog/critical-path-jekyll',
    '/blog/css-grid-layout-and-absolute-positioning',
    '/blog/css-grid-layout-grid-template-areas',
    '/blog/css-grid-layout-off-canvas-navigation',
    '/blog/layout-differences-between-css-grid-layout-and-multi-column',
    '/static-assets/css/base-fast.css',
    '/static-assets/images/grid-area.png',
    '/static-assets/js/bundle.js',
    '/static-assets/js/home.js'
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    // console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    // console.log('[Service Worker] Fetch', e.request.url);
    var dataUrl = '/blog/';
    if (e.request.url.indexOf(dataUrl) > -1) {
        /*
        * When the request URL contains dataUrl, the app is asking for fresh
        * weather data. In this case, the service worker always goes to the
        * network and then caches the response. This is called the "Cache then
        * network" strategy:
        * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
        */
        e.respondWith(
            caches.open(dataCacheName).then(function(cache) {
                return fetch(e.request).then(function(response){
                    cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
    } else {
        /*
        * The app is asking for app shell files. In this scenario the app uses the
        * "Cache, falling back to the network" offline strategy:
        * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
        */
        e.respondWith(
            caches.match(e.request).then(function(response) {
                return response || fetch(e.request);
            })
        );
    }
});
