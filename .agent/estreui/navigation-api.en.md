# Navigation API

> Parallel: [navigation-api.ko.md](navigation-api.ko.md)

This document covers the primary navigation methods — `bringPage`, `showPage`, `closePage`, `hidePage` — plus root tab switching and container-level operations.

For PID structure and layers, see [pid-and-layout.en.md](pid-and-layout.en.md). For the auth gating layer, see [pages-system.en.md](pages-system.en.md).

## Core navigation methods

All methods accept PIDs in three forms:
- **Raw PID**: `"&m=home#root@main"` — used directly.
- **`*` alias**: `"*home"` — resolved via `extPidMap` (the PagesProvider alias map).
- **`!` managed**: `"!alert"` — resolved via the framework's built-in managed PID map (dialogs, overlays, etc.).

`EstreUiCustomPageManager` automatically prepends `*`, so your app code uses plain alias names.

### `bringPage(pid, intent, instanceOrigin)`

Opens or shows a page. This is the primary navigation method.

```js
// Via custom page manager (recommended)
myPageManager.bringPage("profile", { data: { userId: 42 } });

// Via framework page manager (raw PID)
pageManager.bringPage("&m=profile#root@main", { data: { userId: 42 } });
```

**Behavior by hierarchy level:**

`bringPage` walks the PID tree from the deepest target upward:

1. **Component (section)**: If not open and instant, opens it. If it's a main section, switches the root tab.
2. **Container**: If not open and instant, opens it within the component.
3. **Article**: If not open and instant, opens it within the container.

At each level, if the target already exists:
- If intent is provided and this is the target level, the intent is pushed (triggering `onIntentUpdated`).
- If no intent, the existing element is simply shown.

**Return value:** The result of the deepest target operation, or `null`/`false` on failure.

### `showPage(pid, intent, instanceOrigin)`

Like `bringPage`, but only shows elements that **already exist**. Never creates new instances.

```js
myPageManager.showPage("profile");
```

Returns `null` if any element in the PID chain doesn't exist.

### `showOrBringPage(pid, intent, instanceOrigin)`

Tries `showPage` first; falls back to `bringPage` if the page isn't already open:

```js
myPageManager.showOrBringPage("home");
```

### `hidePage(pid, hideHost, instanceOrigin)`

Hides a page without destroying it. The page can be shown again later.

```js
myPageManager.hidePage("profile");
```

**`hideHost` flag:** When `true`, hides the parent component too (not just the target article/container). When omitted or `false`, hides only the deepest target. Static elements that are the only content will cascade the hide upward automatically.

### `closePage(pid, closeHost, instanceOrigin)`

Closes and destroys a page (for instant elements) or hides it (for static elements). Returns a Promise.

```js
await myPageManager.closePage("profile");
```

**Close cascading:**
- If closing an article and all sibling articles are static, the container is also closed.
- If closing a container and all sibling containers are static, the component is also closed.
- For main sections, closing falls back to switching to `"home"`.

**`closeHost` flag:** Forces closing the parent container/component regardless of static sibling state.

## Intent

Intent is the data payload that accompanies navigation:

```js
myPageManager.bringPage("detail", {
    data: { itemId: 123, title: "Example" },
    action: "edit",
    bringOnBack: { pid: "list", hostType: "container" }
});
```

| Field | Purpose |
| --- | --- |
| `data` | Object passed to `data-bind-*` attributes and page handler callbacks. |
| `action` | String identifier for the handler's `onIntentUpdated` to branch on. |
| `bringOnBack` | `{ pid, hostType }` — page to navigate to when this page is closed via back. |

Intent data is available in handler callbacks:

```js
"detail" = class extends EstrePageHandler {
    onOpen(handle, data, intent) {
        // data === intent.data
        this.loadItem(data.itemId);
    }

    onIntentUpdated(handle, data, intent) {
        // called when bringPage is called on an already-open page
        this.loadItem(data.itemId);
    }
}
```

## Root tabs

Main sections (`&m=...`) can be organized as root tabs — the top-level navigation of the app. Each tab is a button with `data-tab-id` matching a section id.

