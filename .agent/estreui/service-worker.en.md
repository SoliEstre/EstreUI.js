# Service Worker & Offline Caching

> **Scope:** `serviceWorker.js` (upstream skeleton, project-customized asset lists) + `boot.js` `serviceWorkerHandler` (upstream).

EstreUI ships a Service Worker setup with a tiered caching strategy and a `serviceWorkerHandler` object in `boot.js` that manages the SW lifecycle from the main thread.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Main thread (boot.js)                              │
│                                                     │
│  serviceWorkerHandler                               │
│    ├─ register SW                                   │
│    ├─ lifecycle callbacks (install → wait → active)  │
│    ├─ postMessage / sendRequest ↔ response           │
│    └─ cache management API (clear*, getVersion)      │
│                                                     │
├────────────── postMessage channel ──────────────────┤
│                                                     │
│  Service Worker thread (serviceWorker.js)            │
│    ├─ install  → precache tiered file lists          │
│    ├─ activate → purge old caches                    │
│    ├─ fetch    → cache-first for known assets        │
│    └─ message  → respond to control commands         │
└─────────────────────────────────────────────────────┘
```

---

## 2. Tiered Cache Strategy

The SW organizes cached assets into four tiers, each with its own cache name and update cadence:

| Tier | Cache name pattern | Contents | Update frequency |
| --- | --- | --- | --- |
| **Application** | `<appVer>/<swVer>-r<date>` | Section exports (HTML), app CSS, app JS | Every deploy |
| **Common** | `common-files-cache-v<N>-<date>` | index.html, manifest, EstreUI core CSS/JS, upstream libs | Infrequent |
| **Static** | `static-files-cache-v<N>-<date>` | Docs, fonts, third-party libs, images, vectors, lotties | Rare |
| **Stony** | `stony-files-cache-v<N>-<date>` | Large/rarely-changing assets (emoji fonts, extra fonts) | Very rare |

### Install behavior

```js
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.keys().then(async keyList => {
            // Only cache tiers whose key doesn't exist yet
            if (!keyList.includes(CACHE_NAME_COMMON_FILES))
                await cache.addAll(COMMON_FILES_TO_CACHE);
            if (!keyList.includes(CACHE_NAME_STATIC_FILES))
                await cache.addAll(STATIC_FILES_TO_CACHE);
            if (!keyList.includes(CACHE_NAME_BY_VERSION))
                await cache.addAll(FILES_TO_CACHE);
            // Stony tier is fire-and-forget (not awaited)
            if (!keyList.includes(CACHE_NAME_STONY_FILES))
                /* async */ cache.addAll(STONY_FILES_TO_CACHE);
        })
    );
});
```

Key points:
- Application, Common, Static tiers are awaited — the SW won't activate until these are cached.
- Stony tier is fire-and-forget — large font files cache in the background without blocking activation.
- Cache names include version strings; changing the version constant triggers re-caching on next install.

### Activate behavior

On activation, the SW deletes any cache whose name doesn't match the four current tier names. This purges stale versions automatically.

### Fetch behavior

Three-path routing:

1. **Always-newer list** — Files in `CHECK_ALWAYS_NEWER_FILE_LIST` (e.g., the SW script itself) always fetch from network, falling back to cache on error.
2. **Token path interception** — URLs containing `/|` or `/%7C` (Doctre token patterns) return an empty 200 response to prevent unnecessary network requests.
3. **Known assets** — Any URL in the four file lists is served cache-first. On cache miss, fetches from network with cache fallback on error.
4. **Unlisted URLs** — Pass through to network (no interception).

---

## 3. `serviceWorkerHandler` (boot.js)

The main-thread counterpart lives in `boot.js` as a plain object.

### Properties

| Property | Description |
| --- | --- |
| `.registeration` | `ServiceWorkerRegistration` reference. |
| `.installing` / `.waiting` / `.activating` / `.activated` | Current worker references per lifecycle stage. |
| `.service` | Shortcut to `navigator.serviceWorker`. |
| `.controller` | Shortcut to `navigator.serviceWorker.controller`. |
| `.worker` | Best available worker: `controller ?? activated ?? activating ?? waiting ?? installing`. |
| `.isInitialSetup` | `true` if this is the first-ever SW install (no prior active worker). |

### Lifecycle callbacks

Register listeners via setter methods:

```js
serviceWorkerHandler.setOnWaitingListener(worker => {
    // A new version is waiting to activate
});

serviceWorkerHandler.setOnActivatedNewerListener(worker => {
    // A newer SW just activated — may want to reload
});

