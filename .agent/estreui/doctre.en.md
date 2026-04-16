# Doctre — Template Serialization Engine

> **Scope:** `doctre.js` (upstream).  
> **Full name:** Document Object Cold Taste Refrigeration Effortlessness.

Doctre provides a JSON-based serialization format for DOM trees and a complementary set of Element prototype extensions that let you **freeze** live DOM into data, then **thaw** it back with token interpolation. It is the engine behind EstreUI's `data-solid` / Active Struct pipeline.

---

## 1. Core Concepts

### Cold — the in-memory representation

A **cold** array describes one element:

```
cold[0]  solidId   "tag.class1.class2#id@name$type"
cold[1]  content   child cold array | HTML string | NodeList | Element
cold[2]  style     style string or object
cold[3]  attrs     extra attributes object
cold[4]  datas     dataset object
```

### Frost — the JSON string

A **frost** is the `JSON.stringify`-ed form of a cold array. It can be stored in `data-frozen` (or any data attribute), transmitted over the wire, or persisted in a database.

### SolidId — compact element identity

A solidId packs tag + class + id + name + type into one string:

```
"div.card.active#main@root$submit"
 │    │          │     │     └─ type
 │    │          │     └─ name
 │    │          └─ id
 │    └─ classes (dot-separated)
 └─ tag name
```

---

## 2. Static API

### Element creation

| Method | Description |
| --- | --- |
| `Doctre.createElement(tag, majorAttrs, content, style, attrs, datas, replacer)` | Create a single element from decomposed parameters. |
| `Doctre.createElementBy(solidId, content, style, attrs, datas, replacer)` | Same but accepts a solidId string. |
| `Doctre.createFragment(hcnlArray, replacer)` | Build a `DocumentFragment` from an array of cold items and text nodes. |

### Serialization

| Method | Description |
| --- | --- |
| `Doctre.coldify(nodeOrList, ...)` | Convert a Node/NodeList into cold array (in-memory). |
| `Doctre.stringify(nodeOrList, prettyJson, ...)` | Convert to frost (JSON string). |
| `Doctre.frostElement(element, ...)` | Serialize a single element to cold array. |
| `Doctre.frostNode(node, ...)` | Serialize any node (element, text, comment, fragment). |

### Deserialization

| Method | Description |
| --- | --- |
| `Doctre.parse(frost, replacer)` | Parse a frost JSON string into a `DocumentFragment`. |
| `Doctre.live(frostOrCold, replacer)` | Accept either frost string or cold array, return a `DocumentFragment`. |
| `Doctre.takeOut(frostOrCold, replacer)` | Wrap `live()` result in a `<template>` element. |

### Token interpolation — `matchReplace`

```js
Doctre.matchReplace("|greeting| |name|!", {
    greeting: "Hello",
    name: () => userName
});
// → "Hello Alice!"
```

- Tokens are delimited by `|pipes|`.
- Values can be strings, functions (called with the key), or objects (auto-stringified).
- `dataPlaceholder` — fallback value for unmatched tokens.
- `coverReplaceable: true` — replace all remaining `|token|` patterns with `dataPlaceholder`.

### Safari crash broker

`Doctre.crashBroker(jsonContent)` escapes newline/tab characters on Safari/iOS to prevent `JSON.parse` crashes. Automatically applied by `parse()`.

---

## 3. Element Prototype Extensions — `Doctre.patch()`

`Doctre.patch()` attaches methods to `Element.prototype`, `Node.prototype`, and `NodeList.prototype`. These are the primary API used in application code.

### Freezing (DOM → data)

| Method | Target | Returns | Side effect |
| --- | --- | --- | --- |
| `.cold()` | Element | Cold array of children | — |
| `.takeCold()` | Element | Cold array of children | Clears `innerHTML` |
| `.frozen()` | Element | Frost JSON string of children | — |
| `.takeFrozen()` | Element | Frost JSON string of children | Clears `innerHTML` |
| `.coldify()` | Node/NodeList | Cold array | — |
| `.coldified()` | Node | Cold array | Removes node |
| `.stringify()` | Node/NodeList | Frost JSON string | — |
| `.stringified()` | Node | Frost JSON string | Removes node |
| `.freeze(dataName?)` | Element | `this` | Stores frost in `dataset[dataName]` (default `"frozen"`) |
| `.solid(dataName?)` | Element | `this` | `freeze()` + clears `innerHTML` |

