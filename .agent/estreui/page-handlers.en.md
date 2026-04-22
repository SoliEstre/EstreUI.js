# Page Handlers & Lifecycle

> Parallel: [page-handlers.ko.md](page-handlers.ko.md)

A **Page Handler** is the controller object that EstreUI invokes for one PID ([pid-and-layout.en.md](pid-and-layout.en.md)). You declare one class per addressable page; the page manager resolves the PID to an instance and routes lifecycle calls to it.

## Skeleton

```js
class CatalogDetailPage extends EstrePageHandler {

    onBring(handle) {
        // First contact. The page is being brought up.
        // `handle.intent.data` carries whatever caller passed.
        const itemId = handle.intent?.data?.itemId;
        this.#load(handle, itemId);
    }

    onShow(handle) {
        // The page has been transitioned in and is now visible.
        // Wire one-shot UI animations, focus, scroll restore, etc. here.
    }

    onIntentUpdated(handle, intent) {
        // The same PID was brought again with new data while still alive.
        // Re-render in place rather than rebuilding.
        this.#load(handle, intent.data.itemId);
    }

    onHide(handle) {
        // The page is leaving the foreground but may come back.
        // Pause timers, detach scroll listeners.
    }

    onFocus(handle, isFirstFocus) {
        // Page has taken active focus. Fires after onShow, and on window/tab return.
        // isFirstFocus=true on the very first focus of this page instance.
        // Return true to skip the framework's default autoFocus (in-page DOM focus).
    }

    onBlur(handle, isFinalBlur) {
        // Page has lost active focus. Fires before onHide, and on window/tab leave.
        // isFinalBlur mirrors handle.isClosing — true on the last blur before close.
    }

    onClose(handle) {
        // The page is going away for good (will be released next).
        // Persist edit-in-progress, fire analytics, etc.
    }

    onBack(handle) {
        // Override hardware/back-gesture navigation.
        // Return true to swallow the event; false (or no return) to let EstreUI close the page.
    }

    onReload(handle) {
        // Override pull-to-refresh / programmatic reload.
    }

    onApplied(handle) {
        // Called after EstreUI's data binding pass finishes on this page.
        // Safe place to query bound DOM that was just materialised.
    }

    #load(handle, itemId) { /* … */ }
}
```

## Full lifecycle order

```
              ┌───────────────────────────────────────────────┐
              │                                               │
bringPage ──► onBring ──► onOpen ──► onShow ──► onFocus ──► (active)
                          (once)                               │
                                                               ▼
                                          window/app focus toggle
                                          onBlur ◄─► onFocus
                                                               │
                                                               ▼
                                  hide ─► onBlur ─► onHide ─► (background)
                                                               │
                                                               ▼
                                  show ─► onShow ─► onFocus ◄──┘
                                                               │
                                                               ▼
                          close ─► onBlur ─► onHide ─► onClose ──► onRelease
                                                      (once)
```

`onOpen` and `onClose` fire exactly once per instance lifetime. `onShow` / `onHide` may pair multiple times in between when the page goes to background and back; while visible, `onFocus` / `onBlur` may toggle on window focus / tab visibility changes without touching `onShow` / `onHide`. `onApplied` is bound to data-binding completion and may fire multiple times if the bound model is re-applied.

## Focus lifecycle

Where `onShow` / `onHide` govern **screen presence**, `onFocus` / `onBlur` govern whether the page currently holds **active focus**. A visible page can still lack focus if another tab or app is active.

### Fire timing

- `onFocus` — dispatched after `onShow` completes, and again on every window `focus` / `visibilitychange` → visible.
- `onBlur` — dispatched before `onHide` starts, and on every window `blur` / `visibilitychange` → hidden.

Repeated calls are idempotent thanks to the handle's `isFocused` guard.

### Arguments

| Arg | Meaning |
| --- | --- |
| `isFirstFocus` | True only on the first `onFocus` after `onOpen`. Static pages reset it on re-open. |
| `isFinalBlur` | True on the final blur along a close path — equivalent to `handle.isClosing`, so prefer reading `handle.isClosing` instead of wiring the extra argument. |

### Return-value contract

Returning `true` from `onFocus` **skips the framework's default autoFocus** (the in-page DOM focus move). Use this when the handler owns its own focus policy.

```js
onFocus(handle, isFirstFocus) {
    if (isFirstFocus) this.$customInput.focus();
    else this.$defaultField.focus();
    return true;  // skip default autoFocus
}
```

When the return is falsy, the default autoFocus fires with the following priority:

