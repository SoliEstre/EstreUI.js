# EstreUI.js — Developer Documentation

> [한국어 버전은 아래로 →](#estreuijs--개발문서)

> **Living index.** Update this README every time a document is added, renamed, split, merged, or moved. If this index drifts from reality, every other doc loses its way in.

This folder collects in-depth, case-based developer documentation for **EstreUI.js** — the "Rimwork" published at [SoliEstre/EstreUI.js](https://github.com/SoliEstre/EstreUI.js).
Every topic is provided as a parallel pair of files:

- `<topic>.en.md` — English
- `<topic>.ko.md` — 한국어

## Status legend

- ✅ Both `.en.md` and `.ko.md` written.
- 🟡 One language only (draft).
- ⬜ Planned / not yet written.

## Index

### 0. Foundations

| Topic | EN | KO | Status | Notes |
| --- | --- | --- | --- | --- |
| Overview & mental model | [overview.en.md](overview.en.md) | [overview.ko.md](overview.ko.md) | ✅ | What "Rimwork" means, how EstreUI sits between framework and library, target developers. |
| Glossary of identifiers (`alienese`) | [alienese.en.md](alienese.en.md) | [alienese.ko.md](alienese.ko.md) | ✅ | `t/f/n/u/d`, `cls`, `eid`, `eds.*`, `nne()`, `stedy()/go()`, `note()`, queue helpers, object copy/merge. |

### 1. Pages

| Topic | EN | KO | Status | Notes |
| --- | --- | --- | --- | --- |
| PID & layer/section/container/article model | [pid-and-layout.en.md](pid-and-layout.en.md) | [pid-and-layout.ko.md](pid-and-layout.ko.md) | ✅ | Anatomy of `&m=section#container@article%step`, the six layers, multi-instance `^`, stack steps `%n`. |
| Page lifecycle & `EstrePageHandler` | [page-handlers.en.md](page-handlers.en.md) | [page-handlers.ko.md](page-handlers.ko.md) | ✅ | `onBring → onShow → onHide → onClose`, plus `onApplied`, `onIntentUpdated`, `onBack`, `onReload`. |
| Pages Provider & Custom Page Manager | [pages-system.en.md](pages-system.en.md) | [pages-system.ko.md](pages-system.ko.md) | ✅ | `static get pages`, `static get operator`, `EstreUiCustomPageManager`, auth gating via `bringPage` override. |

### 2. Handles

| Topic | EN | KO | Status | Notes |
| --- | --- | --- | --- | --- |
| Custom Handles (`EstreHandle` + `registerCustomHandle`) | [custom-handles.en.md](custom-handles.en.md) | [custom-handles.ko.md](custom-handles.ko.md) | ✅ | Subclass skeleton, selector registration, `$bound`/`bound`, `release(remove)`, static-callback injection pattern. |
| Handle registry & Stock handles | [handle-registry.en.md](handle-registry.en.md) | [handle-registry.ko.md](handle-registry.ko.md) | ✅ | `activeHandle` registry, `uis` lookup, 20+ built-in handles (scalable, collapsible, tab block, calendar, etc.). |

### 3. Markup conventions

| Topic | EN | KO | Status | Notes |
| --- | --- | --- | --- | --- |
| Markup conventions (exports, local-style, Active Struct) | [markup-conventions.en.md](markup-conventions.en.md) | [markup-conventions.ko.md](markup-conventions.ko.md) | ✅ | `data-exported` slots, `<local-style>` with `##` scope alias, `data-bind-*`, `data-solid`, `data-set-prototype`, `\|token\|` interpolation. |

### 4. Bootstrap & Runtime

| Topic | EN | KO | Status | Notes |
| --- | --- | --- | --- | --- |
| Boot sequence & runtime (consolidated) | [boot-sequence.en.md](boot-sequence.en.md) | [boot-sequence.ko.md](boot-sequence.ko.md) | ✅ | Script load order, `boot.js`, init sequence, `<meta link="lazy">`, Service Worker hooks, `EstreUiParameterManager`. |
| Service Worker & offline caching | [service-worker.en.md](service-worker.en.md) | [service-worker.ko.md](service-worker.ko.md) | ✅ | Tiered cache strategy (app/common/static/stony), `serviceWorkerHandler`, lifecycle callbacks, message protocol, cache management API. |

### 5. Navigation API

| Topic | EN | KO | Status | Notes |
| --- | --- | --- | --- | --- |
| Navigation API (consolidated) | [navigation-api.en.md](navigation-api.en.md) | [navigation-api.ko.md](navigation-api.ko.md) | ✅ | `bringPage`/`showPage`/`closePage`/`hidePage`, intent, root tabs, `switchRootTab`, container operations, declarative links, back navigation. |

### 6. Template Engine

| Topic | EN | KO | Status | Notes |
| --- | --- | --- | --- | --- |
| Doctre — template serialization engine | [doctre.en.md](doctre.en.md) | [doctre.ko.md](doctre.ko.md) | ✅ | Cold/frost format, solidId, `Doctre.patch()` prototype extensions (solid/hot/melt/worm/freeze/burn), `matchReplace` token interpolation, `NodeArray`. |

## Review & Improvements

The [review/](review/) subfolder tracks bugs, typos, and improvement suggestions discovered during source analysis. See the [review dashboard](review/README.md) for the full list with resolution status.

## How to add a new topic

1. Pick a slug (kebab-case), e.g. `active-struct`.
2. Create both files: `active-struct.en.md` and `active-struct.ko.md`.
3. Mirror the structure: same headings, same example code, same diagrams. Only prose language differs.
4. Add the row to the appropriate section table above with status ✅ (or 🟡 if only one language is ready).
5. Strip every project-specific identifier per [.agent/project/style-guide.md](../project/style-guide.md) before committing.

## Source of truth

- Upstream repository: https://github.com/SoliEstre/EstreUI.js
- When in doubt about whether an API/behavior is part of EstreUI or a project extension, consult [.agent/project/upstream-vs-local.md](../project/upstream-vs-local.md).

---

# EstreUI.js — 개발문서

> **살아있는 인덱스입니다.** 문서를 추가·이름 변경·분할·병합·이동할 때마다 이 README를 함께 갱신하세요. 인덱스가 실제와 어긋나면 다른 모든 문서가 길을 잃습니다.

이 폴더는 **EstreUI.js** ([SoliEstre/EstreUI.js](https://github.com/SoliEstre/EstreUI.js) 에 공개된 "Rimwork") 에 대한 사례 기반 상세 개발문서를 모읍니다.
모든 토픽은 영어/한국어 쌍으로 제공합니다.

- `<topic>.en.md` — English
- `<topic>.ko.md` — 한국어

## 상태 표기

- ✅ `.en.md` 와 `.ko.md` 모두 작성 완료.
- 🟡 한쪽 언어만 작성(미완).
- ⬜ 계획됨 / 아직 미작성.

## 목차

### 0. 기초

| 토픽 | EN | KO | 상태 | 비고 |
| --- | --- | --- | --- | --- |
| 개요 및 멘탈 모델 | [overview.en.md](overview.en.md) | [overview.ko.md](overview.ko.md) | ✅ | "Rimwork"의 의미, 프레임워크/라이브러리 사이에서의 위치, 대상 개발자. |
| 식별자 용어집 (`alienese`) | [alienese.en.md](alienese.en.md) | [alienese.ko.md](alienese.ko.md) | ✅ | `t/f/n/u/d`, `cls`, `eid`, `eds.*`, `nne()`, `stedy()/go()`, `note()`, 큐 헬퍼, 객체 복사/병합. |

### 1. 페이지 시스템

| 토픽 | EN | KO | 상태 | 비고 |
| --- | --- | --- | --- | --- |
| PID & layer/section/container/article 모델 | [pid-and-layout.en.md](pid-and-layout.en.md) | [pid-and-layout.ko.md](pid-and-layout.ko.md) | ✅ | `&m=section#container@article%step` 해부, 6개 레이어, 멀티 인스턴스 `^`, 스택 스텝 `%n`. |
| 페이지 라이프사이클 & `EstrePageHandler` | [page-handlers.en.md](page-handlers.en.md) | [page-handlers.ko.md](page-handlers.ko.md) | ✅ | `onBring → onShow → onHide → onClose`, 그리고 `onApplied`, `onIntentUpdated`, `onBack`, `onReload`. |
| Pages Provider & 커스텀 페이지 매니저 | [pages-system.en.md](pages-system.en.md) | [pages-system.ko.md](pages-system.ko.md) | ✅ | `static get pages`, `static get operator`, `EstreUiCustomPageManager`, `bringPage` 오버라이드를 통한 인증 게이트. |

### 2. 핸들

| 토픽 | EN | KO | 상태 | 비고 |
| --- | --- | --- | --- | --- |
| 커스텀 Handle (`EstreHandle` + `registerCustomHandle`) | [custom-handles.en.md](custom-handles.en.md) | [custom-handles.ko.md](custom-handles.ko.md) | ✅ | 서브클래스 골격, 셀렉터 등록, `$bound`/`bound`, `release(remove)`, 정적 콜백 주입 패턴. |
| 핸들 레지스트리 & Stock 핸들 | [handle-registry.en.md](handle-registry.en.md) | [handle-registry.ko.md](handle-registry.ko.md) | ✅ | `activeHandle` 레지스트리, `uis` 조회, 20여 개 내장 핸들 (scalable, collapsible, tab block, calendar 등). |

### 3. 마크업 컨벤션

| 토픽 | EN | KO | 상태 | 비고 |
| --- | --- | --- | --- | --- |
| 마크업 컨벤션 (export, local-style, Active Struct) | [markup-conventions.en.md](markup-conventions.en.md) | [markup-conventions.ko.md](markup-conventions.ko.md) | ✅ | `data-exported` 슬롯, `<local-style>` 과 `##` 스코프 별칭, `data-bind-*`, `data-solid`, `data-set-prototype`, `\|token\|` 보간. |

### 4. 부트와 런타임

| 토픽 | EN | KO | 상태 | 비고 |
| --- | --- | --- | --- | --- |
| 부트 시퀀스 & 런타임 (통합) | [boot-sequence.en.md](boot-sequence.en.md) | [boot-sequence.ko.md](boot-sequence.ko.md) | ✅ | 스크립트 로드 순서, `boot.js`, init 시퀀스, `<meta link="lazy">`, Service Worker 훅, `EstreUiParameterManager`. |
| Service Worker & 오프라인 캐싱 | [service-worker.en.md](service-worker.en.md) | [service-worker.ko.md](service-worker.ko.md) | ✅ | 4계층 캐시 전략 (app/common/static/stony), `serviceWorkerHandler`, 라이프사이클 콜백, 메시지 프로토콜, 캐시 관리 API. |

### 5. 네비게이션 API

| 토픽 | EN | KO | 상태 | 비고 |
| --- | --- | --- | --- | --- |
| 네비게이션 API (통합) | [navigation-api.en.md](navigation-api.en.md) | [navigation-api.ko.md](navigation-api.ko.md) | ✅ | `bringPage`/`showPage`/`closePage`/`hidePage`, 인텐트, 루트 탭, `switchRootTab`, 컨테이너 동작, 선언적 링크, 뒤로 가기 네비게이션. |

### 6. 템플릿 엔진

| 토픽 | EN | KO | 상태 | 비고 |
| --- | --- | --- | --- | --- |
| Doctre — 템플릿 직렬화 엔진 | [doctre.en.md](doctre.en.md) | [doctre.ko.md](doctre.ko.md) | ✅ | Cold/frost 포맷, solidId, `Doctre.patch()` 프로토타입 확장 (solid/hot/melt/worm/freeze/burn), `matchReplace` 토큰 보간, `NodeArray`. |

## 리뷰 & 개선

[review/](review/) 하위 폴더에서 소스 분석 중 발견한 버그, 오타, 개선 제안을 건별로 추적합니다. 전체 목록과 해결 상태는 [리뷰 대시보드](review/README.md) 참고.

## 새 토픽 추가 방법

1. 슬러그(케밥 케이스)를 정합니다. 예: `active-struct`.
2. 두 파일을 생성합니다: `active-struct.en.md` 와 `active-struct.ko.md`.
3. 구조를 동일하게 유지합니다 — 같은 헤딩, 같은 예제 코드, 같은 도식. 본문 언어만 다르게.
4. **영어·한국어 양쪽 인덱스 표 모두**에 행을 추가하고 상태를 ✅ (또는 한쪽만 작성됐다면 🟡) 로 표기합니다.
5. [.agent/project/style-guide.md](../project/style-guide.md) 의 식별자 치환 규칙을 적용한 뒤 커밋합니다.

## 진실 공급원

- 업스트림 리포지터리: https://github.com/SoliEstre/EstreUI.js
- 어떤 API/동작이 EstreUI 본체인지 프로젝트 확장인지 헷갈릴 때는 [.agent/project/upstream-vs-local.md](../project/upstream-vs-local.md) 를 먼저 봅니다.