### Thawing (data → DOM)

| Method | Target | Returns | Side effect |
| --- | --- | --- | --- |
| `.hot(replacer?, dataName?)` | Element | `DocumentFragment` or `null` | — (reads from `dataset[dataName]`) |
| `.worm(replacer?, dataName?)` | Element | `NodeArray` or `null` | Appends fragment to element |
| `.melt(replacer?, dataName?)` | Element | `NodeArray` or `null` | Clears `innerHTML`, then appends |
| `.burn(replacer?, dataName?)` | Element | `DocumentFragment` or `null` | Deletes `dataset.frozen` |
| `.wormOut(replacer?, dataName?)` | Element | `NodeArray` or `null` | `worm()` + deletes `dataset.frozen` |
| `.meltOut(replacer?, dataName?)` | Element | `NodeArray` or `null` | `melt()` + deletes `dataset.frozen` |

### Live injection

| Method | Target | Returns | Side effect |
| --- | --- | --- | --- |
| `.alive(frostOrCold, replacer?)` | Element | `NodeArray` | Appends parsed content |
| `.alone(frostOrCold, replacer?)` | Element | `NodeArray` | Clears, then appends |

---

## 4. Lifecycle in EstreUI's Active Struct

When EstreUI processes `data-solid="1"` elements at init time:

```
   Author writes HTML with live content + |tokens|
                    ↓
   EstreUI calls  element.solid()
     → .freeze()  — serialize children to data-frozen
     → clear innerHTML  — DOM is now empty
                    ↓
   Later, data arrives (API response, user action)
                    ↓
   Handler calls  element.melt({ key: value, ... })
     → .hot()     — read data-frozen, parse + replace |tokens|
     → clear + append  — DOM is populated with real data
```

### Practical example

```html
<ul data-solid="1">
    <li class="item">
        <span>|title|</span>
        <time>|date|</time>
    </li>
</ul>
```

After `solid()`, the `<ul>` is empty but holds frozen template in `data-frozen`. To render a list:

```js
const list = document.querySelector("ul");
for (const item of items) {
    list.worm({
        title: item.title,
        date: item.createdAt
    });
}
```

Each `worm()` call appends a new `<li>` with tokens replaced.

---

## 5. The `Doctre` Instance

Beyond static methods, `Doctre` can be instantiated to hold a reusable template:

```js
const template = new Doctre("li.item", [
    ["span", "|title|"],
    ["time", "|date|"]
]);

// Generate live DOM
const fragment = template.fresh({ title: "Hello", date: "2025-01-01" });
```

| Property/Method | Description |
| --- | --- |
| `.live` | Generate DOM without token replacement. |
| `.fresh(replacer)` | Generate DOM with token replacement. |
| `.frost(...)` | Serialize back to cold array. |
| `.icy` | Shorthand for trimmed frost. |
| `.toString(prettyJson?)` | JSON string output. |
| `.chill` | Generate child fragment only. |
| `.cold(...)` | Serialize children to cold array. |
| `.frozen(...)` | Serialize children to frost string. |

---

## 6. `NodeArray`

`NodeArray` extends `Array` and holds references to nodes that were just injected. Returned by `.worm()`, `.melt()`, `.alive()`, `.alone()`.

```js
const nodes = container.melt({ name: "Alice" });
// nodes is a NodeArray — standard Array methods work
nodes.forEach(node => { /* ... */ });
```

This is useful because `DocumentFragment` children move on append — `NodeArray` keeps the references.

---

## 7. Key Design Points

- **Non-destructive reads**: `.cold()`, `.frozen()`, `.hot()` do not modify the DOM.
- **Destructive variants**: Method names signal intent — `take*` clears source, `*Out` deletes the frozen data, `solid` = freeze + clear.
- **Naming metaphor**: Cold/frozen = serialized (preserved). Hot/melt/worm/burn = deserialized (alive). The temperature metaphor is consistent throughout.
- **jQuery support**: If jQuery is loaded, `.coldify()`, `.stringify()`, `.coldified()`, `.stringified()` are also patched onto jQuery objects.
