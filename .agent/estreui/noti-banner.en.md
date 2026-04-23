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

- `post(options)` — pushes onto `#queue`, returns a Promise.
- `postHandler()` — dequeues if the slot is idle, calls `pageManager.bringPage("!popNoti", ...)`.
- `checkOut(intent)` — auto-timeout / swipe-up / tap, resolves the Promise, appends to `EstreTimelineStore`, triggers the next dequeue.

The `!popNoti` page handler lives in [scripts/estreUi-pageModel.js](../../scripts/estreUi-pageModel.js) and mirrors the `popNote` handler one block above: `onBring` caches DOM refs and primes the template slots, `onOpen` starts the auto-dismiss timer and wires swipe, `onClose` calls `checkOut`.

Default `showTime` is `4500ms` (longer than `note()`'s default, since banners carry more text).

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

Dark mode is automatic via `--cabr` / `--ca` tokens — no explicit dark rules needed.

## Relation to timeline

Every `checkOut()` appends the banner's data to `EstreTimelineStore` (roadmap #010). That store powers the overwatchPanel timeline list — see [timeline.en.md](timeline.en.md). Any field you pass to `noti()` that makes sense in a history list (title, body, subtitle, icon pair, url, payload, bgColor, textColor) is persisted; UI-only fields (`showTime`, `interactive`, etc.) are not.

## See also

- [timeline.en.md](timeline.en.md) — persistent history for dismissed banners.
- [quick-panel.en.md](quick-panel.en.md) — the overwatchPanel that hosts the timeline view.
- [roadmap/009-noti-banner.md](roadmap/009-noti-banner.md) — scope that produced this component.
