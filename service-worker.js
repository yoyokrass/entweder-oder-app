const CACHE_NAME = "das-oder-das-v4";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",

    "./design/background.png",
    "./design/logo.png",
    "./design/leiste.png",

    "./icons/icon-512.png",
    "./icons/apple-touch-icon.png"
];


/* =========================================
   INSTALLIEREN
   ========================================= */

self.addEventListener("install", function (event) {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(FILES_TO_CACHE);
            })
    );

    self.skipWaiting();
});


/* =========================================
   AKTIVIEREN
   ========================================= */

self.addEventListener("activate", function (event) {

    event.waitUntil(
        caches.keys()
            .then(function (cacheNames) {

                return Promise.all(
                    cacheNames.map(function (cacheName) {

                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }

                    })
                );
            })
            .then(function () {
                return self.clients.claim();
            })
    );
});


/* =========================================
   DATEIEN LADEN
   ========================================= */

self.addEventListener("fetch", function (event) {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then(function (response) {

                const responseCopy =
                    response.clone();

                caches.open(CACHE_NAME)
                    .then(function (cache) {

                        cache.put(
                            event.request,
                            responseCopy
                        );
                    });

                return response;
            })
            .catch(function () {

                return caches.match(
                    event.request
                );
            })
    );
});