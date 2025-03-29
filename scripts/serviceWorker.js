const MY_HOST = "app.host.domain";

const CACHE_VERSION_NAME = "cache-v1.0";
 
const CACHE_LIST = [
    "/favicon.ico",
    "/index.html",
    "/webmanifest.json",

    "/images/app_icon_16x16.png",
    "/images/app_icon_32x32.png",
    "/images/app_icon_48x48.png",
    "/images/app_icon_144x144.png",
    "/images/app_icon_167x167.png",
    "/images/app_icon_180x180.png",
    "/images/app_icon_192x192.png",
    "/images/app_icon_512x512.png",

    "/lotties/menu_and_back_btn.json",
    "/lotties/menu_and_close_btn.json",
    "/lotties/loading_circle.json",
    "/lotties/ptr_indic.json",
    "/lotties/progress_bar.json",

    "/styles/estreUi.css",
    "/styles/main.css",

    "/scripts/serviceWorker.js",
    "https://code.jquery.com/jquery-3.7.1.js",
    "https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs",
    "/scripts/jcodd.js",
    "/scripts/modernism.js",
    "/scripts/alienese.js",
    "/scripts/estreU0EEOZ.js",
    "/scripts/estreUi.js",
    "/scripts/main.js",

    "/vectors/more_vertical_slim_icon.svg",
    "/vectors/app_icon.svg",

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
            if (event.request.url.indexOf(MY_HOST) < 0) {
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

self.addEventListener("message", async (event) => {
    let response = null;
    switch (event.data.type) {
        case "clearCache":
            response = await caches.delete(CACHE_NAME_BY_VERSION).then(() => {
                console.log("Cache cleared: ", CACHE_NAME_BY_VERSION);
            });
            break;
    }
    event.source.postMessage({ type: "worked", request: event.data, response });
});
