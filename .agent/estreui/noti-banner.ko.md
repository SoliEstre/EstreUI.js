# noti() — iOS 스타일 알림 배너

> Parallel: [noti-banner.en.md](noti-banner.en.md)

`noti(options)` 는 EstreUI 의 상단 드롭 알림 배너 — 하단에서 올라오는 `note()` 토스트의 iOS 스타일 대응. `EstreNotationManager` 의 큐/순차 규율(한 번에 하나, per-item `showTime`)을 그대로 계승하되, 아이콘 쌍·타이틀/서브타이틀/본문·선택적 인터랙션 해제가 추가된 더 풍부한 레이아웃을 제공한다.

[scripts/estreUi-notification.js](../../scripts/estreUi-notification.js) 에 있다. 로드 순서는 `estreUi-notation.js` 뒤, `estreUi-pageModel.js` 앞 — popNoti 페이지 핸들러가 런타임에 `EstreNotificationManager` 를 참조하기 때문.

## 공개 시그니처

Positional 순서는 frequency-first 규칙 — `title` / `body` 가 가장 흔한 두 입력. 나머지는 뒤에 붙는 `options` 오브젝트로 키워드 전달.

```js
noti(title, body, onTakeInteraction, mainIconSrc, subIconSrc);
// 또는, 어떤 필드든 지정 가능한 object-first:
noti({ title, body, subtitle, icon, largeIcon, url, data, buttons, ui: { showTime, ... } });
```

| 인자 | 타입 | 메모 |
| --- | --- | --- |
| `title` | string \| object | object 이면 전체 options 로 취급. |
| `body` | string | 평문 (`note()` 와 동일하게 HTML 도 허용). |
| `onTakeInteraction` | function \| `noti.noInteraction` | 사용자 탭 / **아래 스와이프** 시 발화. |
| `mainIconSrc` | string | 큰 아이콘(왼쪽). `largeIcon` 키로 매핑. |
| `subIconSrc` | string | 작은 아이콘(오른쪽, content_area 내). `icon` 키로 매핑. |

반환값은 `Promise<EstreNotificationManager>` — 배너가 해제(타임아웃·위 스와이프·탭)되면 resolve 된다.

## options 스키마

**FCM / APNs / OneSignal** 푸시 페이로드의 교집합을 흡수 — 네이티브 브릿지가 받은 raw 객체를 별도 매핑 없이 `noti()` 로 포워딩할 수 있다.

| 키 | 매핑 | 메모 |
| --- | --- | --- |
| `title` | FCM `title`, APNs `alert.title`, OneSignal `headings[lang]` | |
| `body` | FCM `body`, APNs `alert.body`, OneSignal `contents[lang]` | |
| `subtitle` | APNs `alert.subtitle`, OneSignal `subtitle` | |
| `icon` | FCM `icon`, APNs 에셋 | 작은 아이콘(오른쪽). |
| `largeIcon` | FCM `image`, OneSignal `big_picture` | 큰 아이콘(왼쪽). |
| `data` | FCM `data`, OneSignal `additionalData` | 불투명 페이로드. |
| `url` | click action | 탭 시 열림. |
| `buttons[]` | 액션 버튼 | 예약 — 현재는 비어 있음. |
| `ui` | EstreUI 전용 네임스페이스 | `showTime`, `interactive`, `textColor`, `bgColor` 등. |

푸시 포맷 어댑터가 이 스키마로 변환해 준다:

```js
noti.fromFcm(payload);       // { notification: {...}, data: {...} } 를 기대
noti.fromApns(payload);      // { aps: { alert: {...} }, ... } 를 기대
noti.fromOneSignal(payload); // { headings, contents, ... } 를 기대
```

## 큐 + 페이지 핸들

배너는 `EstreNotificationManager` (static 싱글톤, `EstreNotationManager` 미러) 를 통과한다:

- `post(options)` — `#queue` 에 push, Promise 반환. overwatchPanel 의 타임라인이 현재 보이는 중이면 (`isOpenOverwatchPanel` + 타임라인 host item 이 화면상) `post()` 는 배너를 띄우지 않고 곧바로 `EstreTimelineStore` 에 append 해서 단락 처리한다 — iOS 의 "알림 센터 위에 배너를 덮어쓰지 않는다" 규칙과 동일.
- `postHandler()` — 슬롯이 비어 있으면 dequeue 해서 `pageManager.bringPage("!popNoti", ...)` 호출.
- `beginCheckOut(intent)` — close **시작 시점** 에 호출 (아래 큐 병렬화 참고). 큐 슬롯을 즉시 해제하고, Promise resolve, `EstreTimelineStore` 에 append, 다음 dequeue 트리거. intent 에 `_earlyCheckedOut` 플래그를 달아 두어 이후 `checkOut()` 호출이 noop 이 되도록 한다.
- `checkOut(intent)` — 라이프사이클 `onClose` 콜백. 멱등 — intent 가 이미 early-checked-out 상태라면 재-append / 재-큐잉 없이 바로 반환.