1. `handle.lastFocusedElement` — restore the previously focused element (subsequent focuses only).
2. An element marked `[data-autofocus]`.
3. The first focusable element (`input`, `textarea`, `select`, `button`, `[tabindex]:not([tabindex="-1"])`).

### `lastFocusedElement` tracking

The framework records in-page focus moves via a document-level `focusin` listener. In addition, right after the handler returns `true`, `document.activeElement` is snapshotted into `lastFocusedElement` if it lives inside the page `host` — so an element the handler focused manually is also eligible for later restoration. The slot is cleared in `onClose`.

## The `handle` argument

Every callback receives a `handle` (an `EstrePageHandle`). The most useful properties:

| Member | Purpose |
| --- | --- |
| `handle.intent` | Intent object (`{ data, … }`) carried from the caller. |
| `handle.bound` | The raw DOM element that hosts this page (the article/container/section root). |
| `handle.$bound` | Same element wrapped as a jQuery object. |
| `handle.containers`, `handle.articles` | Children of this page when it is a container/section host. |
| `handle.close()`, `handle.reload()` | Programmatic close/reload of this page only. |

## Pages Provider

You don't register handlers one-by-one; you collect them in a *Pages Provider* and pass the result to your page manager at boot. A typical provider has three parts:

```js
class MyPagesProvider {

    // 1. Friendly alias → canonical PID map.
    static get pages() {
        return {
            "home":            "&m=home",
            "catalog":         "&m=catalog#root@main",
            "catalog_detail":  "&m=catalog#detail@overview",
            "login":           "&b=login",
            "confirm_dialog":  "&o=dialog#confirm^",
        };
    }

    // 2. Operator: classifies pages (auth gating, etc.).
    static get operator() {
        return {
            get publicPages() { return ["login", "signup"]; },
            requiredAuth(pn) { return this.publicPages.indexOf(pn) < 0; },
        };
    }

    constructor(pageManager, sessionManager) { /* keep refs */ }
    async init() { return this; }   // returns the per-PID handler map below

    // 3. Per-PID handler classes. The field name MUST match a key in `pages`.
    "home" = class extends EstrePageHandler {
        onShow(handle) { /* … */ }
    };

    "catalog" = class extends EstrePageHandler {
        onBring(handle) { /* … */ }
        onShow(handle)  { /* … */ }
    };

    "login" = class extends EstrePageHandler {
        onBring(handle) { /* … */ }
    };
}
```

`pages` is a flat dictionary; `operator` is your application's policy layer (auth, deep-link rewrite, etc.); each instance field whose name matches a `pages` key is the handler class for that page. `init()` returns the populated instance, which the page manager indexes by alias.

## Custom Page Manager

The default `EstreUiPageManager` knows how to resolve PIDs and dispatch lifecycle. Most apps subclass `EstreUiCustomPageManager` to add policy:

```js
class MyPageManager extends EstreUiCustomPageManager {

    init(extPidMap, pageHandlers, operator) {
        this.operator = operator;
        return super.init(extPidMap, pageHandlers);
    }

    async bringPage(pn, intent) {
        // Auth gate example
        if (!this.session.isAuthed && this.operator.requiredAuth(pn)) {
            this.session.queueAfterAuth({ pn, intent });
            return super.bringPage("login");
        }
        return super.bringPage(pn, intent);
    }
}
```

## Wiring at boot

```js
const sessionManager = new MySessionManager(/* … */);
const pageManager    = new MyPageManager(sessionManager);

$(document).ready(async () => {
    const provider = await new MyPagesProvider(pageManager, sessionManager).init();
    pageManager.init(MyPagesProvider.pages, provider, MyPagesProvider.operator);

    await estreUi.init(false);
    estreUi.checkOnReady(false, 800);
});
```

The order is important:
1. Page manager has its alias map and handlers **before** `estreUi.init()`.
2. `estreUi.init()` mounts the rim and fires the first `onShow` cycles.
3. `checkOnReady()` ends the splash and signals "app is interactive".

## Common patterns

- **Lazy data fetch in `onBring`, render in `onApplied`**: keeps the DOM idle until binding completes.
- **`onIntentUpdated` for re-entry**: cheaper than full close+rebring when the user re-navigates to the same page with different data.
- **Override `onBack` only when you need to**: returning nothing lets EstreUI handle navigation correctly. Override to consume the gesture (e.g. close an inline editor first).
- **Keep handler classes thin**: push real domain logic into your own services; the handler is glue between intent, DOM, and your data layer.
