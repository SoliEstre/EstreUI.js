<!-- lint-ignore:unindexed -->
# estreUi.js 모듈 의존성 그래프

> 로드맵 [#002 모듈 분리](002-module-splitting.md)의 1단계 산출물. estreUi.js의 11개 논리적 모듈 간 참조 관계.

## 모듈 목록

| # | 모듈 | 라인 범위 | 주요 내용 |
|---|---|---|---|
| M1 | Core | ~15-554 | `uis`, `eds` 레지스트리, `@typedef` |
| M2 | Dialog API | ~555-1057 | `estrePopupBrowser`, toast/alert/confirm/prompt, `wait/stedy/go` |
| M3 | Notation & Storage | ~1058-1645 | `EstreNotationManager`, `AsyncStorage`, `ES/EAS/EJS/EAJS`, `EstreUiParameterManager` |
| M4 | Page Handle | ~1646-4323 | `EstrePageHandle`, `EstrePageHostHandle`, Component variants, Container, Article |
| M5 | Page Handler | ~4324-4940 | `EstrePageHandler`, Dialog handlers |
| M6 | Page Model | ~4941-5954 | `EstreUiPage` (PID 파싱, 데이터 모델) |
| M7 | Page Manager | ~5955-6571 | `EstreUiPageManager`, `pageManager`, `EstreUiCustomPageManager` |
| M8 | Handle Base | ~6572-6845 | `EstreHandle`, `registerCustomHandle` |
| M9 | Stock Handles | ~6846-13806 | Calendar, Scalable, Collapsible, Tab, Toggle, NumKeypad 등 |
| M10 | Interaction | ~13807-15172 | `EstreSwipeHandler`, `EstreDraggableHandler` |
| M11 | Main | ~15173-끝 | `estreStruct`, `estreUi` 싱글턴, DOM 초기화 |

## 의존성 방향

```
M1 Core
 ↑ (모든 모듈이 uis/eds 참조)
 │
M2 Dialog API ──→ M7 Page Manager (pageManager.bringPage)
M3 Notation ──→ M7 Page Manager (pageManager.bringPage)
 │
M4 Page Handle ──→ M6 Page Model (EstreUiPage.from)
M5 Page Handler ──→ M4 Page Handle, M6 Page Model
M6 Page Model ──→ M5 Page Handler (핸들러 맵)
 │
M7 Page Manager ──→ M4, M6, M11 (estreUi 싱글턴)
 │
M8 Handle Base ──→ M1 Core (uis 레지스트리)
M9 Stock Handles ──→ M8 Handle Base (extends EstreHandle)
 │
M10 Interaction ── (자체 완결)
 │
M11 Main ──→ M7, M8 (pageManager init, EstreHandle.commit)
```

## 순환 참조

| 순환 | 설명 | 분리 시 해결 방안 |
|---|---|---|
| M4 ↔ M6 | Page Handle이 `EstreUiPage.from()` 호출, Page Model이 핸들러 맵 참조 | 같은 레이어로 취급하거나, 핸들러 맵을 별도 등록 패턴으로 분리 |
| M5 ↔ M6 | Page Handler가 Page Model의 핸들러 맵에 등록됨 | 핸들러 등록을 Main에서 수행하도록 이동 |
| M2/M3 → M7 → M11 | Dialog API가 pageManager를 참조, pageManager가 estreUi 참조 | pageManager를 독립 싱글턴으로 초기화 순서 조정 |

## 분리 가능성 평가

- **즉시 분리 가능**: M1(Core), M10(Interaction), M3(Notation & Storage)
- **의존성 정리 후 분리**: M8+M9(Handle Base + Stock Handles), M5(Page Handler)
- **신중한 분리 필요**: M4+M6(Page Handle + Page Model), M7(Page Manager), M11(Main)
