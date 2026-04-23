# Quick Panel (overwatchPanel)

> Parallel: [quick-panel.ko.md](quick-panel.ko.md)

EstreUI ships a top-drop **Quick Panel** — the framework's only built-in surface for fast global toggles (dark mode today; access to other singleton preferences later). The DOM identifier is `nav#overwatchPanel` and inside it two sibling sections are visible: `section#quickPanel` and `section#timeline`.

The panel is an Android-style drop-from-top sheet: hidden at the top, swipe down from the very top edge to open, swipe up or tap the grab area to close. An optional host-placed button may also call the toggle API directly.

## Anatomy

```
<body>
  <nav id="overwatchPanel" data-exported="1" data-opened="">
    <header id="panelHeader">            <!-- common header: clock + date -->
    <div class="dynamic_section_host">   <!-- tab bar across sections -->
    <div class="dynamic_section_block">  <!-- horizontal strip of sections -->
      <section id="quickPanel">
        <article>
          <div class="quick_tiles">      <!-- grid of .quick_tile buttons -->
            <button id="darkModeToggle" class="quick_tile" ...>
      <section id="timeline">            <!-- reserved slot -->
    <section id="panelGrabArea">         <!-- bottom drag handle -->
  </nav>
  <section id="panelTrigger" data-static="1"></section>
</body>
```

- `nav#overwatchPanel` has `data-exported="1"` and is loaded asynchronously from [overwatchPanel.html](../../overwatchPanel.html) by `loadExportedOverwatchPanel()`. Host projects may override the attribute to `data-exported=""` and inline the markup if they want to skip the fetch.
- The two sections are wired through the existing [dynamic_section_host / dynamic_section_block](markup-conventions.en.md) machinery — tab click navigates, the intersection observer keeps the tab highlighted, and wide viewports can surface both sections side-by-side with standard responsive CSS.
- `section#panelTrigger` is a thin fixed strip at the top of the viewport that catches the open-gesture. Its `z-index` sits above `fixedTop` so edge swipes are picked up even when a top bar is present.

## Opening and closing

Programmatic API on the `estreUi` singleton:

| Call | Effect |
| --- | --- |
| `estreUi.openOverwatchPanel(sectionId?)` | Opens the panel. If `sectionId` is passed, scrolls that section on top. |
| `estreUi.closeOverwatchPanel()` | Closes the panel. |
| `estreUi.toggleOverwatchPanel(sectionId?)` | Toggles; opens to `sectionId` when opening. |
| `estreUi.showOverwatchPanelSection(id)` | Scrolls to a section without changing open/close state. |
| `estreUi.isOpenOverwatchPanel` | Getter — whether `data-opened="1"` is currently applied. |

Two gesture handlers are wired at boot by `setPanelSwipeHandler()`:

1. **Open** — `EstreSwipeHandler` on `#panelTrigger`, `unuseX()` (vertical-only), `setResponseBound($overwatchPanel)`. Firing `grabY > 0` commits an open.
2. **Close** — `EstreSwipeHandler` on `#panelGrabArea`, `unuseX()`, same response bound. Firing `grabY < 0` commits a close.

Both use `setResponseBound` so the DOM receiving `--grab-y` / `data-on-grab` is the panel root, not the trigger or grab-area. This lets the whole panel follow the finger during the drag through the CSS transforms below.

A tap on `section#panelGrabArea` (no drag) calls `closeOverwatchPanel` via `overwatchPanelGrabAreaOnclick`.

## CSS anatomy

The transforms combine a **baseline offset** with the swipe handler's `--grab-y` so elements move only in the intended direction:

```css
/* closed baseline — panel lives above the viewport */
nav#overwatchPanel                > header#panelHeader         { transform: translateY(-100%); }
nav#overwatchPanel                > .dynamic_section_host      { transform: translateY(calc(-100% - var(--panel-block-height))); }
nav#overwatchPanel                > .dynamic_section_block     { transform: translateY(calc(-100vh - var(--panel-block-height))); }

/* during downward grab while closed — only the positive portion leaks through */
nav#overwatchPanel[data-on-grab="1"]:not([data-opened="1"]) > header#panelHeader
    { transform: translateY(calc(-100% + max(var(--grab-y), 0px))); }

/* while open — only upward grab pulls the panel back up */
nav#overwatchPanel[data-opened="1"][data-on-grab="1"] > header#panelHeader
    { transform: translateY(min(var(--grab-y), 0px)); }
```

`max(--grab-y, 0px)` / `min(--grab-y, 0px)` prevents snap-back when the drag direction opposes the allowed direction — a downward pull on an already-open panel, or an upward pull on a closed panel, is clamped to zero so the panel stays still.

The trigger strip and the panel itself sit on opposite sides of `fixedTop` in the stacking order:

