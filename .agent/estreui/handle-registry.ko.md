# 핸들 레지스트리와 Stock 핸들

> 영문 버전: [handle-registry.en.md](handle-registry.en.md)

이 문서는 **activeHandle 레지스트리** — 런타임에 라이브 핸들 인스턴스를 추적하는 방식 — 와 EstreUI 에 내장된 **stock 핸들**을 다룬다. 커스텀 핸들 생성에 대해서는 [custom-handles.ko.md](custom-handles.ko.md) 를 참고.

## activeHandle 레지스트리

### 동작 방식

`EstreHandle.activeHandle` 은 CSS 셀렉터(specifier) 를 해당 타입의 모든 라이브 핸들을 담은 `Set` 인스턴스에 매핑하는 정적 객체:

```js
EstreHandle.activeHandle[specifier]  // → Set<EstreHandle>
```

`initHandles()` 로 핸들이 생성되면 해당 specifier 의 set 에 추가된다. 해제되면 제거된다. 이를 통해 타입별로 그룹화된 모든 활성 핸들 인스턴스의 전역 레지스트리를 제공.

### 이름으로 핸들 접근

`uis` 레지스트리가 논리 이름을 CSS 셀렉터에 매핑. `activeHandle` 과 결합하면 모든 라이브 핸들에 접근 가능:

```js
// uis.scalable → ".scalable"
// EstreHandle.activeHandle[".scalable"] → 모든 활성 scalable 핸들의 Set

for (const handle of EstreHandle.activeHandle[uis.scalable]) {
    handle.refresh();
}
```

### DOM 을 통한 특정 핸들 접근

모든 바운드 요소는 `element.handle` 에 핸들 인스턴스를 저장:

```js
const widgetEl = document.querySelector(".my_widget");
const handle = widgetEl.handle;  // → EstreHandle 인스턴스
```

`init()` 시 설정되고 `release()` 시 해제.

### 등록 흐름

```
initHandles($host, host)
  → EstreHandle.handles 의 각 specifier 에 대해:
      → $host 내 매칭 요소 찾기
      → 각 요소에 대해:
          → new HandleClass(element, host)
          → host.registerHandle(specifier, handle)
          → activeHandle[specifier].add(handle)
          → handle.init()
```

### 해제 흐름

```
releaseHandles($host, host)
  → EstreHandle.handles 의 각 specifier 에 대해:
      → $host 내 매칭 요소 찾기
      → 각 요소에 대해:
          → host.unregisterHandle(specifier, element.handle)
          → activeHandle[specifier].delete(element.handle)
          → element.handle.release()
```

핸들은 호스트 페이지 핸들이 닫히거나, 새 핸들이 기존 것을 대체할 때(`replace = true`) 자동으로 해제된다.

### 커스텀 핸들 등록

커스텀 핸들은 `commit()` 전에 `registerCustomHandle()` 로 등록:

```js
EstreHandle.registerCustomHandle("myWidget", ".my_widget", MyWidgetHandle);
```

이것이 하는 일:
1. `uis` 레지스트리에 `"myWidget"` → `".my_widget"` 추가.
2. handles 맵에 `".my_widget"` → `MyWidgetHandle` 추가.
3. `MyWidgetHandle.handleName = "myWidget"` 설정.

`commit()` 이후에는 추가 등록이 불가. 커스텀 핸들은 commit 시점에 메인 handles 맵에 병합된다.

## Stock 핸들

EstreUI 에 내장된 핸들 목록. 각 핸들은 해당 CSS 클래스(또는 속성 셀렉터)를 요소에 추가하면 활성화.

### 레이아웃 & 인터랙션

| 핸들 클래스 | 셀렉터 (`uis` 키) | 용도 |
| --- | --- | --- |
| `EstreScalableHandle` | `.scalable` (`scalable`) | 요약 행과 전체 콘텐츠를 가진 확장/축소 블록. 요약 클릭으로 토글. |
| `EstreCollapsibleHandle` | `.collapsible` (`collapsible`) | 콘텐츠 접기/펼치기. 접힌 상태에서 `.basic` 콘텐츠만 표시, 펼치면 전체 표시. |
| `EstreToggleBlockHandle` | `.toggle_block` (`toggleBlock`) | 이진 토글 블록 — 토글 상태에 따라 콘텐츠 표시/숨김. |
| `EstreToggleTabBlockHandle` | `.toggle_tab_block` (`toggleTabBlock`) | 토글과 탭 동작 결합 — 토글로 표시/숨김, 탭으로 콘텐츠 전환. |
| `EstreTabBlockHandle` | `.tab_block` (`tabBlock`) | 탭 콘텐츠 블록. `ul.tab_set` 으로 탭 버튼, `.tab_content_blocks` 로 패널. |
| `EstreDynamicSectionBlockHandle` | `.dynamic_section_block` (`dynamicSectionBlock`) | host/block item 쌍으로 섹션을 동적 관리, 와이드 동적 레이아웃 지원. |

### 캘린더

