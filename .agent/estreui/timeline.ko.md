# Timeline — 배너 히스토리 영구 저장

> Parallel: [timeline.en.md](timeline.en.md)

타임라인은 `noti()` 의 히스토리 파트너 — `checkOut()` 에 도달한 모든 배너가 영구 스토어에 보관되고, overwatchPanel 이 날짜별로 묶인 스크롤 리스트로 그려준다. 타임라인의 **데이터 스키마는 noti 옵션 스키마** — `noti(options)` 가 받는 것이 곧 타임라인이 표시할 수 있는 것.

[scripts/estreUi-notification.js](../../scripts/estreUi-notification.js) 에 배너와 나란히 존재. 클래스 두 개: `EstreTimelineStore` (영속화) 와 `EstreTimelineView` (렌더).

## 스토어 — `EstreTimelineStore`

`ECLS` (Estre Coded Local Storage — `note()` 와 공유되는 JSON 직렬화 `localStorage` 래퍼) 로 백업되는 static 싱글톤.

| 메서드 | 메모 |
| --- | --- |
| `load()` | 최신 순 + TTL 정리된 엔트리 반환. |
| `append(entry)` | 맨 앞에 push, `id` 로 dedup, 상한 강제. |
| `remove(id)` | id 로 삭제. |
| `clear()` | 스토어 비움. |
| `subscribe(cb)` | 뷰 구독. `unsubscribe()` 반환. |

Static 설정:

| 필드 | 기본값 | 메모 |
| --- | --- | --- |
| `maxEntries` | `100` | 최신 우선 상한. |
| `ttlMs` | `7 * 24 * 60 * 60 * 1000` | `load()` 시 정리. |

엔트리는 plain 오브젝트:

```js
{
  id: "1735830000000",     // 없으면 postedAt 으로 자동 생성
  postedAt: 1735830000000, // ms epoch
  title, body, subtitle,
  iconSrc, largeIconSrc,
  url, payload,
  bgColor, textColor,
}
```

스키마는 `noti()` 옵션의 부분집합 — 히스토리 리스트에 의미 있는 필드만 (`showTime`, `interactive` 등은 생략).

## noti() 연동

`EstreNotificationManager.checkOut(intent)` 가 스토어에 append:

```js
// checkOut 내부, 큐 dequeue 신호 뒤:
if (typeof EstreTimelineStore !== "undefined") {
    EstreTimelineStore.append({ postedAt, title, body, subtitle, iconSrc, largeIconSrc, url, payload, bgColor, textColor });
}
```

자체 배너 경로를 쓰는 호스트 프로젝트는 `noti()` 를 경유하지 않고 `EstreTimelineStore.append(...)` 를 직접 호출해 타임라인에 투입해도 된다.

## 뷰 — `EstreTimelineView`

호스트 엘리먼트에 마운트되며, 스토어를 구독하고 변경 시 다시 렌더한다.

```js
const $host = $("#someContainer");
const view = new EstreTimelineView($host);
// 나중에:
view.destroy();  // 구독 해제, 호스트 비움
```

렌더 트리:

```
.timeline_host
├── .timeline_group (날짜 버킷 단위: Today / Yesterday / Older)
│   ├── .timeline_group_header     "TODAY"
│   ├── .h_icon_set.post_block.timeline_item
│   │   ├── .icon_place > img       (largeIcon — 왼쪽)
│   │   └── .content_place
│   │       ├── .title_line > span
│   │       ├── .subtitle_line > span
│   │       └── .content_area
│   │           ├── .content_place  (body — HTML)
│   │           └── .icon_place > img  (icon — 오른쪽)
│   └── …
└── .timeline_empty   "No notifications"  (스토어 비었을 때)
```

아이템 시각은 의도적으로 noti 배너의 `.post_block` 구조를 그대로 재사용 — 같은 아이콘 슬롯, 같은 타이틀/서브타이틀/본문 레이아웃 — 단 [styles/estreUiCore.css](../../styles/estreUiCore.css) 의 `nav#overwatchPanel #timeline` 스코프 스타일이 fixed 포지셔닝과 드롭인 트랜지션을 걷어내고 리스트 맥락에 맞게 반경·그림자를 다듬는다.

## 인터랙션

아이템별:

- **탭** → `url` 이 저장돼 있으면 `window.open(entry.url, "_blank", "noopener")`.
- **좌 스와이프 > 80 px** → `EstreTimelineStore.remove(entry.id)` — 다음 렌더에서 사라진다.

두 핸들러 모두 `.setStopPropagation()` 을 건 `EstreSwipeHandler` — 상단 패널의 열기/닫기 제스처와 충돌하지 않는다.

## overwatchPanel 마운트

[scripts/estreUi-main.js](../../scripts/estreUi-main.js) 의 `onLoadedOverwatchPanel` 이 `initOverwatchPanelHandles()` 직후에 `initOverwatchPanelTimeline()` 를 호출:

```js
initOverwatchPanelTimeline() {
    if (typeof EstreTimelineView === "undefined") return;
    const $timeline = this.$overwatchPanel.find("#timeline");
    if ($timeline.length < 1) return;
    this.timelineView = new EstreTimelineView($timeline);
}
```

`overwatchPanel.html` 내 `#timeline` 슬롯은 이미 퀵패널이 static `block_item` 으로 선언해 둔 상태 ([quick-panel.ko.md](quick-panel.ko.md) 참고) — 타임라인은 비어 있던 섹션을 채울 뿐이다.

## 관련 문서

- [noti-banner.ko.md](noti-banner.ko.md) — 파이프라인의 배너 쪽.
- [quick-panel.ko.md](quick-panel.ko.md) — 타임라인을 호스팅하는 패널.
- [roadmap/010-timeline.md](roadmap/010-timeline.md) — 본 컴포넌트를 만들어낸 범위.
