# PID & Layer / Section / Container / Article

> Parallel: [pid-and-layout.ko.md](pid-and-layout.ko.md)

## What a PID is

A **PID** (Page IDentifier) is a single string that fully addresses *one* navigable unit in an EstreUI app. It is the only identifier you pass to `bringPage()`, register in a Pages Provider, or store in a session-restore cache.

```
&<layer>=<sectionId>^<instanceOrigin>#<containerId>@<articleId>%<stepIndex>
└─────┘ └────────┘└──────────────┘ └────────────┘ └──────────┘└──────────┘
 layer    section   multi-instance    container       article   stack step
```

All segments after the layer prefix are optional. The shortest valid PID is just `&<layer>=<sectionId>`.

### Examples

| PID | Means |
| --- | --- |
| `&m=home` | Section `home` inside the *Main* layer. |
| `&m=catalog#detail` | Container `detail` inside section `catalog`. |
| `&m=catalog#detail@reviews` | Article `reviews` inside that container. |
| `&b=login#signup@step%0` | First step (`%0`) of a stack-navigation article `step` inside container `signup` of section `login` in the *Blinded* layer. |
| `&b=editor^abc123#root@main` | Multi-instance section `editor` with instance origin `abc123`. The `^` marks it as multi-instance-capable; the origin identifies this particular instance. |

## The six layers

The layer prefix maps to one of six z-stacked regions. From bottom to top:

| Prefix | Conventional name | Typical home in `index.html` | Typical use |
| --- | --- | --- | --- |
| `&m=` | **MainSections** | `<main id="staticDoc">`, `<main id="instantDoc">` | Primary screens (home, lists, details). |
| `&f=` | **FooterSections** | `<footer id="fixedBottom">` | Bottom-pinned UI surfaces. |
| `&u=` | **MenuSections** | `<nav id="mainMenu">` | Side/drawer menus. |
| `&h=` | **HeaderSections** | `<header id="fixedTop">` | Top bars, appbars. |
| `&b=` | **BlindedSections** | `<main id="instantDoc">` (modal-blinded) | Auth, full-screen takeovers, blocking flows. |
| `&o=` | **OverlaySections** | `<nav id="managedOverlay">` | Dialogs, toasts, popups. |

Layers are independent — a `&h=` page and a `&m=` page can be alive simultaneously and address different DOM hosts.

## Static vs. Instant sections

Inside any layer, a section is either:

- **Static** — `<section data-static="1">`. Mounted once at boot from a section export file (e.g. `staticDoc.html`). Cannot be closed; can only be hidden. PID convention: starts with `$s` when referenced as a primitive.
- **Instant** — `<section data-static="">` (or no attribute). Loaded lazily and released on close. PID convention: starts with `$i` as a primitive.

The `data-static` attribute also applies to **containers and articles**. When a container or article is marked `data-static="1"` but its parent section is *instant*, the static children open and close together with the instant parent — they are "static within the scope of their parent's lifetime", not globally persistent. Only a section-level static element survives indefinitely.

Most application code addresses sections by their plain id (`home`, `login`, …); the `$s` / `$i` prefixes appear only in low-level APIs.

## Container & Article

A **container** is the major surface inside a section — usually one container is "primary" and others overlay or replace it. Containers carry `data-container-id`.

An **article** is a content slot inside a container. Multiple articles let one container present alternative views (tabs, steps, slides) without unmounting the container itself.

```html
<section id="catalog" data-static="1">
    <div class="container" data-container-id="root">
        <article data-article-id="main">…</article>
        <article data-article-id="empty">…</article>
    </div>
    <div class="container" data-container-id="detail">
        <article data-article-id="overview">…</article>
        <article data-article-id="reviews">…</article>
    </div>
</section>
```

With this markup, all four addresses are valid PIDs:

```
&m=catalog#root@main
&m=catalog#root@empty
&m=catalog#detail@overview
&m=catalog#detail@reviews
```

## Multi-instance (`^` + instanceOrigin)

The `^` suffix on a section (or any segment) marks it as **multi-instance capable**: multiple live copies of the same section can coexist, each distinguished by an **instanceOrigin** appended after the `^`.

```
&b=editor^abc123#root@main   ← instance "abc123"
&b=editor^xyz789#root@main   ← instance "xyz789" (alive alongside abc123)
```

Without a `^`, bringing the same section again reuses the existing one. With `^`, a new instance is created each time a different instanceOrigin is specified. Typical uses: image viewers, content editors, detail pages that can be opened for multiple items simultaneously.

When no instanceOrigin is given (just a bare `^`), the framework assigns one automatically:

```
&b=viewer^#root@main   ← auto-assigned instance origin
```

## Stack-navigation steps (`%n`)

The `%<n>` suffix is used **inside containers whose article group is configured for stack navigation** (`v_stack` / `h_stack`). It denotes a fixed-order step index (zero-based) within the stack, not a general multi-instance mechanism.

```
&b=login#signup@step%0   ← step 0 (e.g. personal verification)
&b=login#signup@step%1   ← step 1 (e.g. identity input)
&b=login#signup@step%2   ← step 2 (e.g. create account)
&b=login#signup@step%3   ← step 3 (e.g. user agreement)
```

The stack manages forward/back transitions between steps. Each `%n` shares the same article template but represents a distinct position in the flow. Navigation within the stack is typically driven by the page handler, not by directly calling `bringPage` with individual `%n` PIDs.

## Reading a PID at a glance

```
&b=editor^abc123#detail@form%2
│  │      │       │     │    └─ stack step index (3rd step)
│  │      │       │     └───── article id
│  │      │       └──────────── container id
│  │      └──────────────────── instance origin (multi-instance)
│  └─────────────────────────── section id + ^ (multi-instance marker)
└────────────────────────────── layer = Blinded
```

If the PID lacks a `#`, the implied container is the section's primary one (commonly `root`); if it lacks an `@`, the implied article is the container's first/default.

## Implementation pointers

- All PIDs an app accepts are usually declared once as friendly aliases in the Pages Provider's `static get pages` map (see [page-handlers.en.md](page-handlers.en.md)).
- `pageManager.bringPage(alias, intent)` looks up the alias to get the canonical PID, then resolves it down to a layer/section/container/article 4-tuple internally.
- The exported section files only need to declare the `<section>` skeleton with the right ids and `data-static` value; everything inside is yours.
