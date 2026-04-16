# Markup Conventions

> Parallel: [markup-conventions.ko.md](markup-conventions.ko.md)

EstreUI defines a set of HTML conventions — custom elements, data attributes, and token syntax — that the framework processes at init time. This document covers the three main categories: **section exports**, **local-style scoping**, and **Active Struct** (data binding, solid points, set-prototype).

## Section exports (`data-exported`)

### The problem

A single `index.html` containing every section grows unwieldy. EstreUI solves this by letting you split sections into **export files** — separate HTML files whose contents are fetched and injected into placeholder slots at init time.

### How it works

In `index.html`, mark a container element with `data-exported="1"` and leave its body empty:

```html
<main id="staticDoc" data-exported="1">
</main>
<footer id="fixedBottom" data-exported="1">
    <nav id="instantSections">
    </nav>
</footer>
<main id="instantDoc" data-exported="1">
</main>
<nav id="managedOverlay" data-exported="1">
</nav>
<section id="handlePrototypes" data-exported="1" style="display: none; ">
</section>
```

During `estreUi.init()`, the framework checks each slot's `data-exported` attribute. If it equals `"1"`, the corresponding HTML file is fetched and its content is prepended into the slot:

| Slot element | Export file | Injection target |
| --- | --- | --- |
| `<header id="fixedTop">` | `fixedTop.html` | Header area (app bar) |
| `<footer id="fixedBottom">` | `fixedBottom.html` | Footer area (bottom nav) |
| `<main id="staticDoc">` | `staticDoc.html` | Main static sections |
| `<main id="instantDoc">` | `instantDoc.html` | Instant (blinded) sections |
| `<nav id="managedOverlay">` | `managedOverlay.html` | Overlay sections |
| `<nav id="mainMenu">` | `mainMenu.html` | Side menu |
| `<section id="handlePrototypes">` | `stockHandlePrototypes.html` + `customHandlePrototypes.html` | Handle prototype templates |

### Preloading

For faster loading, add `<link rel="preload">` tags in `<head>`:

```html
<link rel="preload" as="fetch" type="text/html" href="./staticDoc.html" crossOrigin="anonymous" />
<link rel="preload" as="fetch" type="text/html" href="./instantDoc.html" crossOrigin="anonymous" />
```

The browser starts downloading these files immediately while parsing the HTML. By the time `estreUi.init()` runs, the files are typically already cached.

### Export file structure

Export files contain raw section markup without `<html>`, `<head>`, or `<body>` wrappers. They are plain HTML fragments:

```html
<!-- staticDoc.html -->
<section id="home" class="root_tab_content" data-static="1">
    <div class="container" data-container-id="root" data-static="">
        <article data-article-id="main" data-static="1">
            <!-- page content -->
        </article>
    </div>
</section>

<section id="profile" data-static="1">
    <!-- ... -->
</section>
```

### Retry on failure

The framework retries each fetch indefinitely on network error, ensuring the app eventually loads even on flaky connections.

---

## `local-style` blocks & `##` scope alias

### The pattern

EstreUI provides scoped CSS through a custom `<local-style>` element. Inside an article (or any container), you write CSS rules using `##` as a placeholder for the host element's full selector path:

```html
<article data-article-id="main" data-static="1">
    <local-style>
        ## { --bottom-fixed-height: 0; }
        ## > .list { padding: 8px; }
        ## > .list > .item { display: flex; }
    </local-style>
    <div class="list">
        <div class="item">...</div>
    </div>
</article>
```

### How `##` resolves

The `LocalStyle.localize()` method (defined in `estreU0EEOZ.js`) walks up from the `<local-style>` element to `<body>`, building a precise CSS selector path. Each ancestor is identified by:

1. **`id`** if present → `tagName#id`
2. **`data-container-id`** if a `.container` div → `div[data-container-id="root"]`
3. **`data-article-id`** if an `<article>` → `article[data-article-id="main"]`
4. **`class`** as fallback → `tagName.class1.class2`
5. **`:nth-child(n)`** if siblings share the same specifier

The final selector is joined with ` > ` child combinators. For example, `##` in the markup above might resolve to:

```
main#staticDoc > section#home > div[data-container-id="root"] > article[data-article-id="main"]
```

Every `##` occurrence in the style text is replaced with this path, producing a standard `<style>` element that replaces the original `<local-style>` tag.

### Why not standard scoping?

- **No Shadow DOM overhead** — styles live in the normal document cascade.
- **Specificity is precise** — the generated selector is long enough to scope styles without `!important`.
- **`@media` queries work naturally** — they sit inside the same `<local-style>` block:

```html
<local-style>
    ## > .grid { display: grid; grid-template-columns: 1fr; }
    @media (min-width: 740px) {
        ## > .grid { grid-template-columns: 1fr 1fr; }
    }
</local-style>
```

### When it runs

`initLocalStyle()` is called as part of `applyActiveStruct()` during the page handle's content broker initialization. Each `<local-style>` element is processed once and replaced in-place with a `<style>` tag.

### Programmatic use

You can also inject scoped styles from JavaScript:

```js
LocalStyle.appendLocalize(hostElement, "## > .highlight { color: red; }");
```

---

## Active Struct

Active Struct is EstreUI's declarative system for binding data to DOM elements. It combines three mechanisms: **data-bind attributes**, **solid points** (template freezing), and **`|token|` interpolation**.

### `|token|` interpolation

The `|token|` syntax is the foundation of template content. Place tokens in text content or attribute values:

```html
<span>|userName|</span>
<img src="|profileImage|">
<button data-id="|itemId|">|label|</button>
```

