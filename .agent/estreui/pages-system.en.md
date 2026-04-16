# Pages Provider & Custom Page Manager

> Parallel: [pages-system.ko.md](pages-system.ko.md)

This document explains how to register page handlers and wire them to the EstreUI page system through the **PagesProvider** pattern and **EstreUiCustomPageManager**.

For the page handler lifecycle itself (`onBring`, `onShow`, etc.), see [page-handlers.en.md](page-handlers.en.md).

## Overview

EstreUI's page system has three layers of abstraction:

```
EstreUiPageManager        ← framework-level, manages all PIDs, handles bringPage()
  ↑
EstreUiCustomPageManager  ← subclass point for apps, bridges alias → PID
  ↑
Your app page manager     ← adds auth gating, post-login queuing, etc.
```

The **PagesProvider** is a class that bundles three things:
1. An alias → PID map (`static get pages`)
2. An auth policy object (`static get operator`)
3. Per-page handler classes (instance fields)

## PagesProvider anatomy

### Part 1: `static get pages` — the alias map

Maps human-friendly page names to PID strings:

```js
class MyPagesProvider {

    static get pages() { return {
        "home":          "&m=home",
        "home_root":     "&m=home#root",

        "profile":       "&m=profile",
        "profile_edit":  "&m=profile#edit@main",

        "settings":      "&m=menu#settings",

        "login":         "&b=login",
        "signup":        "&b=login#sign_up",
        "signup_step0":  "&b=login#sign_up@sign_up%0",
        "signup_step1":  "&b=login#sign_up@sign_up%1",
        "signup_step2":  "&b=login#sign_up@sign_up%2",

        "image_viewer":  "&b=imageViewer^#root@main",

        "search":        "&o=customToast#search^",
        "": "",
    }; }
```

Key points:
- Each alias is a short, memorable name; each value is a full PID.
- The map is passed to `EstreUiCustomPageManager.init()` which stores it as `pageManager.extPidMap`.
- When `bringPage("*alias")` is called, the `*` prefix triggers a lookup in `extPidMap`.
- `EstreUiCustomPageManager.bringPage(id)` automatically prepends `*` — so your app calls `myPageManager.bringPage("home")`, not `"*home"`.

### Part 2: `static get operator` — auth policy

Defines which pages are public (accessible without authentication):

```js
    static get operator() { return {
        get publicPages() { return [
            "login",
            "signup",
            "signup_step0",
            "signup_step1",
            "signup_step2",
        ]; },

        get nestedOnUnauthed() { return {
            // "restricted_page": "fallback_page",
        }; },

        requiredAuth(pn) {
            if (this.publicPages.indexOf(pn) > -1) return false;
            else if (pn in this.nestedOnUnauthed) return this.nestedOnUnauthed[pn];
            else return true;
        }
    }; }
```

| Field | Purpose |
| --- | --- |
| `publicPages` | Array of aliases that don't require auth. |
| `nestedOnUnauthed` | Map of alias → fallback alias. If the user isn't authed, redirect to the fallback instead of blocking. |
| `requiredAuth(pn)` | Returns `false` (public), `true` (requires auth), or a string (redirect alias). |

### Part 3: instance fields — page handler classes

Each instance field is named after a page alias and assigned an `EstrePageHandler` subclass:

```js
    // ... constructor, init(), etc.

    "home" = class extends EstrePageHandler {
        onBring(handle) {
            // first-time setup
        }
        onShow(handle) {
            // runs every time the page becomes visible
        }
    }

    "profile" = class extends EstrePageHandler {
        $nameField;

        onBring(handle) {
            this.$nameField = handle.$host.find(".name");
        }
        onOpen(handle, data) {
            if (data?.userName) this.$nameField.text(data.userName);
        }
    }

    "settings" = class extends EstrePageHandler {
        onShow(handle) {
            // refresh settings UI
        }
    }
```

Handler classes are defined inline as instance fields of the provider. The field name must match an alias key from `static get pages`. When `EstreUiCustomPageManager.init()` is called, each handler class is registered to the PID that corresponds to its alias.

### Constructor and init

The provider takes references to the app's managers:

