# noti() — iOS-style Notification Banner

> Parallel: [noti-banner.ko.md](noti-banner.ko.md)

`noti(options)` is EstreUI's top-drop notification banner — an iOS-styled counterpart to the bottom-rising `note()` toast. It shares the queue/sequence discipline of `EstreNotationManager` (one banner at a time, per-item `showTime`) but adds a richer layout: icon pair, title / subtitle / body, optional interactive dismiss.

Lives in [scripts/estreUi-notification.js](../../scripts/estreUi-notification.js). Loaded after `estreUi-notation.js` and before `estreUi-pageModel.js` — the popNoti page handler references `EstreNotificationManager` at runtime.

## Public signature

The positional signature follows the frequency-first rule: `title` and `body` are the two common inputs. Everything else is keyword-only via a trailing `options` object.

```js
noti(title, body, onTakeInteraction, mainIconSrc, subIconSrc);
// or, object-first for any field:
noti({ title, body, subtitle, icon, largeIcon, url, data, buttons, ui: { showTime, ... } });
```

| Arg | Type | Notes |
| --- | --- | --- |
| `title` | string \| object | When object, treated as the whole options bag. |
| `body` | string | Plain text (HTML also accepted, matches `note()`). |
| `onTakeInteraction` | function \| `noti.noInteraction` | Fires when user taps or swipes **down**. |
| `mainIconSrc` | string | Large icon (left). Maps to `largeIcon` key. |
| `subIconSrc` | string | Small icon (right, inside content area). Maps to `icon` key. |

Returns a `Promise<EstreNotificationManager>` that resolves when the banner is dismissed (timeout, swipe-up, tap).

## Options schema

The schema absorbs the intersection of **FCM / APNs / OneSignal** push payloads so a native bridge can forward a raw object to `noti()` without pre-mapping.

| Key | Maps to | Notes |
| --- | --- | --- |
| `title` | FCM `title`, APNs `alert.title`, OneSignal `headings[lang]` | |
| `body` | FCM `body`, APNs `alert.body`, OneSignal `contents[lang]` | |
| `subtitle` | APNs `alert.subtitle`, OneSignal `subtitle` | |
| `icon` | FCM `icon`, APNs `alert.sound`/asset | Small icon (right). |
| `largeIcon` | FCM `image`, OneSignal `big_picture` | Main icon (left). |
| `data` | FCM `data`, OneSignal `additionalData` | Opaque payload. |
| `url` | click action | Opened on tap. |
| `buttons[]` | action buttons | Reserved — rendered empty for now. |
| `ui` | EstreUI-only namespace | `showTime`, `interactive`, `textColor`, `bgColor`, etc. |

Push-format adapters pre-map to this schema:

```js
noti.fromFcm(payload);       // expects { notification: {...}, data: {...} }
noti.fromApns(payload);      // expects { aps: { alert: {...} }, ... }
noti.fromOneSignal(payload); // expects { headings, contents, ... }
```

## Queue + page handle

Banners go through `EstreNotificationManager` (static singleton, mirrors `EstreNotationManager`):

- `post(options)` — pushes onto `#queue`, returns a Promise. If the overwatchPanel timeline is currently visible (`isOpenOverwatchPanel` + the timeline host item on-screen), `post()` short-circuits: the entry is appended to `EstreTimelineStore` directly and no banner is shown, mirroring iOS's "don't drop a banner over your own Notification Center" rule.
- `postHandler()` — dequeues if the slot is idle, calls `pageManager.bringPage("!popNoti", ...)`.
- `beginCheckOut(intent)` — called at close-**start** (see queue parallelism below). Releases the queue slot, resolves the Promise, appends to `EstreTimelineStore`, and triggers the next dequeue. Flags the intent with `_earlyCheckedOut` so the later `checkOut()` pass is a noop.
- `checkOut(intent)` — the lifecycle's `onClose` callback. Idempotent: if the intent was already early-checked-out, returns without re-appending or re-queuing.

The `!popNoti` page handler lives in [scripts/estreUi-pageModel.js](../../scripts/estreUi-pageModel.js) and mirrors the `popNote` handler one block above: `onBring` caches DOM refs and primes the template slots, `onOpen` starts the auto-dismiss timer and wires swipe, `onClose` calls `checkOut`. The handler additionally implements `onIntentUpdated` to support in-place content swap when the queue hands off to the next banner without closing the article (see next section).

Default `showTime` is `4500ms` (longer than `note()`'s default, since banners carry more text).

## Queue parallelism — overlapping exit/enter

When a banner dismisses and another entry is already waiting in the queue, the two animations overlap instead of playing back-to-back:

1. On dismiss (timer / swipe-up / tap), the handler clones `.post_block` into a detached **ghost** positioned absolutely at the same spot, hides the live block (`visibility: hidden`), and adds the `banner_ghost_exit` class — a CSS animation that slides + fades the ghost upward and auto-removes it after ~550 ms.
2. The handler calls `beginCheckOut(intent)` which dequeues the next entry immediately — not at the end of the exit animation.
3. `pageManager.bringPage` on the same `!popNoti` target finds the article still open, so it calls `pushIntent` + `show(false)` on the existing article. `pushIntent` fires `onIntentUpdated` on the handler.
4. `onIntentUpdated` unhides `.post_block`, rewrites the template slots from the new intent, and retriggers the `banner_incoming` animation (class remove → forced reflow → re-add) — slides + fades the incoming content down into place.

Single-banner dismiss (queue empty) keeps the original path: `handle.close()` runs the page system's native hide transition.

`position: relative; z-index: 1` on `.post_block` + `z-index: 0` on `.banner_ghost_exit` ensure the incoming banner paints **above** the outgoing ghost during the crossfade.

## Gestures

Built on `EstreSwipeHandler` (shared with panel sheets / timeline items):

- **Up swipe > 20 px** → immediate dismiss (`checkOut` with no interaction).
- **Down swipe > 40 px** → triggers `onTakeInteraction`, then dismisses.
- **Tap** → same as down-swipe — interaction + dismiss.

## Visuals

`.post_block` styling lives in [styles/estreUiCore2.css](../../styles/estreUiCore2.css) inside the `div.container[data-container-id="noti"]` scope. Key tokens:

- Background — `rgb(var(--cabr) / 70%)` + `backdrop-filter: var(--basic-backdrop-blur)` (common blur token).
- Radius — `18px`. Shadow — `1px 4px 8px 2px rgb(var(--ca) / 25%)` (matches `note()` shadow for visual parity).
- Transition — `cubic-bezier(0.25, 0.46, 0.45, 0.94)` 450 ms. Enter slides from above, exit slides back up.
- Queue handover — `banner_incoming` (enter) and `banner_ghost_exit` (exit) keyframes reuse the same curve/duration so the overlapping animations feel like a single continuous motion.

Dark mode is automatic via `--cabr` / `--ca` tokens — no explicit dark rules needed.

## Relation to timeline

Every `checkOut()` appends the banner's data to `EstreTimelineStore` (roadmap #010). That store powers the overwatchPanel timeline list — see [timeline.en.md](timeline.en.md). Any field you pass to `noti()` that makes sense in a history list (title, body, subtitle, icon pair, url, payload, bgColor, textColor) is persisted; UI-only fields (`showTime`, `interactive`, etc.) are not.

## See also

- [timeline.en.md](timeline.en.md) — persistent history for dismissed banners.
- [quick-panel.en.md](quick-panel.en.md) — the overwatchPanel that hosts the timeline view.
- [roadmap/009-noti-banner.md](roadmap/009-noti-banner.md) — scope that produced this component.
