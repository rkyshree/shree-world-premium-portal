const CACHE_NAME = "rkyadav-pwa-v4";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json"
];


/* =====================================================
   INSTALL
===================================================== */

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
    );

    // New Service Worker ko turant activate kare
    self.skipWaiting();

});


/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))

            );

        })

    );

    // Sabhi open pages par naya SW turant control le
    self.clients.claim();

});


/* =====================================================
   FETCH
===================================================== */

self.addEventListener("fetch", event => {

    const request = event.request;

    // Sirf GET requests handle kare
    if (request.method !== "GET") {
        return;
    }


    /* =================================================
       HTML / PAGE
    ================================================= */

    if (request.mode === "navigate") {

        event.respondWith(

            fetch(request)

                .then(response => {

                    const copy = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(request, copy);
                        });

                    return response;

                })

                .catch(() => {

                    return caches.match(request)
                        .then(response => {

                            return response ||
                                   caches.match("./index.html");

                        });

                })

        );

        return;

    }


    /* =================================================
       OTHER FILES
    ================================================= */

    event.respondWith(

        caches.match(request)

            .then(cached => {

                if (cached) {
                    return cached;
                }


                return fetch(request)

                    .then(response => {

                        // Valid response ko cache kare
                        if (
                            response &&
                            response.status === 200 &&
                            response.type !== "opaque"
                        ) {

                            const copy = response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, copy);
                                });

                        }

                        return response;

                    });

            })

    );

});
