# 퀵패널 (overwatchPanel)

> 병행: [quick-panel.en.md](quick-panel.en.md)

EstreUI 는 상단 드롭다운형 **퀵패널** — 빠른 전역 토글(현재: 다크 모드, 추후: 기타 싱글턴 설정) 을 모으는 프레임워크 유일의 기본 UI — 을 제공한다. DOM 식별자는 `nav#overwatchPanel` 이며 내부에는 표시 섹션 두 개 — `section#quickPanel` 과 `section#timeline` — 가 나란히 있다.

안드로이드식으로 상단 바깥에 숨어 있다가, 화면 최상단 가장자리에서 아래로 스와이프하면 열리고, 위로 스와이프하거나 하단 grab 영역을 탭하면 닫힌다. 호스트 프로젝트가 자체 버튼을 배치해 토글 API 를 직접 호출해도 된다.

## 구조

```
<body>
  <nav id="overwatchPanel" data-exported="1" data-opened="">
    <header id="panelHeader">            <!-- 공통 헤더: 시계 + 날짜 -->
    <div class="dynamic_section_host">   <!-- 섹션 탭 바 -->
    <div class="dynamic_section_block">  <!-- 섹션 가로 스트립 -->
      <section id="quickPanel">
        <article>
          <div class="quick_tiles">      <!-- .quick_tile 버튼 그리드 -->
            <button id="darkModeToggle" class="quick_tile" ...>
      <section id="timeline">            <!-- 예약 슬롯 -->
    <section id="panelGrabArea">         <!-- 하단 드래그 핸들 -->
  </nav>
  <section id="panelTrigger" data-static="1"></section>
</body>
```

- `nav#overwatchPanel` 은 `data-exported="1"` 로 표시되어 [overwatchPanel.html](../../overwatchPanel.html) 에서 `loadExportedOverwatchPanel()` 이 비동기로 로딩한다. fetch 를 건너뛰고 인라인으로 박아두고 싶다면 호스트는 속성을 `data-exported=""` 로 바꾸고 마크업을 직접 넣으면 된다.
- 두 섹션은 기존 [dynamic_section_host / dynamic_section_block](markup-conventions.ko.md) 메커니즘으로 엮여 있다. 탭 클릭이 섹션 간 이동을, IntersectionObserver 가 탭 강조를 담당하며, 넓은 뷰포트에서는 표준 반응형 CSS 로 두 섹션을 나란히 보이게 할 수 있다.
- `section#panelTrigger` 는 화면 최상단을 덮는 얇은 고정 스트립으로 열기 제스처를 받는다. `z-index` 가 `fixedTop` 보다 위에 있어 상단 바가 있어도 가장자리 스와이프를 먼저 잡는다.

## 열기 / 닫기

`estreUi` 싱글턴의 프로그램 API:

| 호출 | 효과 |
| --- | --- |
| `estreUi.openOverwatchPanel(sectionId?)` | 연다. `sectionId` 가 있으면 해당 섹션을 위로 올린다. |
| `estreUi.closeOverwatchPanel()` | 닫는다. |
| `estreUi.toggleOverwatchPanel(sectionId?)` | 토글. 열릴 때 `sectionId` 를 전달할 수 있다. |
| `estreUi.showOverwatchPanelSection(id)` | 열림/닫힘 상태를 바꾸지 않고 섹션만 이동시킨다. |
| `estreUi.isOpenOverwatchPanel` | getter — 현재 `data-opened="1"` 여부. |

`setPanelSwipeHandler()` 가 부트 시 두 개의 제스처 핸들러를 건다:

1. **열기** — `#panelTrigger` 에 `EstreSwipeHandler`, `unuseX()` (수직만), `setResponseBound($overwatchPanel)`. `grabY > 0` 로 커밋되면 연다.
2. **닫기** — `#panelGrabArea` 에 `EstreSwipeHandler`, `unuseX()`, 같은 response bound. `grabY < 0` 로 커밋되면 닫는다.

두 핸들러 모두 `setResponseBound` 로 `--grab-y` / `data-on-grab` 을 받는 DOM 을 패널 루트로 지정한다. 덕분에 드래그 중 패널 전체가 손가락을 따라 움직인다 (아래 CSS 변환 참조).

