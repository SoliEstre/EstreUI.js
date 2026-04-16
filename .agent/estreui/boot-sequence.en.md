# Boot Sequence & Script Load Order

> Parallel: [boot-sequence.ko.md](boot-sequence.ko.md)

## Script load order

The order of `<script>` tags in `index.html` is critical. EstreUI scripts have dependency chains that break silently if misordered.

```
boot.js              ← environment detection, viewport meta, PWA insets
    ↓
jQuery               ← DOM manipulation foundation
third-party libs     ← crypto-js, ua-parser, etc. (order-independent)
    ↓
modernism.js         ← JS prototype extensions (.let(), .also(), .it, .string, etc.)
alienese.js          ← short aliases (requires modernism)
    ↓
estreU0EEOZ.js       ← common utilities: doc, cvt, c, cls, eid, eds, selector helpers
    ↓
estreUi.js           ← core framework: EstrePageHandle, EstrePageHandler, EstreHandle,
                        EstreUiPageManager, EstreUiCustomPageManager, stedy/go/note, etc.
    ↓
custom handles       ← your EstreHandle subclasses (must be before estreUi.init())
custom pages         ← your PagesProvider + EstrePageHandler classes
    ↓
app entry (main.js)  ← wires everything, calls estreUi.init() and checkOnReady()
```

All scripts use `<script defer>`, ensuring they execute in order after the HTML is parsed.

## boot.js

Runs first (non-deferred, inline in `<head>`). Responsibilities:

- Detects device/browser: `isMobile`, `isIPhone`, `isAndroid`, `isSamsungBrowser`, `isAppleMobile`, `isStandalone` (PWA).
- Sets `window.isDebug` / `window.isLogging` / `window.isVerbosely` based on hostname.
- Injects the correct `<meta name="viewport">` depending on whether the app runs as PWA or browser.
- Handles safe-area insets for notched devices and PWA viewport-fit.
- Binds `visualViewport` resize listeners to set CSS custom properties (`--viewport-width`, `--viewport-height`, `--viewport-inset-*`).

## The init sequence

At the bottom of `main.js` (or your app entry), the boot sequence runs inside `$(document).ready()`:

```js
$(document).ready(() => setTimeout(() => {
    paramManager.init();

    sessionManager.init(async isTokenExist => {
        // 1. Wire page manager with alias map + handlers
        pageManager.init(
            MyPagesProvider.pages,
            await new MyPagesProvider(pageManager, sessionManager).init(),
            MyPagesProvider.operator
        );

        // 2. Init the rim
        await estreUi.init(false);

        // 3. Init action manager (service worker, etc.)
        actionManager.init(serviceWorkerHandler);

        // 4. If no stored token, show login
        if (!isTokenExist) await pageManager.bringPage("login");

    }, isOnAuth => {
        // Called when inertial auth resolves
        if (!isOnAuth) pageManager.bringPage("login");
        else pageManager.beginCheckAuthed();

    }, async isStraight => {
        // Called when estreUi is ready
        estreUi.checkOnReady(false, 800);
    });
}, 1));
```

### Key ordering constraints

1. **`paramManager.init()`** first — captures URL parameters before anything reads them.
2. **`pageManager.init()`** before `estreUi.init()` — the rim needs the alias map to resolve section exports.
3. **`estreUi.init(false)`** — mounts all exported sections (`data-exported="1"`), wires handles, fires initial `onShow` cycles. The `false` argument suppresses immediate splash removal.
4. **`estreUi.checkOnReady(false, timeout)`** — removes the splash screen after `timeout` ms of transition, marking the app as interactive.

## Stylesheet loading: `<meta link="lazy">`

EstreUI uses a pattern where large stylesheets are loaded via `<meta>` tags instead of `<link>`:

```html
<link rel="stylesheet" type="text/css" href="./styles/estreUiInitialize.css" />
<meta link="lazy" rel="stylesheet" type="text/css" href="./styles/estreUiRoot.css" />
<meta link="lazy" rel="stylesheet" type="text/css" href="./styles/estreUiCore.css" />
```

Only `*Initialize.css` files load synchronously (they style the splash screen). Everything else is deferred via `meta link="lazy"` and loaded by the framework after the initial paint.

**Why:** On actual iPhones, loading too many stylesheets (especially those containing web-font `@font-face` rules) synchronously can cause the page load to fail entirely. The lazy approach avoids this iOS failure mode while still preloading the files (via `<link rel="preload">` tags) for fast availability.

## Service Worker integration

EstreUI expects the app to manage its own service worker, but provides lifecycle hooks:

```js
actionManager.init(serviceWorkerHandler);
```

The `serviceWorkerHandler` exposes listeners:

| Listener | When |
| --- | --- |
| `setOnInstallingListener(fn)` | A new SW version is installing. |
| `setOnWaitingListener(fn)` | A new SW is installed and waiting to activate. |
| `setOnActivatedNewerListener(fn)` | A new SW has activated. |
| `setOnControllerChangeListener(fn)` | The controlling SW has changed (reload point). |

The typical pattern: detect a waiting worker → show an "Update available" prompt → on user confirm, tell the waiting worker to `skipWaiting()` → the controller-change listener triggers a page reload.

## `EstreUiParameterManager`

Bridges URL query parameters to localStorage (LS) and sessionStorage (SS):

```js
class MyParamManager extends EstreUiParameterManager {
    static get prefix() { return "MyApp_"; }
    static get lsMatch() { return { /* url-param: ls-key */ }; }
    static get ssMatch() { return { get invite() { return "referrerCode"; } }; }

    constructor() {
        super(MyParamManager.prefix, MyParamManager.lsMatch, MyParamManager.ssMatch);
    }
}
```

On `init()`, it reads `location.search`, maps each parameter via `lsMatch` (→ localStorage) or `ssMatch` (→ sessionStorage) with the configured prefix. Unmapped parameters go to sessionStorage with the prefix.

Built-in SS mappings: `page` → `"requestPage"`, `origin` → `"requestOrigin"`.
