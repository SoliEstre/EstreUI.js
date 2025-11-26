// Environment constants
let isStandalone = !!window.matchMedia("(display-mode: standalone)").matches;

const isMobile = navigator.userAgent.includes("Mobile");
const isIPhone = navigator.userAgent.includes("iPhone");
const isIPad = navigator.userAgent.includes("iPad");
const isIPod = navigator.userAgent.includes("iPod");
const isAppleMobile = isIPhone || isIPad || isIPod;
const isAndroid = navigator.userAgent.includes("Android");
const isAndroidMobile = isAndroid && isMobile;
const isSamsungBrowser = navigator.userAgent.includes("SamsungBrowser");
const isSamsungMobile = isSamsungBrowser && isMobile;


window.isLog = true;
window.isDebug = true;
window.isVerbose = false;
Object.defineProperty(window, "isLogging", {
    "get": function () { return this.isLog || this.isDebug; },
    configurable: true,
    enumerable: false,
});
Object.defineProperty(window, "isVerbosely", {
    "get": function () { return this.isDebug && this.isVerbose; },
    configurable: true,
    enumerable: false,
});

// Update viewport-fit for PWA
const updateInsets = function (e) {
    const isInit = e?.type === "init";
    const isOrientationChanged = e?.type === "orientationchange";

    const root = document.documentElement;
    const vvp = window.visualViewport;

    const width = window.innerWidth;
    const height = window.innerHeight;

    if (isIPhone || isSamsungBrowser) {
        root.style.setProperty("--viewport-width", `${width}px`);
        root.style.setProperty("--viewport-height", `${height}px`);
    } else {
        root.style.setProperty('--fvw', `${width}px`);
        root.style.setProperty('--fvh', `${height}px`);
    }

    const vvpw = vvp.width;
    const vvph = vvp.height;
    const vvpt = vvp.offsetTop;
    const vvpl = vvp.offsetLeft;
    const vvpb = vvph - height - vvpt;
    const vvpr = vvpw - width - vvpl;

    root.style.setProperty('--viewport-inset-top', `${vvpt}px`);
    if (vvpb > 1) root.style.setProperty('--viewport-inset-bottom', `${vvpb}px`);
    if (vvpl > 1) root.style.setProperty('--viewport-inset-left', `${vvpl}px`);
    if (vvpr > 1) root.style.setProperty('--viewport-inset-right', `${vvpr}px`);

    // const rootStyle = window.getComputedStyle(root);
    // const htmlWidth = rootStyle.getPropertyValue("width");
    // const htmlHeight = rootStyle.getPropertyValue("height");

    // try {
    //     note(`Top: ${vvp.pageTop}, Left: ${vvp.pageLeft}<br />\ndisplay-mode: ${isStandalone ? "standalone" : "browser"}<br />\ninner width: ${width}px, height: ${height}px<br />\nvisual width: ${vvpw}px, height: ${vvph}px<br />\nhtml width: ${htmlWidth}, height: ${htmlHeight}<br />\ntop: ${vvpt}px, bottom: ${vvpb}px, left: ${vvpl}px, right: ${vvpr}px`);
    // } catch (ex) {
    //     console.log("[" + ex.name + "]" + ex.message);
    // }
}

document.querySelector("meta[name='viewport']")?.remove();
if (isStandalone) {
    // is PWA
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "user-scalable=no, width=device-width, initial-scale=1, viewport-fit=cover";
    document.querySelector("head").append(meta);
} else {
    // isn't PWA
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "user-scalable=no, width=device-width, initial-scale=1";
    document.querySelector("head").append(meta);
}
if (isAppleMobile) {
    document.documentElement.style.setProperty('--viewport-inset-bottom', 'var(--safe-area-inset-bottom)');
}


const releaseInsetForApp = () => {
    const insets = window.safeAreaInsets;

    if (insets != null) {
        const root = document.documentElement;

        root.style.setProperty('--safe-area-inset-top', `${insets.top}px`);
        root.style.setProperty('--safe-area-inset-bottom', `${insets.bottom}px`);
        root.style.setProperty('--safe-area-inset-left', `${insets.left}px`);
        root.style.setProperty('--safe-area-inset-right', `${insets.right}px`);

        root.style.setProperty('--viewport-inset-top', `${insets.top}px`);
        root.style.setProperty('--viewport-inset-bottom', `${insets.bottom}px`);
        root.style.setProperty('--viewport-inset-left', `${insets.left}px`);
        root.style.setProperty('--viewport-inset-right', `${insets.right}px`);
    }
}

// Receive safe area from App when showing on webview
window.addEventListener('safeAreaInsetsChanged', function () {
    releaseInsetForApp();
});
releaseInsetForApp();


// Service Worker

