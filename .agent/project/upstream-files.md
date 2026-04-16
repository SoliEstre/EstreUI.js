# EstreUI.js Upstream File Classification

Projects using EstreUI.js contain a mix of upstream (framework) files and project-specific files.
Use this table to determine the scope of impact when modifying code, and to decide what belongs in `.agent/estreui/` documentation.

> Local modifications may have been applied to upstream files. When in doubt, compare against this repository's main branch.

## scripts/

| File | Origin | Notes |
| --- | --- | --- |
| `boot.js` | **Upstream** | First script to execute. Contains `serviceWorkerHandler`. |
| `alienese.js` | **Upstream** | Short identifier definitions (`t`, `f`, `n`, `u`, `d`, `cls`, `eds`, `eid`, etc.). |
| `doctre.js` | **Upstream** | DOM template serialization/deserialization engine. |
| `estreU0EEOZ.js` | **Upstream** | Common utility library. |
| `jcodd.js` | **Upstream** | Encoding/decoding utilities. |
| `modernism.js` | **Upstream** | Polyfills and API augmentation. |
| `estreUi.js` | **Upstream** (core) | `EstreUiPageManager`, `EstreUiCustomPageManager`, `EstrePageHandler`, `EstreHandle`, `EstreUiPage`, `EstreUiParameterManager`, and other core classes. |
| `serviceWorker.js` | **Upstream** skeleton | Cache keys and asset lists are customized per project. |
| `main.js` | **Project-specific** (app bootstrap) | Global instance wiring and initialization. |
| Project-specific `*EUiHandles.js` | **Project-specific** | Custom handle classes extending `EstreHandle`. |
| Project-specific `*EUiPages.js` | **Project-specific** | PagesProvider + `EstrePageHandler` subclass handlers. |
| Project-specific API/DH files | **Project-specific** | Domain API and data helpers. |

## styles/

| File | Origin |
| --- | --- |
| `estreUiInitialize.css`, `estreUiRoot.css`, `estreUiCore.css`, `estreUiCore2.css`, `estreUiAliases.css`, `estreUi.css`, `estreUiHandles.css`, `estreUiHandleUnical.css`, `estreUiEmoji.css` | **Upstream** |
| Project-specific `*Initialize.css`, `*Fonts.css`, `*Animations.css`, `*Common.css`, `main.css` | **Project-specific** |

## Root HTML

| File | Origin | Notes |
| --- | --- | --- |
| `index.html` | Upstream template + project customization | `<head>` meta/icons are project-specific. `data-exported="1"` slot skeleton is upstream. |
| Export section files (`fixedTop.html`, `fixedBottom.html`, `mainMenu.html`, `managedOverlay.html`, `staticDoc.html`, `instantDoc.html`, `serviceLoader.html`) | Upstream filename convention | Content (markup) is project-specific. |
| `customHandlePrototypes.html`, `stockHandlePrototypes.html` | Upstream pattern | Content varies per project. |
| `webmanifest.json`, `favicon*` | Project-specific |

## Folders

| Folder | Origin |
| --- | --- |
| `lotties/`, `images/`, `fonts/`, `vectors/` | Upstream folder name convention; content is project-specific. |

## Quick Classification Tips

- Class name starts with `Estre*` → likely upstream.
- CSS filename starts with `estreUi*` → upstream.
- `data-exported="1"` on top-level `<main>/<header>/<footer>/<nav>` in HTML → upstream export slot; inner `<section>` markup is usually project-specific.
