# Open Implementation Markers

> Parallel: [open-implementation-markers.ko.md](open-implementation-markers.ko.md)

In-source TODO-style markers (`// <= ...`, `// 추후...`, `// to do implement` outside intentional placeholders) that flag **deferred or partially-implemented** behavior in the framework code. Use this list as a punch list when picking up loose ends — and as a guard against losing track of "I'll come back to it" comments.

> Out of scope:
> - **Abstract-style placeholders** in `EstreVoidCalendarStructure` / `EstreSimpleCalendarStructure` (`scripts/estreUi-handles.js` 1240, 1278–1322) — those are intentional empty methods for subclass override, not deferred work.
> - **Host project starter markers** like `scripts/main.js:398` (`//<= to do implement my own initializing`) — those are templates for adopting projects to fill in.

## Markers

### 1. `estreUi-handles.js:6366` — switch trailing case marker

```js
// scripts/estreUi-handles.js — inside a stock handle's option-toast click branch
try {
    const parsed = JSON.parse(options);
    toastOption(this.dataset.toastTitle ?? "", this.dataset.toastMessage ?? "", parsed, (index, value) => this.onselected?.(index, value));
} catch (e) {
    if (window.isLogging) console.error(e);
}
break;

// <= 케이스 추가 구현
```

A trailing marker after the `break;` of a `switch` arm. Reads as "more cases will be added here." There is no enumerated list of which cases are missing — the marker only reserves the slot. When extending the toast-bound option dispatcher with new option kinds, this is the spot.

### 2. `estreUi-main.js:1102` — re-selecting the already-active tab

```js
// scripts/estreUi-main.js — inside the root-tab click dispatcher
if ($target.attr(eds.active) == t1) {
    //do nothing //추후 방향에 따라 섹션 새로고침 등 구현
} else {
    $target.attr(eds.active, t1);
}
```

When the user clicks the **already-active** root tab, the current behavior is a no-op. The deferred intent: refresh the visible section based on the user's gesture direction (e.g. tap-from-top → scroll-to-top, tap-while-scrolled → reload). Comparable to the iOS pattern where tapping the active tab scrolls the list to top, and a second tap reloads.

The default no-op is acceptable as a baseline; when implementing, hook in here without changing the surrounding handler shape.

## Maintenance

When you resolve a marker, **remove the entry from this file** in the same commit. When you add a new deferred marker in code, add it here so future-you (and the next agent) can find it without grepping. Keep entries terse — file:line + one paragraph of intent + the code excerpt.
