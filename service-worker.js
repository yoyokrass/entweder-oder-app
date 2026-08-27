const CACHE_NAME = "entweder-oder-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icons/icon-512.png"
];


// Beim ersten Installieren:
// App-Dateien lokal speichern
self.addEventListener("install", function (event) {

    event.waitUntil(

        caches.open(CACHE_NAME).then(function (cache) {

            return cache.addAll(APP_FILES);

        })

    );

});


// Alten Cache entfernen,
// falls wir später eine neue Version erstellen
self.addEventListener("activate", function (event) {

    event.waitUntil(

        caches.keys().then(function (cacheNames) {

            return Promise.all(

                cacheNames.map(function (cacheName) {

                    if (cacheName !== CACHE_NAME) {

                        return caches.delete(cacheName);

                    }

                })

            );

        })

    );

});


// Beim Laden zuerst Netzwerk versuchen.
// Falls kein Internet vorhanden ist,
// lokale Kopie verwenden.
self.addEventListener("fetch", function (event) {

    event.respondWith(

        fetch(event.request)

            .then(function (response) {

                return response;

            })

            .catch(function () {

                return caches.match(event.request);

            })

    );

});