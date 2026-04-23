# Dark Mode

> Parallel: [dark-mode.ko.md](dark-mode.ko.md)

EstreUI ships a small dark-mode scaffold built around a single body attribute (`body[data-dark-mode="1"]`) and three methods on the `estreUi` singleton (`setDarkMode`, plus `darkMode` / `isDarkMode` getters). The CSS side flips only the **semantic** color tokens; the **baseline grayscale palette** is intentionally inherited from light mode.

## CSS scaffold

The override block lives in [styles/estreUiRoot.css](../../styles/estreUiRoot.css) at the bottom of the `:root` block, gated by `body[data-dark-mode="1"]`. The principle is symmetric flip on top of an unchanged grayscale axis:

- **Inherited (not overridden)** — the baseline palette `--color-black` / `--color-grayscale-*` / `--color-white` (and their `--cblk` / `--cg*` / `--cwht` aliases). Brand-singleton colors (`--color-focused`, `--color-emphasis*`, holiday/sunday/today/etc.) keep their identity hue.
- **Flipped** — `--color-text-*` (16-step ramp, inverse hex), `--color-boundary-*` (paired flips: `dim ↔ bright`, `dark ↔ light`, etc.), `--color-boundary-o*` and `--color-boundary-foggy-o*` (opacity ramps, re-declared in full — see below), `--color-point*`, `--color-point-sub*`, `--color-adaptive-*`. Each entry comes in dual form: full name (`--color-boundary-dim`) and alienese alias (`--cbdm`).

Boundary entries flip by re-pointing the `--color-boundary-*` family at the *opposite* end of the grayscale axis — `dim` becomes `var(--color-white)`, `bright` becomes `var(--color-black)`, and so on. The opacity ramps `--color-boundary-o*` / `--color-boundary-foggy-o*` are declared as `rgba(var(--cbdm) / N%)` / `rgba(var(--cbbr) / N%)`, but CSS custom-property `var()` substitution is eager at the declaring scope — a ramp declared only at `:root` freezes its computed value using `:root`'s `--cbdm` / `--cbbr`, and descendants inherit that frozen literal. So overriding just `--cbdm` / `--cbbr` at body scope does *not* cascade into the ramps. The dark block re-declares every ramp entry (25 `-o*` steps + 27 `-foggy-o*` steps) using the same formula, so they re-resolve against the dark-scope `--cbdm` / `--cbbr`.

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

> The framework's own toggle UI for these APIs is scoped to the Quick Panel — see [quick-panel.en.md](quick-panel.en.md). `estreUi.cycleDarkMode()` rotates **auto → light → dark → auto** and is what the built-in `#darkModeToggle` tile calls. Host projects may place additional toggles of their own: either reuse the `id="darkModeToggle"` markup (they will sync automatically via `updateDarkModeToggleWidgets`) or call `setDarkMode` / `cycleDarkMode` directly — do not manipulate the body attribute by hand.

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

- **CSS layer (deterministic)** — once `body[data-dark-mode="1"]` is set, every lazy-loaded semantic token resolves to its dark form. Eager-loaded init stylesheets are a separate concern — they run before the token palette is available and must declare splash-critical colors with concrete literals (see [Splash colors](#splash-colors-eager-init-overrides) below).
- **JS layer (opt-in toggle)** — `setupDarkMode()` runs inside `$(document).ready()`, so the body attribute is written *after* first paint. A dark-locked session therefore flashes light briefly before settling into dark (FOLM — flash of light mode).

To eliminate FOLM, a small inline pre-script must run immediately after the `<body>` opening tag, before any rendered children. The framework ships one commented-out inside [index.html](../../index.html) as a ready-to-paste starter:

```html
<body>
  <!--
  <script>
    (function () {
      const stored = localStorage.getItem("estreUi.darkMode");
      const dark = stored === "1"
        || (stored == null && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
      if (dark) document.body.dataset.darkMode = "1";
    })();
  </script>
  -->
  ...
</body>
```

The script is commented by default because pre-paint coupling has to be inlined into the host HTML (not a module import), and the storage key (`"estreUi.darkMode"`) and auto-mode policy are host-project decisions. To opt in, host projects uncomment the block and adjust the key / policy to match their project. The `<body>` selector is load-bearing — injecting the same script from `<head>` would be a no-op.

## Splash colors (eager-init overrides)

The framework's own eager stylesheet ([estreUiInitialize.css](../../styles/estreUiInitialize.css)) loads before [estreUiRoot.css](../../styles/estreUiRoot.css), which is marked `<meta link="lazy">` and arrives asynchronously. During that pre-lazy-load window the `--color-*` token palette is not yet defined, so any rule in `estreUiInitialize.css` that references `var(--color-white)`, `var(--color-black)`, etc. resolves to the guaranteed-invalid value — and the consuming property falls back (e.g. `background-color` → `transparent`). The splash then shows through to whatever half-initialized UI is behind it.

To stay robust, `estreUiInitialize.css` declares its own `--common-bg-color` with concrete hex literals for both modes — `#CCC` for light and `#222` for dark. The dark fallback only takes visible effect when the FOLM pre-script has run, since otherwise `body[data-dark-mode="1"]` is not set at first paint and the light value applies.

Host projects that want a project-owned splash tone (brand color, logo-friendly tint) override `--common-bg-color` in their own non-lazy initialize stylesheet:

1. Keep the FOLM pre-script (uncommented) so `body[data-dark-mode="1"]` is present at first paint.
2. Add a project-owned non-lazy initialize stylesheet, loaded eagerly in the same `<head>` pass as `estreUiInitialize.css` (plain `<link rel="stylesheet">`, not `<meta link="lazy">`).
3. Inside that stylesheet, declare both the light and dark splash colors with hex literals:

   ```css
   body                        { --common-bg-color: #FFF; }
   body[data-dark-mode="1"]    { --common-bg-color: #111; }
   ```

Concrete literals (not `var(--color-white)`) are required because the eager stylesheet runs before the token palette has loaded. Once the lazy palette arrives, downstream lazy stylesheets may use the token system normally.

## Adding new dark-mode-aware colors

When introducing a new semantic color set (anything beyond grayscale and brand singletons), follow the established pattern:

1. Declare the light-mode value in `:root` with both full name and alienese alias (`--my-color: ...; --myc: ...;`).
2. Add a paired flip inside `body[data-dark-mode="1"]`. Prefer `var(--cwht)` / `var(--cglr)` / etc. references over hex literals so the flip stays anchored to the (unchanged) grayscale axis.
3. Skip the override entirely if the color is brand-identity (focus, emphasis, day-of-week markers): those should look identical in both modes.
