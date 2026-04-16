# EstreUI.js — Overview

> Parallel: [overview.ko.md](overview.ko.md)

## What it is

EstreUI.js is a **Rimwork** (a runnable frame), not a framework or a library in the conventional sense. It supplies the *rim*: the page model, lifecycle, navigation, and DOM-binding scaffolding. It deliberately leaves *content* to the developer, who is expected to fill pages using whatever they prefer (typically jQuery, but any DOM toolkit works).

Two audiences are explicitly targeted:

- **Classic web developers** who already write jQuery / ASP / PHP / JSP and want a single-page, app-like shell without committing to a heavy SPA framework.
- **Native app developers** moving to the web, who will recognise lifecycle events (`onShow`/`onHide`/`onClose`) and intent-passing semantics from Android.

The project also ships a Flutter wrapper named WVCA4EUI for hybrid/native packaging, but the JS side has no hard dependency on it.

## How a page is composed

EstreUI organises everything as a tree of four addressable units (top → bottom in the URL/PID syntax):

```
Layer  ─ &m | &h | &u | &b | &o | &f
Section ─ id of a <section data-static="1" | data-static="">
Container ─ id of a <div class="container" data-container-id="...">
Article ─ id of an <article data-article-id="...">
```

A **PID** is the joined string, e.g. `&m=class#classRecords@details`. See [pid-and-layout.en.md](pid-and-layout.en.md) for the full grammar.

The HTML is split across a small set of *exported* host files that the rim mounts at startup:

| Slot in `index.html` | Export file | Purpose |
| --- | --- | --- |
| `<header id="fixedTop" data-exported="1">` | `fixedTop.html` | Persistent top bar / appbar host. |
| `<footer id="fixedBottom" data-exported="1">` | `fixedBottom.html` | Persistent bottom bar / instant-section host. |
| `<nav id="mainMenu" data-exported="1">` | `mainMenu.html` | Slide-in menu drawer. |
| `<main id="staticDoc" data-exported="1">` | `staticDoc.html` | Static (non-closeable) sections. |
| `<main id="instantDoc" data-exported="1">` | `instantDoc.html` | Instant (loadable/closeable) sections. |
| `<nav id="managedOverlay" data-exported="1">` | `managedOverlay.html` | Dialogs, toasts, popups. |

## Lifecycle

Each page handler runs through:

```
onBring → onOpen (once) → onShow → … → onHide → onClose (once) → onRelease
```

…with auxiliary callbacks `onBack`, `onReload`, `onIntentUpdated` (new data while page is alive), and `onApplied` (after data binding completes). Details: [page-handlers.en.md](page-handlers.en.md).

## The two extension points you will use most

1. **Custom Handles** — subclass `EstreHandle`, register against a CSS selector. Any matching DOM element gets a controller instance that mirrors the page lifecycle. See [custom-handles.en.md](custom-handles.en.md).
2. **Page Handlers** — declare a class extending `EstrePageHandler` for each PID. A *Pages Provider* aggregates them into a single map passed to the page manager at boot.

## Minimal mental model

```
┌─────────────────────────────────────────────────────────────┐
│                       index.html (Rim)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ fixedTop │ │ mainMenu │ │ overlay  │ │  staticDoc /   │  │
│  │ (header) │ │ (drawer) │ │ (dialog) │ │  instantDoc    │  │
│  └──────────┘ └──────────┘ └──────────┘ │  (sections)    │  │
│                                          └────────────────┘  │
│           ▲ EstreUiPageManager (PID → page handler) ▲        │
│           │                                          │        │
│   custom MyPagesProvider               custom MyHandle (×N)   │
│   (extends EstreUiCustomPageManager)   (extends EstreHandle)  │
└─────────────────────────────────────────────────────────────┘
```

## What this documentation covers (and what it does not)

This doc set covers EstreUI's public surface: PID grammar, layer model, lifecycle, handle authoring, markup conventions, boot sequence, navigation API. It does **not** document any specific application built on top.

For a higher-level summary of the upstream README, refer to [SoliEstre/EstreUI.js](https://github.com/SoliEstre/EstreUI.js) directly — this folder is meant to be a richer, case-based companion to that README, not a replacement.