const serviceWorkerHandler = {
    registeration: null,
    installing: null,
    waiting: null,
    activating: null,
    activated: null,
    isInitialSetup: null,

    get service() { return navigator.serviceWorker; },
    get controller() { return this.service?.controller; },
    get worker() { return this.controller ?? this.activated ?? this.activating ?? this.waiting ?? this.installing; },

    postMessage(worker, message, transfer) {
        (worker ?? this.worker)?.postMessage(message, transfer);
    },

    requestSequence: 0,
    requestCallback: {},
    get issueRequestSequence() {
        this.requestSequence++;
        return this.requestSequence;
    },

    onWaiting: null,
    onUpdated: null,
    onActivating: null,
    onActivatingNewer: null,
    onControllerChanged: null,
    onActivated: null,
    onActivatedNewer: null,

    init() {
        if (this.service != null) {
            this.service.onmessage = this.messageListener;
            this.service.oncontrollerchange = this.controllerChangeListener;
        }
    },

    async update() {
        if (this.registeration == null) return null;
        try {
            const reg = await this.registeration?.update();
            const worker = reg.installing ?? reg.waiting;
            if (worker == null) return false;
            else return worker;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    },

    setOnInstallingListener(listener) {
        this.onInstalling = listener;
    },

    registerationOnInstalling(worker) {
        this.installing = worker;
        this.onInstalling?.(worker);
    },

    setOnWaitingListener(listener) {
        this.onWaiting = listener;
    },

    registerationOnWaiting(worker) {
        this.waiting = worker;
        this.onWaiting?.(worker);
    },

    setOnUpdatedListener(listener) {
        this.onUpdated = listener;
    },

    registerationOnUpdated() {
        this.onUpdated?.();
    },

    setOnActivatingListener(listener) {
        this.onActivating = listener;
    },

    setOnActivatingNewerListener(listener) {
        this.onActivatingNewer = listener;
    },

    registerationOnActivating(worker, isNewer = false) {
        this.activating = worker;
        this.onActivating?.(worker);
        if (isNewer) this.onActivatingNewer?.(worker);
    },

    setOnActivatedListener(listener) {
        this.onActivated = listener;
    },

    setOnActivatedNewerListener(listener) {
        this.onActivatedNewer = listener;
    },

    registerationOnActivated(worker, isNewer = false) {
        this.activated = worker;
        this.onActivated?.(worker);
        if (isNewer) this.onActivatedNewer?.(worker);
    },

    setOnControllerChangeListener(listener) {
        this.onControllerChanged = listener;
    },

    controllerOnChanged(event) {
        this.onControllerChanged?.(event);
        if (this.isInitialSetup) this.isInitialSetup = false;
    },

    controllerChangeListener(event) {
        if (isVerbosely) console.log("Service Worker controller changed:", event, "\n", serviceWorkerHandler.service.controller);
        else if (isLogging) console.log("Service Worker controller changed:", event.scriptURL);
        serviceWorkerHandler.controllerOnChanged(event);
    },

    messageListener(event) {
        const data = event.data;
        switch (data.type) {
            case "worked":
                const sequence = data.request.sequence;
                if (sequence != null) {
                    const callback = serviceWorkerHandler.requestCallback[sequence];
                    if (callback != null) {
                        callback(data.response);
                        serviceWorkerHandler.requestCallback[sequence] = null;
                    }
                }
                break;

            default:
                if (isVerbosely) console.log("Received message with unknown type '" + event.data.type + "'", event);
                else if (isLogging) console.log("Received message with unknown type '" + event.data.type + "'");
                break;
        }
    },

    async sendRequest(type, content = {}, onSuccess, onError, worker = this.worker) {
        if (worker != null) {
            const sequence = this.issueRequestSequence;
            this.requestCallback[sequence] = onSuccess;
            this.postMessage(worker, { type, sequence, content });
        } else onError?.("Service Worker is not exist.");
    },

    sendRequestForWait(type, content = {}, worker = this.worker) {
        return new Promise((resolve, reject) => {
            this.sendRequest(type, content, resolve, reject, worker);
        });
    },

    skipWaiting(worker = this.waiting) {
        worker?.postMessage({ type: "SKIP_WAITING" });
    },

    clientsClaim(worker = this.activated) {
        worker?.postMessage({ type: "CLIENTS_CLAIM" });
    },

    async clearCache(worker = this.worker) {
        try {
            return await this.sendRequestForWait("clearCache", {}, worker);
        } catch (error) {
            console.error(error);
        }
    },

    async clearCommonCache(worker = this.worker) {
        try {
            return await this.sendRequestForWait("clearCommonCache", {}, worker);
        } catch (error) {
            console.error(error);
        }
    },

    async clearStaticCache(worker = this.worker) {
        try {
            return await this.sendRequestForWait("clearStaticCache", {}, worker);
        } catch (error) {
            console.error(error);
        }
    },

    async clearStonyCache(worker = this.worker) {
        try {
            return await this.sendRequestForWait("clearStonyCache", {}, worker);
        } catch (error) {
            console.error(error);
        }
    },

    async clearAllCaches(worker = this.worker) {
        try {
            return await this.sendRequestForWait("clearAllCaches", {}, worker);
        } catch (error) {
            console.error(error);
        }
    },

    async getVersion(worker = this.worker) {
        try {
            return await this.sendRequestForWait("getVersion", {}, worker);
        } catch (error) {
            console.error(error);
        }
    },

    getVersionWaiting() {
        return this.getVersion(this.waiting);
    },

    async getApplicationCount(worker = this.controller) {
        try {
            return worker != null ? await this.sendRequestForWait("getApplicationCount", {}, worker) : 0;
        } catch (error) {
            console.error(error);
        }
    },
};

serviceWorkerHandler.init();

if ("serviceWorker" in navigator) {
    const serviceWorkerOnInstalling = (worker) => {
        if (worker) {
            if (isLogging) console.log("Service Worker is installing:", worker.scriptURL);
            else if (isVerbosely) console.log("Service Worker is installing:", worker);
            serviceWorkerHandler.registerationOnInstalling(worker);
        }
    };

    const serviceWorkerOnWaiting = (worker) => {
        if (worker) {
            if (isLogging) console.log("Service Worker is waiting:", worker.scriptURL);
            else if (isVerbosely) console.log("Service Worker is waiting:", worker);
            serviceWorkerHandler.registerationOnWaiting(worker);
        }
    };

    const serviceWorkerOnActivating = (worker, isNewer = false) => {
        if (worker) {
            if (isLogging) console.log("Service Worker is activating:", worker.scriptURL);
            else if (isVerbosely) console.log("Service Worker is activating:", worker);
            serviceWorkerHandler.registerationOnActivating(worker, isNewer);
        }
    };

    const serviceWorkerOnActive = (worker, isNewer = false) => {
        if (worker) {
            if (isLogging) console.log("Service Worker is active:", worker.scriptURL);
            else if (isVerbosely) console.log("Service Worker is active:", worker);
            serviceWorkerHandler.registerationOnActivated(worker, isNewer);
        }
    };

    // window.addEventListener("load", () => {
    navigator.serviceWorker.register("./serviceWorker.js", {
        // scope: "/", // When use service worker file out of location of index.html, have to set scope with HTTP Server response Header 'Service-Worker-Allowed: /'
        updateViaCache: "none",

        // vv PWA required set HTTP server response headers vv
        // Cache-Control: no-cache
        // Pragma: no-cache
        // Expires: 0
    }).then(registration => {
        serviceWorkerHandler.registeration = registration;
        if (isLogging) console.log("Service Worker registered with scope:", registration.scope);

        serviceWorkerOnInstalling(registration.installing);
        serviceWorkerOnWaiting(registration.waiting);

        registration.addEventListener("statechange", () => {
            const activated = registration.active;
            const constoller = navigator.serviceWorker.controller;
            if (activated) {
                if (isLogging) console.log("Service Worker state changed to:", activated.state);
                serviceWorkerOnActive(registration.active, controller != null && activated != controller);
            }
        });

        serviceWorkerOnActive(registration.active);
        serviceWorkerHandler.isInitialSetup = registration.active == null;

        registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (isLogging) console.log("New Service Worker found:", newWorker.scriptURL);
            else if (isVerbosely) console.log("New Service Worker found:", newWorker);
            serviceWorkerOnInstalling(newWorker);

            newWorker.addEventListener("statechange", () => {
                if (isLogging) console.log("New Service Worker state changed to:", newWorker.state);
                switch (newWorker.state) {
                    case "installed":
                        if (isLogging) console.log("New Service Worker installed and waiting to activate.");
                        const controllerExist = navigator.serviceWorker.controller;
                        const isWaiting = registration.waiting == newWorker;
                        serviceWorkerHandler.registerationOnUpdated();
                        if (isWaiting) {
                            if (controllerExist) {
                                serviceWorkerOnWaiting(newWorker);
                            } else {
                                // do nothing (first install)
                            }
                        }
                        break;

                    case "activating":
                        serviceWorkerOnActivating(newWorker, true);
                        break;

                    case "activated":
                        serviceWorkerOnActive(newWorker, true);
                        break;
                }

                if (newWorker == navigator.serviceWorker.controller) {
                    if (isLogging) console.log("New Service Worker is attached.");
                }
            });
        });
    }).catch(error => {
        console.error("Service Worker registration failed:", error);
    });
    // });
}
