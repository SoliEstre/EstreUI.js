# Handle Registry & Stock Handles

> Parallel: [handle-registry.ko.md](handle-registry.ko.md)

This document covers the **activeHandle registry** — how live handle instances are tracked at runtime — and the **stock handles** that ship with EstreUI. For creating custom handles, see [custom-handles.en.md](custom-handles.en.md).

## activeHandle registry

### How it works

`EstreHandle.activeHandle` is a static object that maps CSS selectors (specifiers) to `Set` instances containing all live handles of that type:

```js
EstreHandle.activeHandle[specifier]  // → Set<EstreHandle>
```

When a handle is created via `initHandles()`, it is added to the set for its specifier. When released, it is removed. This gives you a global registry of every active handle instance grouped by type.

### Accessing handles by name

The `uis` registry maps logical names to CSS selectors. Combined with `activeHandle`, you can reach any live handle:

```js
// uis.scalable → ".scalable"
// EstreHandle.activeHandle[".scalable"] → Set of all active scalable handles

for (const handle of EstreHandle.activeHandle[uis.scalable]) {
    handle.refresh();
}
```

### Reaching a specific handle via DOM

Every bound element stores its handle instance on `element.handle`:

```js
const widgetEl = document.querySelector(".my_widget");
const handle = widgetEl.handle;  // → the EstreHandle instance
```

This is set during `init()` and cleared during `release()`.

### Registration flow

```
initHandles($host, host)
  → for each specifier in EstreHandle.handles:
      → find matching elements in $host
      → for each element:
          → new HandleClass(element, host)
          → host.registerHandle(specifier, handle)
          → activeHandle[specifier].add(handle)
          → handle.init()
```

### Deregistration flow

```
releaseHandles($host, host)
  → for each specifier in EstreHandle.handles:
      → find matching elements in $host
      → for each element:
          → host.unregisterHandle(specifier, element.handle)
          → activeHandle[specifier].delete(element.handle)
          → element.handle.release()
```

Handles are automatically released when their host page handle is closed or when a new handle replaces an existing one (if `replace = true`).

### Custom handle registration

Custom handles are registered via `registerCustomHandle()` before `commit()`:

```js
EstreHandle.registerCustomHandle("myWidget", ".my_widget", MyWidgetHandle);
```

This does three things:
1. Adds `"myWidget"` → `".my_widget"` to the `uis` registry.
2. Adds `".my_widget"` → `MyWidgetHandle` to the handles map.
3. Sets `MyWidgetHandle.handleName = "myWidget"`.

After `commit()`, no further registrations are accepted. Custom handles are merged into the main handles map at commit time.

## Stock handles

EstreUI ships with the following built-in handles. Each is activated by adding its CSS class (or attribute selector) to an element.

### Layout & Interaction

| Handle class | Selector (`uis` key) | Purpose |
| --- | --- | --- |
| `EstreScalableHandle` | `.scalable` (`scalable`) | Expandable/collapsible block with a summary row and full content. Click the summary to toggle. |
| `EstreCollapsibleHandle` | `.collapsible` (`collapsible`) | Collapse/expand content. Shows `.basic` content when collapsed, all content when expanded. |
| `EstreToggleBlockHandle` | `.toggle_block` (`toggleBlock`) | Binary toggle block — shows/hides content based on a toggle state. |
| `EstreToggleTabBlockHandle` | `.toggle_tab_block` (`toggleTabBlock`) | Combines toggle and tab behavior — toggle to show/hide, tabs to switch content. |
| `EstreTabBlockHandle` | `.tab_block` (`tabBlock`) | Tabbed content block with `ul.tab_set` for tab buttons and `.tab_content_blocks` for panels. |
| `EstreDynamicSectionBlockHandle` | `.dynamic_section_block` (`dynamicSectionBlock`) | Dynamically manages sections with host/block item pairs, supporting wide dynamic layouts. |

### Calendars

| Handle class | Selector (`uis` key) | Purpose |
| --- | --- | --- |
| `EstreUnifiedCalendarHandle` | `.unified_calendar` (`unifiedCalendar`) | Full-featured calendar with scheduler, filters, date navigation, and schedule lists. |
| `EstreDedicatedCalendarHandle` | `.dedicated_calendar` (`dedicatedCalendar`) | Compact calendar with integrated schedule block. |

