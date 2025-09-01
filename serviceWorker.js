const INSTALLATION_VERSION_NAME = "0.8.0-r20250901";
// ^^ Use for check new update "Native application(webview) version - PWA release version"
 
const INSTALLATION_FILE_LIST = [
    "/favicon.ico",
    "/index.html",
    "/serviceWorker.js",
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

    "https://code.jquery.com/jquery-3.7.1.js",
    "https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs",
    "/scripts/jcodd.js",
    "/scripts/modernism.js",
    "/scripts/alienese.js",
    "/scripts/estreU0EEOZ.js",
    "/scripts/estreUi.js",
    "/scripts/main.js",

    "/vectors/app_icon.svg",
    "/vectors/more_vertical_slim_icon.svg",

];

const CHECK_ALWAYS_NEWER_FILE_LIST = [
    "/serviceWorker.js",
];

self.addEventListener("install", (event) => {
    console.log("Service Worker - Install service worker with cache list" + INSTALLATION_VERSION_NAME);
    // vv When use for force installing the new service worker always (not recommended)
    //self.skipWaiting();
    event.waitUntil(
        caches.open(INSTALLATION_VERSION_NAME).then((cache) => cache.addAll(INSTALLATION_FILE_LIST))
    );
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker - Begin service worker with " + INSTALLATION_VERSION_NAME);
    event.waitUntil(
        caches.keys().then((keyList) =>
            Promise.all(
                keyList.map((key) => {
                    if (INSTALLATION_VERSION_NAME !== key) {
                        console.log("Service Worker - Clear older cached - " + key);
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    // vv When use for force alternate the fetch interceptor of new service worker without reload page always (not recommended)
    // event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    const urlString = event.request.url;
    const url = new URL(urlString);
    const pathname = url.pathname;
    if (CHECK_ALWAYS_NEWER_FILE_LIST.find(it => pathname.endsWith(it))) {
        event.respondWith(
            fetch(event.request).catch(async (error) => {
                console.log("Service Worker - Return cached file by error on fetch: ", event.request.url);
                return (await caches.match(event.request)) ?? error;
            })
        );
    } else if (INSTALLATION_FILE_LIST.find(it => urlString.includes(it))) {
        event.respondWith((async () => {
            // console.log("Service Worker - Fetch intercepted for: ", urlString);
            // Try to get the response from a cache.
            const cachedResponse = await caches.match(event.request);
            // Return it if we found one.
            if (cachedResponse) {
                console.log("Service Worker - Return cached file: ", event.request.url);
                return cachedResponse;
            } else {
                // If we didn't find a match in the cache, use the network.
                console.log("Service Worker - Not in cache list, try fetch directly: ", event.request.url);
                return fetch(event.request).catch(async (error) => {
                    console.log("Service Worker - Return cached file by error on fetch: ", event.request.url);
                    return (await caches.match(event.request)) ?? error;
                });
            }
        })());
    }
});

self.addEventListener("message", async (event) => {
    let response = null;
    switch (event.data.type) {
        case "SKIP_WAITING":
            console.log('Service Worker: SKIP_WAITING received');
            self.skipWaiting();
            // Never call source for alternate old service worker
            return;

        case "CLIENTS_CLAIM":
            console.log('Service Worker: CLIENTS_CLAIM received');
            self.clients.claim();
            // Never call source for alternate old service worker
            return;

        case "clearCache":
            response = await caches.delete(INSTALLATION_VERSION_NAME).then(() => {
                console.log("Cache cleared: ", INSTALLATION_VERSION_NAME);
            });
            break;

        case "getVersion":
            response = INSTALLATION_VERSION_NAME;
            break;

        case "getApplicationCount":
            response = await self.clients.matchAll({
                includeUncontrolled: false,
                type: 'window'
            }).then(clients => clients.length);
            break;
    }
    event.source.postMessage({ type: "worked", request: event.data, response });
});