serviceWorkerHandler.setOnControllerChangeListener(event => {
    // Controller changed — app is now served by a new SW
});
```

| Setter | Fires when |
| --- | --- |
| `setOnInstallingListener` | New SW begins installing. |
| `setOnWaitingListener` | New SW is installed and waiting. |
| `setOnUpdatedListener` | `updatefound` fires and new worker reaches `installed`. |
| `setOnActivatingListener` | SW enters `activating` state. |
| `setOnActivatingNewerListener` | A *newer* SW enters `activating` (not the first install). |
| `setOnActivatedListener` | SW enters `activated` state. |
| `setOnActivatedNewerListener` | A *newer* SW enters `activated`. |
| `setOnControllerChangeListener` | `navigator.serviceWorker.oncontrollerchange` fires. |

### Request/response messaging

The handler uses a sequence-numbered `postMessage` protocol:

```js
// Fire-and-forget
serviceWorkerHandler.postMessage(worker, { type: "SKIP_WAITING" });

// Request with callback
serviceWorkerHandler.sendRequest("getVersion", {}, version => {
    console.log("SW version:", version);
});

// Promise-based
const version = await serviceWorkerHandler.sendRequestForWait("getVersion");
```

### Cache management API

| Method | Description |
| --- | --- |
| `clearCache()` | Clear the application (version) cache. |
| `clearCommonCache()` | Clear the common cache. |
| `clearStaticCache()` | Clear the static cache. |
| `clearStonyCache()` | Clear the stony cache. |
| `clearAllCaches()` | Clear all caches. |
| `getVersion()` | Get the current SW version string. |
| `getVersionWaiting()` | Get version of the waiting worker. |
| `getApplicationCount()` | Get number of controlled client windows. |

### SW control

| Method | Description |
| --- | --- |
| `skipWaiting(worker?)` | Tell a waiting worker to activate immediately. |
| `clientsClaim(worker?)` | Tell the active worker to claim all clients. |
| `update()` | Trigger a manual SW update check. Returns the new worker or `false`. |

---

## 4. Message Protocol

Messages between main thread and SW follow this pattern:

**Main → SW:**
```js
{ type: "commandName", sequence: 42, content: { ... } }
```

**SW → Main:**
```js
{ type: "worked", request: originalMessage, response: result }
```

Supported SW message types:

| Type | Action | Response |
| --- | --- | --- |
| `SKIP_WAITING` | `self.skipWaiting()` | — (no response) |
| `CLIENTS_CLAIM` | `self.clients.claim()` | — (no response) |
| `clearCache` | Delete version cache | `true`/`false` |
| `clearCommonCache` | Delete common cache | `true`/`false` |
| `clearStaticCache` | Delete static cache | `true`/`false` |
| `clearStonyCache` | Delete stony cache | `true`/`false` |
| `clearAllCaches` | Delete all caches | Array of results |
| `getVersion` | Return version string | `"x.y.z/a.b.c-rDate"` |
| `getApplicationCount` | Count controlled windows | Number |

---

## 5. Registration Flow

In `boot.js`, after `serviceWorkerHandler.init()`:

```
  navigator.serviceWorker.register("./scripts/serviceWorker.js", {
      scope: "/",
      updateViaCache: "none"
  })
        ↓
  registration.installing → onInstalling callback
  registration.waiting   → onWaiting callback (+ auto skipWaiting)
  registration.active    → onActivated callback
        ↓
  registration.addEventListener("updatefound")
        ↓
  newWorker.addEventListener("statechange")
    → "installed" → onUpdated + onWaiting (if controller exists)
    → "activating" → onActivating (isNewer=true)
    → "activated" → onActivated (isNewer=true)
```

The default flow auto-calls `skipWaiting()` on the waiting worker, so new versions activate immediately without requiring a page refresh.

---

## 6. Debug Flags

Both `boot.js` and `serviceWorker.js` use the same logging pattern:

| Flag | Description |
| --- | --- |
| `isLog` | Base logging flag (default `true`). |
| `isDebug` | Auto-set to `true` when host doesn't match production. |
| `isLogging` | `isLog \|\| isDebug` — gates most console output. |
| `isVerbosely` | `isDebug && isVerbose` — gates detailed object dumps. |

---

## 7. Customization Points

When adapting the SW for a new project:

1. **`FILES_TO_CACHE`** — Update with project-specific HTML exports, CSS, and JS files. Version the cache name.
2. **`COMMON_FILES_TO_CACHE`** — Add/remove upstream libraries and core EstreUI assets.
3. **`STATIC_FILES_TO_CACHE`** — Project images, vectors, fonts, third-party libraries.
4. **`STONY_FILES_TO_CACHE`** — Large, rarely-changing assets (emoji fonts, extra font families).
5. **`CHECK_ALWAYS_NEWER_FILE_LIST`** — Files that should always try network first.
6. **`HOST`** — Production hostname for debug flag auto-detection.