### Input & Selection

| Handle class | Selector (`uis` key) | Purpose |
| --- | --- | --- |
| `EstreNumKeypadHandle` | `.num_keypad` (`numKeypad`) | On-screen numeric keypad. |
| `EstreCheckboxSetHandle` | `.checkbox_set` (`checkboxSet`) | Manages a group of checkboxes with select-all and individual state tracking. |
| `EstreCheckboxAllyHandle` | `.checkbox_ally` (`checkboxAlly`) | Checkbox group with mutual exclusion or allied selection logic. |
| `EstreCustomSelectorBarHandle` | `.custom_selector_bar` (`customSelectorBar`) | Horizontal selector bar with custom option rendering. |
| `EstreMonthSelectorBarHandle` | `.month_selector_bar` (`monthSelectorBar`) | Month/year picker bar with navigation arrows. |

### Overlays & Toasts

| Handle class | Selector (`uis` key) | Purpose |
| --- | --- | --- |
| `EstreToasterSlotHandle` | `.toaster_slot` (`toasterSlot`) | Container that manages slide-up toast panels. |
| `EstreMultiDialSlotHandle` | `.multi_dial_slot` (`multiDialSlot`) | Scrollable multi-dial picker (date, time, custom options). |

### Display & Utility

| Handle class | Selector (`uis` key) | Purpose |
| --- | --- | --- |
| `EstreDateShowerHandle` | `.date_shower` (`dateShower`) | Auto-formats and displays date components (year, month, date, day name) into child elements. |
| `EstreLiveTimestampHandle` | `[data-live-timestamp]` (`liveTimestamp`) | Displays a relative timestamp ("3 minutes ago") that updates automatically. |
| `EstreOnClickSetTextHandle` | `[data-on-click-set-text]` (`onClickSetText`) | On click, copies text to a target element. |
| `EstreOnClickSetHtmlHandle` | `[data-on-click-set-html]` (`onClickSetHtml`) | On click, copies HTML to a target element. |
| `EstreExportedContentHandle` | `.exported_content` (`exportedContent`) | Loads and injects external HTML content into the element. |
| `EstreHelpAlertHandle` | `[data-help-alert]` (`dataHelpAlert`) | Shows a help/info alert dialog when clicked, with content from the `data-help-alert` attribute. |
| `EstreEzHidableHandle` | `.ez_hidable` (`ezHidable`) | Quick show/hide with CSS transitions. |
| `EstreFixedAccessHandle` | `.fixed_access` (`fixedAccess`) | Fixed-position access button or panel. |

## Handle prototype templates

Stock handles can ship with HTML templates stored in `stockHandlePrototypes.html`. This file is fetched during `estreUi.init()` and injected into `<section id="handlePrototypes">`.

Each prototype is an `<article>` containing a `<template>` with `data-handle="handleName"`:

```html
<!-- stockHandlePrototypes.html -->
<article>
    <template data-handle="scalable">
        <div class="scalable">
            <div class="summary"></div>
            <div class="content"></div>
        </div>
    </template>
</article>
```

When a handle's bound element has `data-set-prototype="1"`, the framework calls `applyPrototype()` which looks up the template by handle name and injects the structure. See [markup-conventions.en.md](markup-conventions.en.md) for details on `data-set-prototype`.

Similarly, custom handle prototypes go in `customHandlePrototypes.html`.

## Using handles from page handlers

Page handlers commonly interact with handles via the DOM or via `EstreHandle.activeHandle`:

```js
"home" = class extends EstrePageHandler {
    onBring(handle) {
        // access a specific handle via DOM
        this.$calendar = handle.$host.find(".unified_calendar");
    }

    onShow(handle) {
        // access handle instance
        const calHandle = this.$calendar[0].handle;
        calHandle.refresh();
    }
}
```

Handles are initialized as part of `applyActiveStruct()` → `initLiveElement()` → `initHandles()`, which runs after data binding and solid point processing.