```js
    #pageManager = null;
    #sessionManager = null;

    constructor(pageManager, sessionManager) {
        this.#pageManager = pageManager;
        this.#sessionManager = sessionManager;
    }

    async init() {
        // load any async settings before handlers fire
        return this;
    }
```

The `init()` method is awaited before handlers are registered, so you can load configuration or stored preferences that handlers will need.

## EstreUiCustomPageManager

### Base class

`EstreUiCustomPageManager` is the subclass point provided by EstreUI:

```js
class EstreUiCustomPageManager {

    init(extPidMap, pageHandlers) {
        pageManager.extPidMap = extPidMap;
        EstreUiPage.registerProvider(pageHandlers);
        for (var id in pageHandlers)
            EstreUiPage.registerHandler(extPidMap[id], pageHandlers[id]);
        return this;
    }

    bringPage(id, intent, instanceOrigin) {
        return pageManager.bringPage("*" + id, intent, instanceOrigin);
    }

    closePage(id, closeHost = false, instanceOrigin = null) {
        return pageManager.closePage("*" + id, closeHost, instanceOrigin);
    }

    // also: showPage, showOrBringPage, hidePage
}
```

`init()` does three things:
1. Sets the alias map on the framework's `pageManager`.
2. Registers the provider instance (so handlers can access `this.provider`).
3. Iterates over all handler entries and registers each one by PID.

### Subclassing for auth gating

The primary reason to subclass is to intercept `bringPage()` and enforce authentication:

```js
class MyPageManager extends EstreUiCustomPageManager {

    #pageOperator = null;

    init(extPidMap, pageHandlers, pageOperator) {
        this.#pageOperator = pageOperator;
        return super.init(extPidMap, pageHandlers);
    }

    async bringPage(pid, intent) {
        if (!sessionManager.isAuthed) {
            const isRA = this.#pageOperator.requiredAuth(pid);
            if (isRA === true) {
                // queue the request for after login
                sessionManager.requestBringOnAuthed({
                    caller: this, pid, intent
                });
                await this.bringPage("login");
                return true;
            } else if (isRA !== false) {
                // redirect to fallback page
                pid = isRA;
            }
        }
        return await super.bringPage(pid, intent);
    }

    onAuthed(data) {
        // called after successful login; replay queued navigation
        if (data.pid != null) {
            setTimeout(() => this.bringPage(data.pid, data.intent), 500);
        }
    }
}
```

The auth gate flow:
1. User tries to open a protected page.
2. `bringPage()` checks `requiredAuth()`.
3. If auth is required, the navigation request is queued and login is shown.
4. After login succeeds, `onAuthed()` replays the queued request.

## Wiring it all together

In the boot sequence (inside `sessionManager.init()` callback):

```js
myPageManager.init(
    MyPagesProvider.pages,
    await new MyPagesProvider(myPageManager, sessionManager).init(),
    MyPagesProvider.operator
);
```

This must happen **before** `estreUi.init()`, because the framework needs the alias map to resolve section exports.

### PID resolution flow

When `myPageManager.bringPage("home")` is called:

```
myPageManager.bringPage("home")
  → super.bringPage("home")
    → pageManager.bringPage("*home")
      → lookup extPidMap["home"] → "&m=home"
        → pageManager.bringPage("&m=home")
          → open/show section, fire handler lifecycle
```

The `*` prefix is the signal for the framework to look up the alias in `extPidMap`. The `!` prefix resolves against the framework's built-in managed PID map (for dialogs, alerts, etc.).

## Handler registration internals

`EstreUiPage.registerProvider(provider)` stores the provider instance. When a handler class is later instantiated, it receives `this.provider` — which is the provider instance — giving handlers access to shared services:

```js
"home" = class extends EstrePageHandler {
    onShow(handle) {
        // this.provider is the MyPagesProvider instance
        const session = this.provider.sessionManager;
        if (session.isAuthed) {
            // load data
        }
    }
}
```

`EstreUiPage.registerHandler(pid, handlerClass)` maps a PID to its handler class. When the page handle for that PID is created, the handler is instantiated and attached to the page handle's `.handler` property.

After all registrations, `EstreUiPage.commit()` finalizes the mapping, preventing further modifications.
