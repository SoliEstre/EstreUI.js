# Dark Mode

> Parallel: [dark-mode.ko.md](dark-mode.ko.md)

EstreUI ships a small dark-mode scaffold built around a single body attribute (`body[data-dark-mode="1"]`) and three methods on the `estreUi` singleton (`setDarkMode`, plus `darkMode` / `isDarkMode` getters). The CSS side flips only the **semantic** color tokens; the **baseline grayscale palette** is intentionally inherited from light mode.

## CSS scaffold

The override block lives in [styles/estreUiRoot.css](../../styles/estreUiRoot.css) at the bottom of the `:root` block, gated by `body[data-dark-mode="1"]`. The principle is symmetric flip on top of an unchanged grayscale axis:

- **Inherited (not overridden)** — the baseline palette `--color-black` / `--color-grayscale-*` / `--color-white` (and their `--cblk` / `--cg*` / `--cwht` aliases). Brand-singleton colors (`--color-focused`, `--color-emphasis*`, holiday/sunday/today/etc.) keep their identity hue. Boundary opacity ramps (`--color-boundary-o*`, `--color-boundary-foggy-o*`) automatically follow `--cbdm` / `--cbbr` via `var()`, so they need no separate override.
- **Flipped** — `--color-text-*` (16-step ramp, inverse hex), `--color-boundary-*` (paired flips: `dim ↔ bright`, `dark ↔ light`, etc.), `--color-point*`, `--color-point-sub*`, `--color-adaptive-*`. Each entry comes in dual form: full name (`--color-boundary-dim`) and alienese alias (`--cbdm`).

Boundary entries flip by re-pointing the `--color-boundary-*` family at the *opposite* end of the grayscale axis — `dim` becomes `var(--color-white)`, `bright` becomes `var(--color-black)`, and so on. Because `--cbdm` / `--cbbr` are the anchors that the opacity ramps reference, the rest of the boundary ramp follows for free.

## API

```js
// Set user preference. Accepts true/false/null/undefined plus their alienese
// aliases (t/f/n/u), and "1"/"0" / 1/0 for compatibility with stored values.
estreUi.setDarkMode(t);     // dark on
estreUi.setDarkMode(f);     // light on
estreUi.setDarkMode(n);     // auto (follow OS via prefers-color-scheme)
estreUi.setDarkMode();      // same as setDarkMode(u) → auto

// Read the *user preference*: true (dark), false (light), or null (auto).
estreUi.darkMode;

// Read the *resolved current state* — what is actually applied to <body>.
estreUi.isDarkMode;
```

| Member | Form | Meaning |
| --- | --- | --- |
| `setDarkMode(value)` | method | Sets and persists the user preference, then re-applies. Returns the resolved `isDarkMode`. |
| `darkMode` | getter | The persisted user preference (`true` / `false` / `null`). `null` means "auto". |
| `isDarkMode` | getter | The currently applied state, derived from `darkMode` and `matchMedia` if auto. |
| `applyDarkMode()` | method | Re-evaluates and writes `body[data-dark-mode]`. Called internally; rarely needed externally. |
| `setupDarkMode()` | method | Boot-time wiring (called from `estreUi.init()`). Registers the `prefers-color-scheme` listener and applies the initial state. |

## Storage

The preference is persisted under `localStorage["estreUi.darkMode"]`:

| Stored value | Meaning |
| --- | --- |
| `"1"` | User chose dark. |
| `"0"` | User chose light. |
| absent | Auto — follow OS `prefers-color-scheme`. |

`setDarkMode(null)` / `setDarkMode(undefined)` removes the key, switching to auto.

## Boot wiring

`setupDarkMode()` is invoked from `estreUi.init()` alongside `setReload()` / `setBackNavigation()` / `setMenuSwipeHandler()`. It:

1. Creates a `matchMedia("(prefers-color-scheme: dark)")` query and stores it on `estreUi.darkModeMql`.
2. Attaches a `change` listener that re-applies *only when the preference is auto* (so a user who locked to dark/light is not flipped by an OS theme switch).
3. Calls `applyDarkMode()` for the initial paint.

## First-paint coupling

The two layers couple differently to first paint by design:

- **CSS layer (deterministic)** — once `body[data-dark-mode="1"]` is set, every semantic token resolves to its dark form. If the host project routes its splash background through a flippable token (e.g. `--common-bg-color`), the splash itself shows up dark with no further work.
- **JS layer (opt-in toggle)** — `setupDarkMode()` runs inside `$(document).ready()`, so the body attribute is written *after* first paint. A dark-locked session therefore flashes light briefly before settling into dark (FOLM — flash of light mode).

To eliminate FOLM, host projects add a small inline pre-script immediately after the `<body>` opening tag, before any rendered children:

```html
<body>
  <script>
    const stored = localStorage.getItem("estreUi.darkMode");
    const dark = stored === "1" ||
      (stored == null && matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.body.dataset.darkMode = "1";
  </script>
  ...
</body>
```

EstreUI itself does not ship this pre-script. The selector targets `<body>` (a no-op if injected from `<head>`), the storage key (`"estreUi.darkMode"`) and auto-mode policy are host-project decisions, and pre-paint coupling has to be inlined into the host HTML rather than loaded as a module. Splash-screen coupling is therefore an opt-in on the host project, not a framework responsibility.

## Adding new dark-mode-aware colors

When introducing a new semantic color set (anything beyond grayscale and brand singletons), follow the established pattern:

1. Declare the light-mode value in `:root` with both full name and alienese alias (`--my-color: ...; --myc: ...;`).
2. Add a paired flip inside `body[data-dark-mode="1"]`. Prefer `var(--cwht)` / `var(--cglr)` / etc. references over hex literals so the flip stays anchored to the (unchanged) grayscale axis.
3. Skip the override entirely if the color is brand-identity (focus, emphasis, day-of-week markers): those should look identical in both modes.
