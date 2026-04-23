# Timeline — Persistent Banner History

> Parallel: [timeline.ko.md](timeline.ko.md)

The Timeline is the history companion to `noti()`: every banner that reaches `checkOut()` is archived into a persistent store, and the overwatchPanel renders them in a scrollable list grouped by date. The timeline's **data schema is the noti options schema** — what `noti(options)` accepts is exactly what the timeline can display.

Lives in [scripts/estreUi-notification.js](../../scripts/estreUi-notification.js) alongside the banner itself. Two classes: `EstreTimelineStore` (persistence) and `EstreTimelineView` (render).

## Store — `EstreTimelineStore`

Static singleton backed by `ECLS` (Estre Coded Local Storage — JSON-serialized `localStorage` wrapper, shared with `note()`).

| Method | Notes |
| --- | --- |
| `load()` | Returns entries newest-first, TTL-pruned. |
| `append(entry)` | Pushes an entry to the front, dedupes by `id`, enforces cap. |
| `remove(id)` | Removes by id. |
| `clear()` | Empties the store. |
| `subscribe(cb)` | View subscription. Returns `unsubscribe()`. |

Static config:

| Field | Default | Notes |
| --- | --- | --- |
| `maxEntries` | `100` | Newest-first cap. |
| `ttlMs` | `7 * 24 * 60 * 60 * 1000` | Pruned on `load()`. |

Entries are plain objects:

```js
{
  id: "1735830000000",     // auto-generated from postedAt if missing
  postedAt: 1735830000000, // ms epoch
  title, body, subtitle,
  iconSrc, largeIconSrc,
  url, payload,
  bgColor, textColor,
}
```

The schema is a subset of the `noti()` options — fields that make sense in a history list (`showTime`, `interactive`, etc. are omitted).

## noti() integration

`EstreNotificationManager.checkOut(intent)` appends to the store:

```js
// inside checkOut, after the queue dequeue signals:
if (typeof EstreTimelineStore !== "undefined") {
    EstreTimelineStore.append({ postedAt, title, body, subtitle, iconSrc, largeIconSrc, url, payload, bgColor, textColor });
}
```

Host projects writing their own banner path can call `EstreTimelineStore.append(...)` directly to feed the timeline without going through `noti()`.

## View — `EstreTimelineView`

Mounts onto a host element, subscribes to the store, re-renders on change.

```js
const $host = $("#someContainer");
const view = new EstreTimelineView($host);
// later:
view.destroy();  // unsubscribes, empties host
```

Render tree:

```
.timeline_host
├── .timeline_group (per date bucket: Today / Yesterday / Older)
│   ├── .timeline_group_header     "TODAY"
│   ├── .h_icon_set.post_block.timeline_item
│   │   ├── .icon_place > img       (largeIcon — left)
│   │   └── .content_place
│   │       ├── .title_line > span
│   │       ├── .subtitle_line > span
│   │       └── .content_area
│   │           ├── .content_place  (body — HTML)
│   │           └── .icon_place > img  (icon — right)
│   └── …
└── .timeline_empty   "No notifications"  (when store is empty)
```

Item visuals intentionally reuse `.post_block` structure from the noti banner — same icon slots, same title/subtitle/body layout — but scoped styling under `nav#overwatchPanel #timeline` in [styles/estreUiCore.css](../../styles/estreUiCore.css) drops the fixed positioning, the drop-in transition, and tightens the radius / shadow for a list context.

## Interactions

Per-item:

- **Tap** → `window.open(entry.url, "_blank", "noopener")` when a `url` was stored.
- **Left swipe > 80 px** → `EstreTimelineStore.remove(entry.id)` — the item disappears on the next render.

Both handlers use `EstreSwipeHandler` with `.setStopPropagation()` so they don't fight the panel's open/close gesture above.

## overwatchPanel mount

`onLoadedOverwatchPanel` in [scripts/estreUi-main.js](../../scripts/estreUi-main.js) calls `initOverwatchPanelTimeline()` right after `initOverwatchPanelHandles()`:

```js
initOverwatchPanelTimeline() {
    if (typeof EstreTimelineView === "undefined") return;
    const $timeline = this.$overwatchPanel.find("#timeline");
    if ($timeline.length < 1) return;
    this.timelineView = new EstreTimelineView($timeline);
}
```

The `#timeline` slot inside `overwatchPanel.html` is already declared as a static `block_item` by the Quick Panel (see [quick-panel.en.md](quick-panel.en.md)) — timeline just fills the previously-empty section.

## See also

- [noti-banner.en.md](noti-banner.en.md) — the banner side of the pipeline.
- [quick-panel.en.md](quick-panel.en.md) — the panel hosting the timeline.
- [roadmap/010-timeline.md](roadmap/010-timeline.md) — scope that produced this component.