### `switchRootTab(target, intent)`

Switches the visible main section:

```js
// By section id (string)
estreUi.switchRootTab("home");

// By index (number)
estreUi.switchRootTab(0);

// By jQuery element
estreUi.switchRootTab($tabButton);
```

**Behavior:**
1. Hides all currently on-top sections.
2. Shows the target section.
3. Updates `data-active` on tab buttons.
4. If the target is already on top and the same tab is selected again, calls `back()` on the section handle (scroll to top or navigate back within the section).

### Modal tabs

Sections with the CSS class `.modal` are treated as modal tabs. `switchRootTab` toggles them:
- If not on top → opens via `openModalTab()`.
- If already on top → closes via `closeModalTab()`.

### Tab markup

```html
<!-- Tab buttons (typically in fixedBottom.html) -->
<button data-tab-id="home" data-active="1">Home</button>
<button data-tab-id="calendar">Calendar</button>
<button data-tab-id="more">More</button>

<!-- Sections (in staticDoc.html) -->
<section id="home" class="root_tab_content" data-static="1">...</section>
<section id="calendar" class="root_tab_content" data-static="1">...</section>
<section id="more" class="modal" data-static="1">...</section>
```

The `root_tab_content` class marks a section as a root tab participant. The `data-active="1"` attribute highlights the current tab button.

## Container operations

### Opening containers

Containers are opened as part of `bringPage`, but you can also open them directly:

```js
const section = estreUi.mainSections["profile"];
section.openContainer("edit");
```

### Closing containers

```js
// Via closePage
await myPageManager.closePage("profile_edit");

// Via direct container reference
const section = estreUi.mainSections["profile"];
await section.closeContainer("edit");
```

### Reloading containers

To reload a container's content from outside:

```js
const section = estreUi.mainSections["profile"];
const container = section.containers["root"];
if (container) container.reload();
```

This triggers the container's article handles to re-run their `onShow` cycle, effectively refreshing the displayed data.

### Accessing the section tree

```js
// Main sections
estreUi.mainSections["home"]

// Footer sections
estreUi.footerSections["fixedBottom"]

// Blinded (instant) sections
estreUi.blindedSections["login"]

// Overlay sections
estreUi.overlaySections["customDialog"]

// Current on-top main section
estreUi.mainCurrentOnTop
```

## Declarative navigation links

EstreUI supports declarative navigation via data attributes on clickable elements:

```html
<!-- Open a container within the current section -->
<button data-open-target="self"
        data-open-container="edit"
        data-open-id="main">
    Edit Profile
</button>

<!-- Open a container in a specific section -->
<button data-open-target="root@profile"
        data-open-container="details"
        data-open-id="main">
    View Details
</button>

<!-- Pass data with the navigation -->
<button data-open-target="self"
        data-open-container="detail"
        data-open-id="main"
        data-open-data='{"itemId": 123}'>
    Open Item
</button>

<!-- Navigate back on close -->
<button data-open-target="self"
        data-open-container="edit"
        data-open-id="main"
        data-open-bring-on-back="1">
    Edit (return here on close)
</button>
```

| Attribute | Purpose |
| --- | --- |
| `data-open-target` | `"self"` (current section) or `"root@sectionId"`. |
| `data-open-container` | Container type to open (e.g. `"component"`, `"edit"`). |
| `data-open-id` | Article or container id. |
| `data-open-action` | Action string passed in intent. |
| `data-open-data` | JSON data passed in intent. |
| `data-open-bring-on-back` | `"1"` to set current page as return target; or a PID string. |

For closing pages declaratively:

```html
<button data-close-page="profile_edit">Close</button>
<button data-open-page="home">Go Home</button>
<button data-show-page="settings">Show Settings</button>
```

These passive links are initialized by `initPassiveLinks()` as part of the Active Struct processing.

## Back navigation

The framework manages a back navigation stack. When the browser back button (or Android back button) is pressed:

1. The current page handle's `back()` method is called.
2. `back()` checks with the handler's `onBack()` callback — if it returns `true`, the back is consumed.
3. If not consumed, the page navigates to its `bringOnBack` target or falls back to the root tab.
