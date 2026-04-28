# Legacy Design Rationale

> Parallel: [legacy-design-rationale.ko.md](legacy-design-rationale.ko.md)

This document preserves **superseded design sketches** that were once present in the source — code paths an earlier author wrote, then commented out or otherwise marked "currently not using" rather than deleted. Instead of leaving the dead bytes inside the production file, we move the artifact here, paired with the *why* (what the design tried to do, and why the project chose a different path).

This is **not** an open-items punch list — see [open-implementation-markers.en.md](open-implementation-markers.en.md) for that. Entries here are about designs that were tried (or sketched) and intentionally set aside, not deferred work.

When picking up an entry — to genuinely revive the path — pull the snippet from here, restore it to source, and remove the entry from this document. When permanently dropping the path, delete the entry. The document only keeps living motivations.

## Entries

### 1. Dynamic root tab fetch via `./structure/rootmenu`

**Where it lived**: `scripts/estreUi-main.js`, just below `initRootbar`. A commented-out fetch call at the tail of `initRootbar`, plus a block of five sibling methods (`renderRootBar`, `buildRootTabItem`, `buildMainSection`, `fetchContent`, `renderContentArea`) wrapped in `// === Currently not using` / `// ===========================` sentinels. The methods only referenced each other — no external entry point.

**What it did**: Fetched `./structure/rootmenu<structureSuffix>` (a JSON blob describing root menu items) and dynamically built the root tab bar + main sections by appending generated `<button>` and `<section>` elements. Each section then fetched its own content descriptor (`esm.direct`) and assembled an `<article>` plus per-handle `.handle_set` placeholders.

**Why it was set aside**: EstreUI's current convention is **declarative markup** — root tabs and sections are authored as static HTML and discovered at boot via `$tabsbar.find(c.c + btn)` and `data-tab-id` attributes. The dynamic-fetch path predates that convention. Keeping a parallel, JSON-driven build path alongside the static markup path adds two ways to do the same thing without a clear reason to prefer one — see [markup-conventions.en.md](markup-conventions.en.md) for the direction the framework went instead.

**When it might come back**: If a host project ever needs root menu entries that are determined by the server at runtime (per-tenant menus, role-based menu trimming, A/B tested menu structures), this snippet is the starting point — it shows the expected JSON shape (`menu[].id`, `.title`, `.desc`, `.type`, `.home`, `.direct`, `.content.display`) and the boot-time call site.

**Preserved snippet**:

```js
// In initRootbar, after the static-markup branch:
// fetch("./structure/rootmenu" + estreStruct.structureSuffix)
//     .then((response) => {
//         if (response.ok) return response.json();
//         throw Error("[" + response.status + "]" + response.url);
//     })
//     .then((data) => estreUi.renderRootBar(data))
//     .catch((error) => console.log("fetch error: " + error));

// Sibling methods on the estreUi object:
renderRootBar(esd) {
    this.$rootTabs.empty();
    this.$mainArea.empty();
    var topId = null;
    for (var item of esd.menu) {
        this.$rootTabs.append(this.buildRootTabItem(item));
        this.$mainArea.append(this.buildMainSection(item));
        if (item.type == "static" && item.home) topId = item.id;
    }
    this.$rootTabs = this.$rootbar.find(c.c + btn);

    if (topId != null) {
        this.$rootTabs.filter(aiv(eds.tabId, topId)).attr(eds.active, t1);
    }

    this.$rootTabs.filter(ax(eds.tabId)).click(this.rootTabOnClick);
},

buildRootTabItem(esm) {
    const element = doc.ce(btn);
    element.setAttribute(m.cls, "tp_tiled_btn");
    element.setAttribute("title", esm.desc);
    element.setAttribute(eds.tabId, esm.id);
    element.innerHTML = esm.title;
    return element;
},

buildMainSection(esm) {
    const element = doc.ce(se);
    element.setAttribute(m.cls, "vfv_scroll");
    element.setAttribute("id", esm.id);
    this.fetchContent(esm, element);
    return element;
},

fetchContent(esm, target) {
    return fetch("." + esm.direct + estreStruct.structureSuffix)
        .then((response) => {
            if (response.ok) return response.json();
            throw Error("[" + response.status + "]" + response.url);
        })
        .then((data) => {
            const parts = this.renderContentArea(data);
            for (var part of parts) target.append(part);
        })
        .catch((error) => {
            if (window.isLogging) console.error("fetch error: " + error);
        });
},

renderContentArea(ecm) {
    const set = [];
    const article = doc.ce(ar);
    if (ecm.content.display == "constraint") article.setAttribute(m.cls, "constraint");
    set.push(article);
    for (var handle of handles) {
        const handler = doc.ce(div);
        handler.setAttribute(m.cls, "handle_set " + handle.attach);
        set.push(handler);
    }
    return set;
},
```

**External dependencies the snippet expected**: `estreStruct.structureSuffix` (filename suffix appended to fetched paths), the global `handles` iterable (handle descriptors with `.attach` selectors), and the same DOM helpers (`doc.ce`, `m.cls`, `eds.tabId`, `c.c + btn`, etc.) the rest of `estreUi-main.js` already uses. If reviving, verify each of these still exists with the expected shape.
