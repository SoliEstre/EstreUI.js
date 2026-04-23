# #008 — 퀵패널

- **우선순위**: 🟡 보통
- **분류**: 컴포넌트
- **상태**: 계획

## 배경

[estreUi-pageModel.js](../../../scripts/estreUi-pageModel.js#L3708) 와 [estreUi-pageManager.js](../../../scripts/estreUi-pageManager.js#L69) 에 `quickPanel` 페이지 핸들러 슬롯이 이미 등록되어 있으나 현재 빈 껍데기다 — `class extends EstrePageHandler { }`. 프레임워크 차원의 "빠른 설정 / 전역 토글" 을 여기에 모아 제공하는 것이 의도. 본 항목은 그 내용을 채운다.

## 범위

### 프레임워크 기본 제공 토글

다음 항목은 프레임워크가 자체적으로 UI 를 제공한다. 각 항목은 이미 존재하는 싱글턴 API 의 얇은 래퍼다.

- **다크 모드 토글** (light / dark / auto 3상) — `estreUi.setDarkMode(t | f | n)` 호출. 자동 모드 여부와 실제 적용 상태는 `estreUi.darkMode` / `estreUi.isDarkMode` 로 표시.

    **프레임워크 측 다크 토글 UI 제공 경로는 이 퀵패널이 유일.** 도입 프로젝트는 퀵패널을 띄워 쓰거나, 자체 UI 를 별도로 두되 내부적으로 같은 `setDarkMode` API 를 호출한다. 프레임워크 본체의 다른 영역(메인 메뉴, 헤더 등) 에 다크 토글이 박혀서 나가는 일은 없다.

- *(후속 확장 여지 — 접근성 토글, 언어 스위처 등. 현 단계에서는 placeholder.)*

### 호스트 프로젝트 훅

호스트 프로젝트가 자체 토글 항목을 퀵패널에 추가할 수 있는 인터페이스. 설계 미정. 메인 메뉴의 커스텀 섹션 등록 패턴을 선례로 검토.

### UI · 인터랙션

- 열림 · 닫힘 제스처 (아래로 스와이프 / 배경 탭 등).
- 기존 `mainMenu` / `fixedTop` 헤더 슬롯과의 관계 정리.
- 열릴 때 포커스 이동 계약 — [#006 포커스 라이프사이클](006-focus-lifecycle-completion.md) 의 `onFocus / onBlur / lastFocusedElement` 를 퀵패널 내부에서 재귀적으로 따름.

## 단계

### A — 설계

퀵패널의 컨테이너 구조 (사이드 모달 / 드롭다운 / 오버레이 중 택), 열림 위치, 호스트 훅 인터페이스 초안.

### B — 구현

빈 `EstrePageHandler` 슬롯을 채움. 프레임워크 기본 토글 목록(현 단계: 다크 모드 하나) 를 내장. 호스트 훅은 phase B 에서 같이 내거나 별도 phase 로 분리.

### C — 문서화

`.agent/estreui/quick-panel.en.md` / `.ko.md` 에 범위 · API · 호스트 훅 계약 서술. README 인덱스에 새 항목 추가. `dark-mode.{en,ko}.md` 의 토글 UI 언급을 확정된 경로로 업데이트.

## 의존성

- **[#007 다크 모드 스캐폴드](007-dark-mode-scaffold.md)** ✅ — 첫 기본 토글의 대상 API 를 제공.
- **[#006 포커스 라이프사이클](006-focus-lifecycle-completion.md)** ✅ — 퀵패널 내부 포커스 이동 계약.
- 메인 메뉴 커스텀 섹션 등록 패턴 — 호스트 훅 설계의 선례.
