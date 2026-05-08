# Back Navigation — `estreUi.back()` and the external handler stack

> Parallel: [back-navigation.ko.md](back-navigation.ko.md)

`estreUi.back()` is the entry point native back input flows into. The Flutter wrapper's `processBackForEstreUi()` calls it on Android back button / iOS edge swipe, and the same path is used by the in-page `popstate` listener so any history pop produces an identical traversal.

This document covers the two layers behind that single call:

1. **EstreUI's own section stack** — overlay → backWhile (dialog hold) → menu → blinded → main, traversed in order until one branch claims the input.
2. **The external handler stack** (added in roadmap #011) — host-mounted external embeds (chat libraries, payment widgets, alert centers, etc.) register their own navigation steps so EstreUI gives them the input *before* its own stack.

## Entry point

```js
estreUi.back()         // alias — equivalent to estreUi.onBack()
estreUi.onBack()       // async, returns Promise<boolean>; true = absorbed, false = host should default
```

Inside `onBack` the order is fixed:

```
external handler stack (LIFO)
  → onBackOverlay()
  → onBackWhile()           // dialog hold guard from estreUi-dialog.js
  → if isOpenMainMenu: onBackMenu() / closeMainMenu()
  → onBackBlinded()
  → onBackMain()
```

The first branch returning truthy wins; control returns to the caller without touching the rest. The `popstate` handler reads the boolean and either stays put (`true`) or shows the "press back again to exit" notice on the second consecutive `false` near the application's history root.

## External handler stack

Light-DOM-mounted external embeds (Shadow-DOM ones too — they still listen for native back through the host page) need their own multi-step pop sequence — for example:

```
[Step 1] embed panel opens at top level
   ↓ back → embed closes
[Step 2] inner page entered
   ↓ back → return to top level
[Step 3] modal / search mode / dialog within the inner page
   ↓ back → close the modal, stay on the inner page
```

Each step push to the stack on entry, pop on exit. EstreUI traverses LIFO, asking the most recent handler first.

### API

```js
const token = estreUi.pushBackHandler(handler)
estreUi.popBackHandler(token)              // returns true if removed
estreUi.clearAllExternalBackHandlers()     // safety-net for embed teardown
```

`handler` is `() => boolean | Promise<boolean>`. Truthy return absorbs the back input (chain stops, `onBack` returns `true`). Falsy return passes through to the next (older) handler, then to EstreUI's own stack. Synchronous and asynchronous handlers may coexist on the same stack — the loop awaits each.

### Handler contract

- **Truthy / falsy is the only signal.** `onBack` ignores any other return shape.
- **Throwing is isolated.** If a handler throws, EstreUI logs a warning (when `window.isLogging`) and continues with the previous entry. The stack stays intact.
- **The same handler may push twice.** Each push gets a separate token and counts as a separate entry; each pop removes one.
- **Out-of-order pop is fine.** `popBackHandler(token)` removes by token, not by stack position. Useful when an embed dismisses a deeper step (e.g., a modal) without reverting to the entry below it.
- **Re-entrant handlers must guard themselves.** `onBack` does not serialize concurrent invocations — if a handler awaits a long task and `back()` fires again, the same handler may run twice. Guard with an in-flight flag if the side effect is non-idempotent.

### Pattern: paired push/pop on every step

```js
class Embed {
    open() {
        this.panelToken = estreUi.pushBackHandler(() => {
            this.close()
            return true
        })
    }
    openInnerPage(id) {
        this.innerToken = estreUi.pushBackHandler(() => {
            this.closeInnerPage()
            return true
        })
    }
    closeInnerPage() { estreUi.popBackHandler(this.innerToken); /* ... */ }
    close()           { estreUi.popBackHandler(this.panelToken); /* ... */ }
    destroy()         { estreUi.clearAllExternalBackHandlers(); /* ... */ }
}
```

`destroy()` calls `clearAllExternalBackHandlers()` only as a safety net for paths where individual tokens may have been lost (e.g., reload, hard error). The expected steady-state cleanup is paired pop calls.

### Pattern: handler that defers to the embed's internal back

```js
estreUi.pushBackHandler(async () => {
    const result = await embed.requestBack()
    if (result === 'consumed')    return true                      // embed handled it
    if (result === 'shouldClose') { embed.close(); return true }   // embed wants out
    return false                                                   // pass to EstreUI's stack
})
```

This pattern lets the embed answer with three discrete outcomes — the handler turns each into the right truth value for `onBack`'s loop. Useful when the embed's internal stack is opaque to the host and the embed exposes its own back-protocol.

## Non-goals

- **Forward navigation.** iOS forward swipe (history forward) does not route through this stack. The embed steps are inherently asymmetric — pop is the only operation modeled.
- **Cross-instance ordering between unrelated embeds.** If two embeds push handlers, the LIFO order applies blindly across embeds. If a deterministic priority between embeds matters, run them on disjoint host sections (so only one embed has a live handler at a time) or wrap their handlers in a coordinator the host owns.
- **Pre-handler dispatching to specific embeds.** `onBack` does not classify which embed should receive the input; the most recent pusher wins. Embeds that want to coordinate must do so above this API.

## Related

- [navigation-api.en.md](navigation-api.en.md) — `bringPage` / `closePage` / intent flows (the EstreUI side of the stack `onBack` walks).
- [page-handlers.en.md](page-handlers.en.md) — per-page `onBack` handlers (one of the section-stack branches).
- [roadmap/011-back-handler-hook.md](roadmap/011-back-handler-hook.md) — proposal that produced this API.
- [review/010-onback-precedence-bug.md](review/010-onback-precedence-bug.md) — the precedence fix that cleared the prepend slot the external stack now uses.