`!popNoti` 페이지 핸들러는 [scripts/estreUi-pageModel.js](../../scripts/estreUi-pageModel.js) 에 있고 바로 위 `popNote` 핸들러와 같은 구조: `onBring` 에서 DOM ref 캐시 + 템플릿 슬롯 준비, `onOpen` 에서 자동 해제 타이머 시작 + 스와이프 와이어링, `onClose` 에서 `checkOut` 호출. 추가로 `onIntentUpdated` 를 구현해 article 를 닫지 않고 다음 배너로 콘텐츠를 교체하는 큐 핸드오프를 지원한다 (다음 절 참고).

기본 `showTime` 은 `4500ms` (배너는 텍스트가 더 많으니 `note()` 의 기본보다 길게).

## 큐 병렬화 — 퇴장/등장 오버랩

배너가 해제되는 시점에 다음 엔트리가 큐에 이미 대기 중이라면, 두 애니메이션은 연속 재생 대신 오버랩해서 재생된다:

1. 해제 트리거 (타이머 / 위 스와이프 / 탭) 시 핸들러가 `.post_block` 을 복제해 같은 자리에 absolute 로 띄운 **ghost** 를 만들고, 실제 블록은 `visibility: hidden` 으로 숨긴 뒤 ghost 에 `banner_ghost_exit` 클래스를 건다 — CSS 애니메이션이 ghost 를 위로 슬라이드 + 페이드 아웃 시키고 ~550 ms 뒤 자동 제거.
2. 핸들러가 `beginCheckOut(intent)` 를 호출해 다음 엔트리를 **즉시** dequeue — 퇴장 애니메이션이 끝날 때까지 기다리지 않는다.
3. 같은 `!popNoti` 대상에 `pageManager.bringPage` 가 진입하면 article 이 여전히 열려 있으므로 `pushIntent` + `show(false)` 가 호출된다. `pushIntent` 가 핸들러의 `onIntentUpdated` 를 발화.
4. `onIntentUpdated` 는 `.post_block` 을 다시 표시하고, 새 intent 에서 템플릿 슬롯을 다시 쓰고, `banner_incoming` 애니메이션을 재시작 (class 제거 → 강제 reflow → 다시 추가) — 들어오는 콘텐츠가 위에서 아래로 슬라이드 + 페이드 인.

단일 배너 해제 (큐 비어 있음) 는 원래 경로를 그대로 — `handle.close()` 가 페이지 시스템의 native hide 트랜지션을 돌린다.

`.post_block` 의 `position: relative; z-index: 1` + `.banner_ghost_exit` 의 `z-index: 0` 으로 들어오는 배너가 나가는 ghost **위** 레이어로 그려진다.

## 제스처

`EstreSwipeHandler` 위에 구현 (패널 시트 / 타임라인 아이템과 공유):

- **위 스와이프 > 20 px** → 즉시 해제 (`checkOut`, 인터랙션 없음).
- **아래 스와이프 > 40 px** → `onTakeInteraction` 발화, 이후 해제.
- **탭** → 아래 스와이프와 동일 — 인터랙션 + 해제.

## 시각

`.post_block` 스타일은 [styles/estreUiCore2.css](../../styles/estreUiCore2.css) 의 `div.container[data-container-id="noti"]` 스코프에 있다. 주요 토큰:

- 배경 — `rgb(var(--cabr) / 70%)` + `backdrop-filter: var(--basic-backdrop-blur)` (공통 블러 토큰).
- 반경 — `18px`. 그림자 — `1px 4px 8px 2px rgb(var(--ca) / 25%)` (시각 일관성을 위해 `note()` 그림자와 동일).
- 전환 — `cubic-bezier(0.25, 0.46, 0.45, 0.94)` 450 ms. 등장은 위에서 내려옴, 퇴장은 위로 돌아감.

다크 모드는 `--cabr` / `--ca` 토큰으로 자동 — 별도 다크 규칙 불필요.

## 타임라인과의 관계

`checkOut()` 호출마다 해당 배너의 데이터가 `EstreTimelineStore` 로 append 된다 (로드맵 #010). 이 스토어가 overwatchPanel 타임라인 리스트를 구동 — [timeline.ko.md](timeline.ko.md) 참고. `noti()` 에 넘긴 필드 중 히스토리 리스트에 의미 있는 것(title, body, subtitle, 아이콘 쌍, url, payload, bgColor, textColor)만 보존되고, UI 전용(`showTime`, `interactive` 등) 은 저장되지 않는다.

## 관련 문서

- [timeline.ko.md](timeline.ko.md) — 해제된 배너의 영구 히스토리.
- [quick-panel.ko.md](quick-panel.ko.md) — 타임라인 뷰를 호스팅하는 overwatchPanel.
- [roadmap/009-noti-banner.md](roadmap/009-noti-banner.md) — 본 컴포넌트를 만들어낸 범위.
