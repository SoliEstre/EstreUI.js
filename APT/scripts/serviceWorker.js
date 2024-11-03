const CACHE_VERSION_NAME = "cache-v1.1";
 
const CACHE_LIST = [
    "favicon.ico",
    "webmanifest.json",

    "/images/APT_16.png",
    "/images/APT_32.png",
    "/images/APT_48.png",
    "/images/APT_144.png",
    "/images/APT_152.png",
    "/images/APT_167.png",
    "/images/APT_180.png",
    "/images/APT_192.png",
    "/images/APT_512.png",

    "/lotties/menu_and_back_btn.json",
    "/lotties/loading_circle_pink.json",
    "/lotties/ptr_indic.json",

    "/styles/estreUi.css",
    "styles/apt.css",

    "scripts/serviceWorker.js",
    "https://code.jquery.com/jquery-3.7.1.js",
    "https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs",
    "/scripts/jcodd.js",
    "/scripts/estreUi.js",
    "scripts/apt.js",

];

self.addEventListener("install", (event) => {
    console.log("Install service worker with cache" + CACHE_VERSION_NAME);
    event.waitUntil(
        caches.open(CACHE_VERSION_NAME).then((cache) => cache.addAll(CACHE_LIST))
    );
});

self.addEventListener("activate", (event) => {
    console.log("Begin service worker with " + CACHE_VERSION_NAME);
    event.waitUntil(
        caches.keys().then((keyList) =>
            Promise.all(
                keyList.map((key) => {
                    if (CACHE_VERSION_NAME !== key) {
                        console.log("Clear older cached - " + key);
                        return caches.delete(key);
                    }
                })
            )
        )
    );
});

self.addEventListener("fetch", (event) => {
    console.log("Fetch intercepted for: ", event.request.url);
    event.respondWith(
        (async () => {
            if (event.request.url.indexOf("appparents.edudoc.co.kr") < 0) {
                // Try to get the response from a cache.
                const cachedResponse = await caches.match(event.request);
                // Return it if we found one.
                if (cachedResponse) {
                    console.log("Return cached file: ", event.request.url);
                    return cachedResponse;
                }
                // If we didn't find a match in the cache, use the network.
            }
            return fetch(event.request).catch((error) => {
                console.log("Return cached file by error on fetch: ", event.request.url);
                return caches.open(CACHE_VERSION_NAME).then((cache) => cache.match(event.request)) ?? error
            });
          })()
    );
});