`section#panelGrabArea` 를 드래그 없이 탭하면 `overwatchPanelGrabAreaOnclick` 이 `closeOverwatchPanel` 을 호출한다.

## CSS 구조

변환은 **기본 오프셋** 과 스와이프 핸들러의 `--grab-y` 를 조합해 원하는 방향으로만 움직이도록 클램핑한다:

```css
/* 닫힘 기본 상태 — 패널은 뷰포트 위쪽 바깥에 있다 */
nav#overwatchPanel                > header#panelHeader         { transform: translateY(-100%); }
nav#overwatchPanel                > .dynamic_section_host      { transform: translateY(calc(-100% - var(--panel-block-height))); }
nav#overwatchPanel                > .dynamic_section_block     { transform: translateY(calc(-100vh - var(--panel-block-height))); }

/* 닫힘 + 아래 방향 grab — 양수 부분만 새어 나온다 */
nav#overwatchPanel[data-on-grab="1"]:not([data-opened="1"]) > header#panelHeader
    { transform: translateY(calc(-100% + max(var(--grab-y), 0px))); }

/* 열림 상태 — 위 방향 grab 만 패널을 도로 끌어올린다 */
nav#overwatchPanel[data-opened="1"][data-on-grab="1"] > header#panelHeader
    { transform: translateY(min(var(--grab-y), 0px)); }
```

`max(--grab-y, 0px)` / `min(--grab-y, 0px)` 는 허용되지 않는 방향으로 끌릴 때의 튀는 현상을 막는다 — 열린 상태에서 아래로 끌어도, 닫힌 상태에서 위로 끌어도 0 으로 고정되어 패널이 움직이지 않는다.

트리거 스트립과 패널 본체는 `fixedTop` 을 사이에 두고 서로 반대편 스택에 배치된다:

| 레이어 | `z-index` | 역할 |
| --- | --- | --- |
| `nav#overwatchPanel` | 120 | `fixedTop` 뒤에서 내려온다. 열리면 보인다. |
| `.fixed_top` | 130 | 앱 크롬. 열리는 패널 위에 유지된다. |
| `section#panelTrigger` | 135 | 상단 가장자리 스와이프를 잡는다. 닫힘 때 `pointer-events: auto`, `[data-opened="1"]` 이면 `none`. |

## 공통 헤더 (시계 + 날짜)

`panelHeader` 는 안드로이드식으로 시계와 짧은 날짜를 표시한다. `setOverwatchPanelClock()` 이 값을 채우고 `scheduleOverwatchPanelClock()` 이 타이머를 몰고 간다 — `setTimeout` 으로 다음 분 경계에 맞춘 뒤 `setInterval(60_000)` 로 전환한다. 날짜는 `Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" })` 라서 자동으로 로케일화된다.

```html
<header id="panelHeader" data-static="1">
  <span id="panelClock"></span>   <!-- "HH:MM" -->
  <span id="panelDate"></span>    <!-- 로케일 단축 날짜 -->
</header>
```

`releaseOverwatchPanelClock()` 은 두 타이머를 모두 정리한다 — `releasePanelSwipeHandler` / 해제 경로에서 호출.

## 기본 타일: 다크 모드

`#quickPanel .quick_tiles` 에 프레임워크가 기본 제공하는 내용물은 3 상 다크 모드 토글 단 하나다:

```html
<button id="darkModeToggle" class="quick_tile" type="button"
        data-dark-mode-state="auto"
        onclick="estreUi.cycleDarkMode();">
  <span class="tile_icon" aria-hidden="true">🌓</span>
  <span class="tile_label">Auto</span>
</button>
```

- `estreUi.cycleDarkMode()` 는 설정을 **auto → light → dark → auto** 로 순환하며, 새 `darkMode` 값을 돌려준다.
- `updateDarkModeToggleWidgets()` 는 `applyDarkMode()` 내부에서 호출되어 문서 내 `#darkModeToggle` 에 매칭되는 모든 요소를 동기화한다: `data-dark-mode-state` 를 `"auto" | "light" | "dark"` 로, `.tile_icon` 글리프를 🌓 / ☀ / ☾ 로, `.tile_label` 을 대소문자 맞춘 상태 이름으로 갱신.