| 핸들 클래스 | 셀렉터 (`uis` 키) | 용도 |
| --- | --- | --- |
| `EstreUnifiedCalendarHandle` | `.unified_calendar` (`unifiedCalendar`) | 스케줄러, 필터, 날짜 네비게이션, 일정 목록을 갖춘 풀 캘린더. |
| `EstreDedicatedCalendarHandle` | `.dedicated_calendar` (`dedicatedCalendar`) | 통합 일정 블록을 가진 컴팩트 캘린더. |

### 입력 & 선택

| 핸들 클래스 | 셀렉터 (`uis` 키) | 용도 |
| --- | --- | --- |
| `EstreNumKeypadHandle` | `.num_keypad` (`numKeypad`) | 화면 숫자 키패드. |
| `EstreCheckboxSetHandle` | `.checkbox_set` (`checkboxSet`) | 전체선택 및 개별 상태 추적이 있는 체크박스 그룹 관리. |
| `EstreCheckboxAllyHandle` | `.checkbox_ally` (`checkboxAlly`) | 상호 배제 또는 연합 선택 로직의 체크박스 그룹. |
| `EstreCustomSelectorBarHandle` | `.custom_selector_bar` (`customSelectorBar`) | 커스텀 옵션 렌더링이 있는 수평 선택 바. |
| `EstreMonthSelectorBarHandle` | `.month_selector_bar` (`monthSelectorBar`) | 네비게이션 화살표가 있는 월/년 선택 바. |

### 오버레이 & 토스트

| 핸들 클래스 | 셀렉터 (`uis` 키) | 용도 |
| --- | --- | --- |
| `EstreToasterSlotHandle` | `.toaster_slot` (`toasterSlot`) | 슬라이드업 토스트 패널을 관리하는 컨테이너. |
| `EstreMultiDialSlotHandle` | `.multi_dial_slot` (`multiDialSlot`) | 스크롤 가능한 멀티 다이얼 피커 (날짜, 시간, 커스텀 옵션). |

### 표시 & 유틸리티

| 핸들 클래스 | 셀렉터 (`uis` 키) | 용도 |
| --- | --- | --- |
| `EstreDateShowerHandle` | `.date_shower` (`dateShower`) | 날짜 구성요소(연, 월, 일, 요일)를 자동 포맷하여 자식 요소에 표시. |
| `EstreLiveTimestampHandle` | `[data-live-timestamp]` (`liveTimestamp`) | 자동 갱신되는 상대 시간("3분 전") 표시. |
| `EstreOnClickSetTextHandle` | `[data-on-click-set-text]` (`onClickSetText`) | 클릭 시 대상 요소에 텍스트 복사. |
| `EstreOnClickSetHtmlHandle` | `[data-on-click-set-html]` (`onClickSetHtml`) | 클릭 시 대상 요소에 HTML 복사. |
| `EstreExportedContentHandle` | `.exported_content` (`exportedContent`) | 외부 HTML 콘텐츠를 로드하여 요소에 주입. |
| `EstreHelpAlertHandle` | `[data-help-alert]` (`dataHelpAlert`) | 클릭 시 도움말/정보 알림 다이얼로그 표시, `data-help-alert` 속성의 내용 사용. |
| `EstreEzHidableHandle` | `.ez_hidable` (`ezHidable`) | CSS 트랜지션 기반 빠른 표시/숨김. |
| `EstreFixedAccessHandle` | `.fixed_access` (`fixedAccess`) | 고정 위치 접근 버튼 또는 패널. |

## 핸들 프로토타입 템플릿

stock 핸들은 `stockHandlePrototypes.html` 에 저장된 HTML 템플릿을 가질 수 있다. 이 파일은 `estreUi.init()` 중에 fetch 되어 `<section id="handlePrototypes">` 에 주입.

각 프로토타입은 `data-handle="handleName"` 을 가진 `<template>` 을 포함하는 `<article>`:

```html
<!-- stockHandlePrototypes.html -->
<article>
    <template data-handle="scalable">
        <div class="scalable">
            <div class="summary"></div>
            <div class="content"></div>
        </div>
    </template>
</article>
```

핸들의 바운드 요소에 `data-set-prototype="1"` 이 있으면, 프레임워크가 `applyPrototype()` 을 호출하여 핸들 이름으로 템플릿을 찾아 구조를 주입. `data-set-prototype` 에 대한 자세한 내용은 [markup-conventions.ko.md](markup-conventions.ko.md) 참고.

마찬가지로, 커스텀 핸들 프로토타입은 `customHandlePrototypes.html` 에 넣는다.

## 페이지 핸들러에서 핸들 사용

페이지 핸들러는 DOM 이나 `EstreHandle.activeHandle` 을 통해 핸들과 상호작용:

```js
"home" = class extends EstrePageHandler {
    onBring(handle) {
        // DOM 을 통한 특정 핸들 접근
        this.$calendar = handle.$host.find(".unified_calendar");
    }

    onShow(handle) {
        // 핸들 인스턴스 접근
        const calHandle = this.$calendar[0].handle;
        calHandle.refresh();
    }
}
```

핸들은 `applyActiveStruct()` → `initLiveElement()` → `initHandles()` 의 일부로 초기화되며, 데이터 바인딩과 solid point 처리 이후에 실행된다.
