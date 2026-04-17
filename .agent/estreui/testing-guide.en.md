# EstreUI.js — Testing Guide

> Parallel: [testing-guide.ko.md](testing-guide.ko.md)

## Overview

EstreUI.js is a browser-oriented framework that declares top-level `const` bindings across multiple script files loaded via `<script>` tags. This design poses a challenge for Node.js test runners because `const` is block-scoped — simply `require()`-ing or `import`-ing each file would isolate their scopes from each other.

This guide explains how to set up an automated test environment using **Vitest + jsdom** and a **script loader** pattern that faithfully reproduces the browser's shared global scope.

## Prerequisites

- Node.js 18+
- npm or pnpm

## 1. Install dependencies

```bash
npm install --save-dev vitest jsdom
```

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## 2. Vitest configuration

Create `vitest.config.js` at the project root:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./test/estreui/setup.js'],
        include: ['test/**/*.test.js'],
    },
});
```

Key points:

| Option | Purpose |
| --- | --- |
| `environment: 'jsdom'` | Provides `document`, `Element`, `NodeList`, etc. — required because EstreUI depends heavily on DOM APIs. |
| `setupFiles` | Runs the script loader before every test file, making all EstreUI globals available. |
| `include` | Limits test discovery to the `test/` folder. Framework tests go under `test/estreui/`; app-specific tests belong in `test/project/`. |

## 3. Script loader (`test/estreui/setup.js`)

This is the central piece. It concatenates all EstreUI source files into a single `new Function()` body so that top-level `const` declarations share one scope — exactly like they do in the browser.

```js
import { readFileSync } from 'fs';
import { resolve } from 'path';

// test/estreui/setup.js climbs one extra level to reach the project root's scripts/
const scriptsDir = resolve(import.meta.dirname, '..', '..', 'scripts');

// Must match the <script> load order in index.html.
// (EstreUI.js ships as 8 module files — see roadmap #002.)
const loadOrder = [
    'modernism.js',
    'alienese.js',
    'doctre.js',
    'estreU0EEOZ.js',
    'estreUi-core.js',
    'estreUi-dialog.js',
    'estreUi-notation.js',
    'estreUi-pageModel.js',
    'estreUi-pageManager.js',
    'estreUi-handles.js',
    'estreUi-interaction.js',
    'estreUi-main.js',
];

const sources = loadOrder.map(name => {
    const path = resolve(scriptsDir, name);
    return `// --- ${name} ---\n` + readFileSync(path, 'utf8');
});

const combined = sources.join('\n\n');

const wrapper = new Function(`
    ${combined}

    return {
        // List every identifier that tests need to access.
        // alienese
        t, f, n, u, d, s, i,
        nne, noe,
        cp, mk, ok, ov, oe, oc,
        to, ts, tn, tb, tf, tj, ia,
        xc,
        // doctre
        Doctre,
        // estreUi
        uis, eds,
        EstreUiPage, EstreUiPageManager, EstreHandle,
        pageManager, estreUi,
        // ... add more as needed
    };
`);

try {
    const exports = wrapper();
    for (const [key, value] of Object.entries(exports)) {
        globalThis[key] = value;
    }
} catch (e) {
    console.error('Failed to load EstreUI scripts:', e.message);
    throw e;
}
```

### Why `new Function()`?

In the browser, every `<script>` runs in the same top-level scope. `const` declared in `alienese.js` is visible to `estreUi.js` because they share the global execution context. In Node.js, each file gets its own module scope, so naively importing them would break cross-file references.

`new Function(body)` creates a single function whose body is the concatenation of all scripts. Inside that function, all `const`/`let` declarations share the same block scope — faithfully reproducing the browser behavior.

### Adapting the export list

The `return { ... }` block should enumerate every global identifier your tests need. When you add tests for new features, add the relevant identifiers here. The full list of available identifiers can be found in the JSDoc annotations of each source file.

## 4. Test organization

Tests are organized into tiers by complexity:

### Tier 1 — Pure logic (no DOM)

Tests that exercise functions which don't touch DOM nodes. These are the simplest to write and the fastest to run.

| Test target | File |
| --- | --- |
| `nne()`, `noe()`, primitive aliases, type checks | `test/estreui/alienese-helpers.test.js` |
| `Doctre.matchReplace`, `crashBroker`, `copyPrimitives` | `test/estreui/doctre-match-replace.test.js` |
| PID parsing (`getPidComponent`, strippers, setters) | `test/estreui/pid-parsing.test.js` |

### Tier 2 — DOM interaction (jsdom)

Tests that create or manipulate DOM elements. jsdom provides enough fidelity for most cases.

| Test target | Notes |
| --- | --- |
| `element.solid()` → `element.melt()` roundtrip | Doctre prototype extensions |
| `LocalStyle.localize()` | `##` selector replacement |
| `loadExported` slot injection | Requires mock fetch |
| Active Struct pipeline | `data-bind-*`, `data-solid`, `data-set-prototype` |

### Tier 3 — Page lifecycle

Tests that exercise `bringPage`, `showPage`, `closePage`, etc. These require a mock page structure (sections, containers, articles in the DOM) and are the most involved to set up.

## 5. Writing a test

Tests use standard Vitest syntax. All EstreUI globals are available without imports (they're bound to `globalThis` by the setup file).

```js
import { describe, test, expect } from 'vitest';

describe('nne() — isNotNullAndEmpty', () => {
    test('returns true for non-empty string', () => {
        expect(nne('hello')).toBe(true);
    });

    test('returns false for null', () => {
        expect(nne(null)).toBe(false);
    });

    test('returns false for empty object (falsy = empty)', () => {
        expect(nne({})).toBe(false);
    });
});
```

### Gotchas

1. **Falsy = empty.** `nne(0)`, `nne(false)`, `nne({})`, `nne([])` all return `false`. This is intentional — Alienese treats all falsy values as "empty".

2. **`matchReplace` function placeholders receive the full match including pipes.** If `dataPlaceholder` is a function, it receives `|token|` (with pipes), not `token`.

3. **`copyPrimitives` keeps `null`.** `null` passes the `Object(v) !== v` primitive check, so it's included in the result.

4. **No ES module exports.** The source files don't use `export` — everything is a global. Don't try to `import` individual functions from source files.

## 6. Running tests

```bash
# Single run
npm test

# Watch mode (re-runs on file change)
npm run test:watch

# Run a specific file
npx vitest run test/estreui/alienese-helpers.test.js
```

## 7. Adding scripts to the loader

If you add a new script file to EstreUI (e.g., a plugin or extension), add it to the `loadOrder` array in `test/estreui/setup.js` in the same position it appears in the HTML `<script>` tags. Then add any new global identifiers to the `return` block.

## 8. Folder layout

```
test/
  estreui/          # Framework (EstreUI.js) tests — shipped with upstream
    setup.js
    *.test.js
  project/          # App-specific tests — excluded from upstream (create as needed)
    setup.js
    *.test.js
```

Framework tests must not contain project-specific identifiers (domain names, API paths, brand constants) because they are shipped alongside upstream [SoliEstre/EstreUI.js](https://github.com/SoliEstre/EstreUI.js). Keep app-specific tests in their own subfolder (`test/project/`) to maintain the boundary explicitly.