`updateDarkModeToggleWidgets()` 는 id 셀렉터로 순회하므로, 호스트 프로젝트가 UI 다른 곳에 `<button id="darkModeToggle" …>` 를 하나 더 둬도 추가 배선 없이 자동으로 동기화된다.

> 프레임워크 규칙: 다크 모드 토글을 프레임워크가 직접 제공하는 경로는 퀵패널이 유일하다. 호스트가 자체 UI 를 더 만들어도 되지만, 반드시 `#darkModeToggle` 마크업 클래스를 재사용하거나 `estreUi.setDarkMode` / `cycleDarkMode` 를 호출해야 한다 — 프레임워크의 다른 영역에는 다크 토글이 내장되지 않는다.

## 호스트 훅 API — `registerOverwatchPanelTile`

호스트 프로젝트는 단일 메서드로 `#quickPanel` 에 자체 토글/바로가기를 추가한다:

```js
estreUi.registerOverwatchPanelTile({
  id: "quickMute",                // 필수 — 고유 DOM id
  icon: "🔕",                     // 선택 — 글리프 혹은 이모지
  label: "Mute",                  // 선택 — 텍스트 라벨
  onClick: (e) => toggleMute(),   // 선택 — jQuery 이벤트 핸들러
});
```

| 멤버 | 타입 | 비고 |
| --- | --- | --- |
| `id` | string | 필수. 타일의 DOM id 로 쓰인다. 중복 id 는 `null` 반환. |
| `icon` | string | `<span class="tile_icon" aria-hidden="true">` 안에 배치. |
| `label` | string | `<span class="tile_label">` 안에 배치. |
| `onClick` | function | jQuery `.on("click", …)` 로 연결. |

성공 시 타일 HTMLElement 를, 퀵패널이 아직 로드되지 않았거나 id 가 이미 있으면 `null` 을 반환한다. 정리는 `estreUi.unregisterOverwatchPanelTile(id)` 로.

전체 섹션 등록 (quickPanel/timeline 외에 세 번째 `block_item` 추가) 은 현 API 에서 **의도적으로** 노출하지 않는다 — `EstreDynamicSectionBlockHandle` 의 IntersectionObserver 와 탭 클릭 바인딩을 재초기화해야 하며, 해당 호출 모양이 아직 미정이다. 추가 섹션이 당장 필요한 호스트는 빌드 타임에 `<section class="block_item" data-id="…">` 를 `overwatchPanel.html` 에 직접 넣어야 한다.

## 페이지 핸들 통합

`quickPanel` 은 [estreUi-pageManager.js](../../scripts/estreUi-pageManager.js) 에서 Pages Provider 슬롯으로 등록된다 — 현재 핸들러는 빈 `EstrePageHandler` 서브클래스. 섹션은 `EstreMenuComponent` / `EstreMainComponent` 형제인 `EstrePanelComponent` 로 감싸져 `sectionBound: "panel"` 로 분류된다. 패널 컴포넌트의 `show()` 는 `estreUi.showOverwatchPanelSection` 로 라우팅되므로, `quickPanel` / `timeline` 으로의 페이지 이동은 호출부에서 별도 처리 없이 표준 페이지 시스템을 탄다.

## 타임라인

`section#timeline` 은 부팅 시 `EstreTimelineView` 가 채운다 (`estreUi-main.js` 의 `initOverwatchPanelTimeline()`). 해제된 알림 배너를 날짜별로 묶어 보여주고, 스와이프로 삭제할 수 있다. `EstreTimelineStore` 가 백엔드 — 스토어 스키마와 뷰 API 는 [timeline.ko.md](timeline.ko.md) 참고.

## 참조

- [dark-mode.ko.md](dark-mode.ko.md) — 기본 타일이 호출하는 API.
- [markup-conventions.ko.md](markup-conventions.ko.md) — `data-exported`, `dynamic_section_host`, `data-static`.
- [navigation-api.ko.md](navigation-api.ko.md) — 페이지 핸들이 섹션에 어떻게 대응되는지.
- [roadmap/008-quick-panel.md](roadmap/008-quick-panel.md) — 이 패널을 낳은 범위.
