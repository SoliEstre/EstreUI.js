# Adaptation Guide — EstreUI.js Concepts → Project Implementation

This guide maps each EstreUI.js concept to the files and patterns you should implement in your project.
Read the concept documentation in `.agent/estreui/` first, then refer to this guide when applying them in practice.

## 1. Page System (PID, Lifecycle)

| EstreUI Concept | Project Implementation | Guide |
| --- | --- | --- |
| **PID definition** (`&m=section#container@article`) | PagesProvider class `static get pages` | Register alias → full PID mappings. See [pid-and-layout docs](../estreui/pid-and-layout.en.md). |
| **Pages Provider** | Project-specific `*EUiPages.js` | `static get pages` (PID map), `static get operator` (auth policy), instance methods (shared utils). See [pages-system docs](../estreui/pages-system.en.md). |
| **`EstrePageHandler` subclass + lifecycle** | Instance fields in the same file | `onBring → onShow → onHide → onClose` flow. See [page-handlers docs](../estreui/page-handlers.en.md). |
| **`EstreUiCustomPageManager` extension** | `main.js` | Override `bringPage()` for auth gating, etc. See [pages-system docs](../estreui/pages-system.en.md). |
| **`EstreUiParameterManager` extension** | `main.js` | Override `prefix`, `lsMatch`, `ssMatch` static getters for LS/SS key mapping. See [boot-sequence docs](../estreui/boot-sequence.en.md). |

## 2. Custom Handles

| EstreUI Concept | Project Implementation | Guide |
| --- | --- | --- |
| **`EstreHandle` subclass + `registerCustomHandle`** | Project-specific `*EUiHandles.js` | `super(handle, host)` → `#init()` → `EstreHandle.registerCustomHandle("name", ".selector", Class)`. See [custom-handles docs](../estreui/custom-handles.en.md). |
| **Static callback registration** (`Class.setOn(...)`) | `main.js` | Define static methods on handle classes to allow external behavior injection. |

## 3. Active Struct & Markup Conventions

| EstreUI Concept | Project Implementation | Guide |
| --- | --- | --- |
| **`data-exported="1"` slots** | `index.html` | Empty slots where export HTML files are injected. See [markup-conventions docs](../estreui/markup-conventions.en.md). |
| **`local-style` blocks** | Export HTML files (`staticDoc.html`, etc.) | `##` is replaced with the host selector for scoped styling. |
| **`data-solid="1"` + `\|token\|` interpolation** | Export HTML files | Doctre-based template freezing/thawing. See [doctre docs](../estreui/doctre.en.md). |
| **Root tabs (`data-tab-id`) / `root_tab_content`** | `index.html`, `staticDoc.html` | Host markup for `switchRootTab(...)`. |

## 4. Navigation API

| EstreUI Concept | Project Usage |
| --- | --- |
| `pageManager.bringPage(pid, intent)` | `main.js`, PagesProvider handlers |
| `estreUi.switchRootTab(name)` | `main.js` |
| `estreUi.closeContainer()` | `main.js` |
| `EstreHandle.activeHandle[uis.<name>]` | `main.js` — query active handle instances |

## 5. Boot Sequence

| Step | Project Implementation |
| --- | --- |
| Script load order | `index.html` — `boot.js` → external libs → `alienese.js` → `estreU0EEOZ.js` → `estreUi.js` → custom handles/pages → `main.js` |
| `estreUi.init(...)` call | `main.js` — call after session/auth initialization |
| `estreUi.checkOnReady(...)` | `main.js` — triggers splash screen exit/transition |

## Adding New Patterns

When you discover or implement a new EstreUI.js usage pattern in your project, add a row to this document with its location. Recording adaptation examples prevents future contributors from repeating the same exploration.