| Layer | `z-index` | Purpose |
| --- | --- | --- |
| `nav#overwatchPanel` | 120 | Drops behind `fixedTop`; visible when open. |
| `.fixed_top` | 130 | App chrome — stays above the opening panel. |
| `section#panelTrigger` | 135 | Catches top-edge swipes; `pointer-events: auto` when closed, `none` once `[data-opened="1"]`. |

## Common header (clock + date)

`panelHeader` renders an Android-style clock + short-date pair. Populated by `setOverwatchPanelClock()` and driven by `scheduleOverwatchPanelClock()` — the timer aligns to the next minute boundary via `setTimeout`, then switches to a `setInterval(60_000)` loop. The date uses `Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" })` so it localizes automatically.

```html
<header id="panelHeader" data-static="1">
  <span id="panelClock"></span>   <!-- "HH:MM" -->
  <span id="panelDate"></span>    <!-- localized short date -->
</header>
```

`releaseOverwatchPanelClock()` tears both timers down; called by `releasePanelSwipeHandler` / teardown paths.

## Built-in tile: dark mode

The framework-provided content inside `#quickPanel .quick_tiles` is a single 3-state dark-mode toggle:

```html
<button id="darkModeToggle" class="quick_tile" type="button"
        data-dark-mode-state="auto"
        onclick="estreUi.cycleDarkMode();">
  <span class="tile_icon" aria-hidden="true">🌓</span>
  <span class="tile_label">Auto</span>
</button>
```

- `estreUi.cycleDarkMode()` rotates the preference **auto → light → dark → auto**, returning the new `darkMode` value.
- `updateDarkModeToggleWidgets()` runs from inside `applyDarkMode()` and syncs every element matching `#darkModeToggle` in the document: `data-dark-mode-state` becomes `"auto" | "light" | "dark"`, the `.tile_icon` glyph becomes 🌓 / ☀ / ☾, and the `.tile_label` text is title-cased from the state.

Because `updateDarkModeToggleWidgets()` walks by id selector, host projects can place additional `<button id="darkModeToggle" …>` copies elsewhere in the UI and they stay in sync automatically — no extra wiring.

> Framework rule: the Quick Panel is the only framework-provided path for a dark-mode toggle. Host projects are free to add their own UI, but must either reuse the `#darkModeToggle` markup class or call `estreUi.setDarkMode` / `cycleDarkMode` directly — no other part of the framework surfaces dark-mode controls.

## Host hook API — `registerOverwatchPanelTile`

Host projects append their own toggles / shortcuts into `#quickPanel` via a single method:

```js
estreUi.registerOverwatchPanelTile({
  id: "quickMute",                // required — unique DOM id
  icon: "🔕",                     // optional — glyph or emoji
  label: "Mute",                  // optional — text label
  onClick: (e) => toggleMute(),   // optional — jQuery event handler
});
```

| Member | Type | Notes |
| --- | --- | --- |
| `id` | string | Required. Used as the tile's DOM id. Duplicate ids return `null`. |
| `icon` | string | Placed inside `<span class="tile_icon" aria-hidden="true">`. |
| `label` | string | Placed inside `<span class="tile_label">`. |
| `onClick` | function | Attached via jQuery `.on("click", …)`. |

Returns the tile HTMLElement on success, or `null` when quickPanel isn't loaded yet / the id already exists. Pair with `estreUi.unregisterOverwatchPanelTile(id)` for cleanup.

Full-section registration (adding a third `block_item` alongside quickPanel/timeline) is intentionally **not** exposed in the current API — it would require re-initializing the `EstreDynamicSectionBlockHandle` IntersectionObserver and tab-click bindings, and the expected shape of that call is still TBD. Host projects that need a full extra section today should inline their `<section class="block_item" data-id="…">` into `overwatchPanel.html` at build time.

## Page handle integration

`quickPanel` is registered as a Page Provider slot in [estreUi-pageManager.js](../../scripts/estreUi-pageManager.js): its handler currently extends `EstrePageHandler` as an empty subclass, and the section is classified under `sectionBound: "panel"` via `EstrePanelComponent` (a sibling of `EstreMenuComponent` / `EstreMainComponent`). `show()` on a panel component routes through `estreUi.showOverwatchPanelSection`, so page navigation into `quickPanel` / `timeline` works through the standard page system without special-casing at call sites.

## Timeline

`section#timeline` is filled by `EstreTimelineView` at boot (`initOverwatchPanelTimeline()` in `estreUi-main.js`). It shows a date-grouped, swipe-to-delete list of dismissed notification banners, backed by `EstreTimelineStore` — see [timeline.en.md](timeline.en.md) for the store schema and view API.

## See also

- [dark-mode.en.md](dark-mode.en.md) — the API backing the built-in dark-mode tile.
- [markup-conventions.en.md](markup-conventions.en.md) — `data-exported`, `dynamic_section_host`, `data-static`.
- [navigation-api.en.md](navigation-api.en.md) — how page handles resolve to sections.
- [roadmap/008-quick-panel.md](roadmap/008-quick-panel.md) — the scope that produced this panel.
