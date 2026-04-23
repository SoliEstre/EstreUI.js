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

- `post(options)` — `#queue` 에 push, Promise 반환.
- `postHandler()` — 슬롯이 비어 있으면 dequeue 해서 `pageManager.bringPage("!popNoti", ...)` 호출.
- `checkOut(intent)` — 자동 타임아웃 / 위 스와이프 / 탭, Promise resolve, `EstreTimelineStore` 에 append, 다음 dequeue 트리거.

`!popNoti` 페이지 핸들러는 [scripts/estreUi-pageModel.js](../../scripts/estreUi-pageModel.js) 에 있고 바로 위 `popNote` 핸들러와 같은 구조: `onBring` 에서 DOM ref 캐시 + 템플릿 슬롯 준비, `onOpen` 에서 자동 해제 타이머 시작 + 스와이프 와이어링, `onClose` 에서 `checkOut` 호출.

기본 `showTime` 은 `4500ms` (배너는 텍스트가 더 많으니 `note()` 의 기본보다 길게).

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