Tokens are replaced by the Doctre engine's `matchReplace()` method when a frozen template is instantiated via `.hot()`, `.melt()`, or `.worm()`. The replacer is an object mapping token names to values:

```js
element.melt({ userName: "Alice", profileImage: "/img/alice.png" });
```

### `data-solid` — freezing templates

Elements marked with `data-solid="1"` have their inner HTML serialized (frozen) and stored as a `data-frozen` attribute. The original children are then cleared:

```html
<!-- Before init -->
<ul data-solid="1">
    <li>|name|</li>
</ul>

<!-- After initSolidPoint() -->
<ul data-solid="" data-frozen='[["li","|name|"]]'>
</ul>
```

The frozen content is a Doctre-format JSON string. You can later instantiate it with token replacement:

```js
// Append one rendered copy
listElement.worm({ name: "Alice" });

// Clear and re-render
listElement.melt({ name: "Bob" });
```

#### Priority ordering

`data-solid` accepts a numeric priority value. Elements with higher priority numbers are frozen first (processed in reverse order), ensuring nested solid points are handled before their parents.

### Doctre element methods

The Doctre library extends `Element.prototype` with freeze/thaw methods:

| Method | Effect |
| --- | --- |
| `elem.freeze(dataName)` | Serialize children into `dataset[dataName]` (default: `"frozen"`) |
| `elem.solid(dataName)` | `freeze()` + clear `innerHTML` |
| `elem.hot(replacer, dataName)` | Parse frozen data, apply `\|token\|` replacement, return DOM nodes (does not append) |
| `elem.worm(replacer, dataName)` | `hot()` + append result to element, return NodeArray |
| `elem.melt(replacer, dataName)` | Clear `innerHTML` + `worm()` |
| `elem.burn(replacer, dataName)` | `hot()` + delete the frozen data attribute |
| `elem.stringified()` | Serialize element to Doctre string format, then remove the element |

### `data-bind` — declarative data binding

When a page is opened with intent data (`pageManager.bringPage("page", { data: {...} })`), the framework's `initDataBind()` maps data fields to DOM elements:

```html
<!-- Simple text binding -->
<span data-bind="userName">placeholder</span>

<!-- Value binding (for inputs) -->
<input data-bind-value="email" />

<!-- Attribute binding: item@targetAttr -->
<img data-bind-attr="profileImage@src" />

<!-- Style binding: item@cssProperty -->
<div data-bind-style="themeColor@background-color"></div>
```

#### Bind attribute reference

| Attribute | Binds to | Source |
| --- | --- | --- |
| `data-bind="key"` | `innerHTML` | `intent.data[key]` |
| `data-bind-amount="key"` | `innerHTML` (formatted number) | `intent.data[key]` |
| `data-bind-value="key"` | `value` property | `intent.data[key]` |
| `data-bind-attr="key@attr"` | HTML attribute | `intent.data[key]` |
| `data-bind-style="key@prop"` | CSS property | `intent.data[key]` |

#### Prefix and suffix modifiers

Attribute and style bindings support `^prefix` and `$suffix` modifiers:

```html
<!-- data-bind-attr="key^prefix" → attr value becomes prefix + data[key] -->
<a data-bind-attr="path^/users/@href">Link</a>

<!-- data-bind-attr="$suffix key" → attr value becomes data[key] + suffix -->
```

The `^` character separates the key from the prefix; `$` separates the suffix from the key.

#### Array binding

For list data, use `data-bind-array` on a container with `data-solid` children:

```html
<ul data-bind-array="items" data-solid="1">
    <li data-bind-array-item="name">|name|</li>
</ul>
```

When `intent.data.items` is an array:
1. The container's children are frozen (if not already)
2. The container is cleared
3. For each array element, a copy is instantiated from the frozen template
4. If the array is empty, a placeholder is shown (from `data-frozen-placeholder`)

For arrays of objects, use `data-bind-object-array-*` variants:

```html
<ul data-bind-array="students" data-solid="1">
    <li>
        <span data-bind-object-array-item="name"></span>
        <span data-bind-object-array-item="grade"></span>
    </li>
</ul>
```

#### Conditional visibility

| Attribute | Shows element when |
| --- | --- |
| `data-show-on-exists="key"` | `data[key]` is not null/undefined |
| `data-show-on-not-exists="key"` | `data[key]` is null/undefined |
| `data-show-on-equals="key=value"` | `data[key] == value` |

### `data-set-prototype` — handle template injection

`data-set-prototype="1"` on a handle's bound element signals that the handle should inject its prototype template on init. The handle class defines a `prototypeTemplate` getter that returns a Doctre-based DOM template.

```html
<div class="my_widget" data-set-prototype="1"></div>
```

When the handle initializes:
1. It reads `data-set-prototype="1"`
2. Calls `applyPrototype()` which takes the handle's `prototypeTemplate`
3. Merges the prototype's classes, styles, and attributes into the bound element
4. Appends the prototype's children
5. Sets `data-set-prototype=""` to prevent re-application

This lets handles ship reusable, self-contained UI templates that are injected declaratively.

### Processing order

The Active Struct system runs in a specific order during `applyActiveStruct()`:

```
applyActiveStruct()
  ├── initContentBrokers()
  │     ├── initDataBind()       ← data-bind-* attributes resolved
  │     ├── initSolidPoint()     ← data-solid elements frozen
  │     └── initLocalStyle()     ← <local-style> elements localized
  └── initLiveElement()
        ├── initHandles()        ← EstreHandle instances wired
        └── initPassiveLinks()   ← data-open-* / data-close-* links bound
```

`data-bind` runs first so that bound values are in place before solid points freeze content and local styles are computed.
