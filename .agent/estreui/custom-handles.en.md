# Custom Handles

> Parallel: [custom-handles.ko.md](custom-handles.ko.md)

A **Handle** is EstreUI's per-element controller. While a *page handler* drives one PID, a *handle* drives one DOM element (and any number of identical elements can each have their own instance). When the host page is shown, hidden, or closed, every handle inside it is shown/hidden/released alongside it — no manual lifecycle wiring required.

## When to use

- The behaviour is repeated across many DOM nodes (input fields, list items, board cards, action buttons).
- The behaviour needs lifecycle: cleanup on page close, re-init on data change.
- The behaviour exposes a stable API to the rest of the app (e.g. "all `.user-card` instances, refresh yourselves").

If you only need one-off DOM wiring, a plain `$(...).on(...)` inside `onApplied` is fine. Handles are for *kinds* of widgets.

## Skeleton

```js
class UserCardHandle extends EstreHandle {

    constructor(handle, host) {
        super(handle, host);
        this.#init();
    }

    init() {
        // EstreUI calls .init() externally for some entry points.
        // We pre-initialise in the constructor and refuse re-init here.
        return "Already initialised by constructor.";
    }

    release(remove) {
        // Detach listeners, dispose resources.
        super.release(remove);
    }

    #init() {
        super.init();

        this.$bound.on("click", () => this.#openProfile());
        this.refresh();
    }

    refresh() {
        const user = UserCardHandle.dataSource?.();
        if (!user) return;
        this.$bound.find(".name").text(user.name);
        this.$bound.find(".email").text(user.email);
    }

    #openProfile() { /* … */ }

    // Static-callback injection: app code wires data here at boot.
    static dataSource = null;
    static setDataSource(fn) { this.dataSource = fn; }
}

EstreHandle.registerCustomHandle(
    "userCard",      // logical name (becomes uis.userCard)
    ".user_card",    // CSS selector matched against new DOM
    UserCardHandle   // class
);
```

Three things make this a handle:

1. **Subclass `EstreHandle`** and accept `(handle, host)` in the constructor; pass them to `super`.
2. **Register with a CSS selector** via `EstreHandle.registerCustomHandle(name, selector, Class)`. From this point on, every newly mounted element matching the selector gets a `UserCardHandle` instance.
3. **Implement `release(remove)`** so resources are freed when the host page closes.

## What `super(handle, host)` gives you

Inside the class body you immediately have:

| Member | Meaning |
| --- | --- |
| `this.bound` | The raw DOM element this handle controls. |
| `this.$bound` | jQuery wrapper of the same element. |
| `this.host` | The page handle (`EstrePageHandle`) that owns this handle. Use it to read `host.intent`, call `host.close()`, etc. |
| `this.data` | Convenience reference to `bound.dataset`. |

## Live registry: `EstreHandle.activeHandle`

EstreUI maintains a registry keyed by the *logical name* you used at registration. The constant `uis` (defined in `alienese`) maps the logical name to its registry key:

```js
// Refresh every live UserCard:
EstreHandle.activeHandle[uis.userCard]?.forEach(handle => handle.refresh());
```

This is the canonical way to broadcast updates to a kind of widget without holding direct references.

## Selector strategy

The selector you register is matched against new DOM as it enters the document (page mount, list re-render, etc.). Common patterns:

- Tag prefix to disambiguate: `"button.user_card"` instead of just `".user_card"` so a wrapper `<div class="user_card">` doesn't collide.
- Be specific enough that re-rendering a parent doesn't double-initialise: every match gets its own instance.
- Avoid generic class names like `.button` — the selector should clearly identify *this kind* of widget.

## Static-callback injection

Handles often need application-level data (current session, API client, dispatcher) that they shouldn't import directly. The convention is to expose static setters and have the app boot wire them in:

```js
class LoginFormHandle extends EstreHandle {

    static onSubmit = null;
    static setOnSubmit(fn) { this.onSubmit = fn; }

    constructor(h, host) {
        super(h, host);
        this.$bound.find("button.submit").on("click", () => {
            const id = this.$bound.find("input[name=id]").val();
            const pw = this.$bound.find("input[name=pw]").val();
            LoginFormHandle.onSubmit?.(id, pw,
                () => this.#onOk(),
                () => this.#onFail());
        });
    }
    // …
}

// At boot:
LoginFormHandle.setOnSubmit((id, pw, ok, fail) => {
    // call your auth service, then ok() or fail()
});
```

This keeps the handle file free of cross-module imports, and keeps the app entry point as the single place where wiring lives.

## Cleanup

Always call `super.release(remove)` — it removes the instance from `EstreHandle.activeHandle` and unbinds framework-managed events. Add your own teardown above it:

```js
release(remove) {
    this.#abortController?.abort();
    clearInterval(this.#poller);
    super.release(remove);
}
```

The `remove` argument is `true` when the host element itself is being removed from the DOM (vs. just hidden). Use it to decide whether to persist any state that should survive a re-show.

## Anti-patterns to avoid

- **Don't store DOM references on `this` that outlive the handle.** A closing page may detach `bound`; long-lived references leak.
- **Don't kick off network work in the constructor without an abort path.** The user can navigate away mid-flight.
- **Don't share mutable static state across handle instances** unless you also reset it on `release` — instances accumulate over a session.
- **Don't re-implement the lifecycle hooks of the page** inside a handle. If the work belongs to the page, put it in the page handler.
