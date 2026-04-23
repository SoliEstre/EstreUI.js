# #009 — noti() 배너

- **우선순위**: 🟡 보통
- **분류**: 컴포넌트
- **상태**: ✅ 완료

## 배경

[estreUi-dialog.js](../../../scripts/estreUi-dialog.js#L506) 의 `noti(title, htmlContent, onTakeInteraction, mainIconSrc, subIconSrc)` 는 현재 `//<= To do implement` 주석만 있는 stub. 본 항목은 이를 iOS 스타일 알림 배너로 본구현한다.

큐 · 순차 표시 · per-item showTime 등 동작은 [estreUi-notation.js](../../../scripts/estreUi-notation.js#L13) 의 `EstreNotationManager` (=`note()`) 구조를 그대로 준용한다. `note()` 가 텍스트 토스트를 큐 기반으로 순차 표시하는 것처럼, `noti()` 는 iOS 배너를 큐 기반으로 순차 표시한다.

한편 호스트 프로젝트의 네이티브 브릿지(예: `scripts/main.js:523~571` 의 raw `noti` 객체 처리)가 FCM / APNs / OneSignal payload 를 받아 in-app 배너로 띄우는 경로와 진입점을 통일하기 쉽도록, `options` 형식은 세 포맷의 공통 분모를 흡수한다.

## 범위

### 시각 · 애니메이션 · 제스처 — iOS 레퍼런스

- 상단에서 내려오는 배너. 둥근 모서리, 반투명 + 백드롭 블러 배경.
- 아이콘(대/소) + 타이틀 + 본문 + 선택적 서브텍스트/버튼의 iOS 배너 레이아웃.
- 등장: 감속(cubic-bezier) 하강 애니메이션. 자동 퇴장: 위로 사라짐.
- 스와이프:
    - 위 → 즉시 해제 (`checkOut` 트리거).
    - 아래 → 확장 / 인터랙티브 콘텐츠 노출 (iOS Rich Notification 대응, 본 phase 에서는 스텁만 둘 수도 있음).
- 다크 모드 자동 대응 — 기존 토큰(`--color-*`, `--cabr`, `--cadm`) 만 사용.

### 큐 · 순차 표시 — `EstreNotationManager` 패턴 준용

- `EstreNotificationManager` 신설 (파일 분할 대상: `scripts/estreUi-notification.js` 신규 또는 `estreUi-dialog.js` 내부).
- `#queue` / `current` / `postHandle` 를 갖고 한 번에 하나만 노출.
- `post(options)` → Promise 반환, 큐 push 후 `postHandler()` 호출.
- 각 배너는 개별 `showTime` 보유 (기본값 `note()` 보다 길게 — 예: 4500ms).
- 자동 타임아웃 또는 위 스와이프 / 탭 인터랙션 시 `checkOut(intent)` → 다음 dequeue.
- pageManager 통합: `!popNoti` 페이지 핸들러 슬롯은 이미 빈 `class extends EstrePageHandler { }` 로 등록되어 있음 — alias [estreUi-pageManager.js:65](../../../scripts/estreUi-pageManager.js#L65), 핸들러 [estreUi-pageModel.js:3726](../../../scripts/estreUi-pageModel.js#L3726). 본 phase 는 [#3727~#3753 popNote 핸들러](../../../scripts/estreUi-pageModel.js#L3727-L3753) 의 `onBring / onOpen / onClose` 패턴을 모방해 이 빈 슬롯을 채운다.

### `options` 스키마 — 푸시 포맷 공통 분모

- 공통 흡수 키(세 포맷 교집합 우선): `title`, `body` (=FCM `body` / APNs `alert.body` / OneSignal `contents`), `subtitle`, `icon`, `largeIcon` (=`image` / FCM `image`), `data`, `url` (=click action), `buttons[]`.
- EstreUI 고유 옵션은 별도 네임스페이스(예: `ui: { showTime, interactive, textColor, ... }`) 에 둬서 키 충돌 방지.
- 어댑터 함수: `noti.fromFcm(payload)`, `noti.fromApns(payload)`, `noti.fromOneSignal(payload)` — raw payload → `noti()` 호출 매핑 util.

### 공개 시그니처 — positional 확장 규칙

- 기존 stub `noti(title, htmlContent, onTakeInteraction, mainIconSrc, subIconSrc)` 의 positional 배치를 베이스로 유지. 앞쪽 인자는 호출 빈도 우선(frequency-first) — `noti(title)` / `noti(title, body)` 가 주 사용 패턴.
- 신규 필드(subtitle, buttons, data, url, …) 는 **뒤쪽에 추가** 하거나 뒤쪽 `options` 오브젝트로 모은다. 앞쪽 순서는 건드리지 않음.
- object-first overload 가 필요하면 1번째 인자가 object 인지로 분기 (`typeof title === "object" && title !== null`) — 단일 호출 지점 유지.

### 진입점 통일 검토

- `scripts/main.js:523~571` 의 native bridge 가 raw `noti` 객체를 받아 자체 DOM 조립하던 경로를 `noti(options)` 호출로 대체 가능해야 함 (본 phase 종료 후 호스트 프로젝트 쪽 마이그레이션).
- 프레임워크 본체는 어댑터와 진입점까지만 제공, 실제 FCM/APNs 구독·수신은 호스트 책임.

## 단계

### A — 설계

컨테이너 구조 (fixed banner, single slot — 동시 노출 없이 순차), 큐/매니저 파일 배치, `options` 스키마 + positional 시그니처 확장 범위 확정, `!popNoti` 슬롯 핸들러 구성 (template DOM 배치 방식 · `intent.data` 스키마), timeline(#010) 과 공유할 데이터 스키마 윤곽.

### B — 구현

- `EstreNotificationManager` + `noti()` 본체.
- iOS 스타일 배너 DOM + CSS.
- 등장/퇴장 애니메이션, 위/아래 스와이프 제스처(`EstreSwipeHandler` 재사용).
- 기본 `showTime` · 큐 처리 · 자동 해제.
- 어댑터 util (`noti.fromFcm` 등) — 최소 셋.

### C — 문서화

`.agent/estreui/noti-banner.en.md` / `.ko.md` 신규. README 인덱스 갱신. 기존 `project_noti_options_compat.md` / `project_noti_ui_design.md` 메모리의 결정 사항을 문서로 승격. `scripts/estreUi-dialog.js` 의 stub 주석 제거.

## 의존성

- **[#006 포커스 라이프사이클](006-focus-lifecycle-completion.md)** ✅ — 배너가 인터랙티브 모드일 때 포커스 이동 계약.
- **[#007 다크 모드 스캐폴드](007-dark-mode-scaffold.md)** ✅ — 토큰 기반 다크 대응.
- **`EstreNotationManager` (`scripts/estreUi-notation.js`)** — 큐 패턴 선례.
- **`EstreSwipeHandler`** — 위/아래 스와이프 제스처 재사용.

## 후속 연관

- **#010 timeline (overwatchPanel 내)** — noti 가 사라진 뒤 영구 기록되는 히스토리 뷰. 본 phase 의 배너 컴포넌트와 데이터 스키마를 그대로 재사용하는 것이 전제이므로, 시각 컴포넌트 설계 시 timeline 리스트에서도 재사용 가능한 형태로 둘 것.
