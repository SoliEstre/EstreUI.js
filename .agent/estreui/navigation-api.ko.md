# 네비게이션 API

> 영문 버전: [navigation-api.en.md](navigation-api.en.md)

이 문서는 주요 네비게이션 메서드 — `bringPage`, `showPage`, `closePage`, `hidePage` — 와 루트 탭 전환 및 컨테이너 레벨 동작을 다룬다.

PID 구조와 레이어에 대해서는 [pid-and-layout.ko.md](pid-and-layout.ko.md), 인증 게이팅 레이어는 [pages-system.ko.md](pages-system.ko.md) 를 참고.

## 핵심 네비게이션 메서드

모든 메서드는 PID 를 세 가지 형식으로 받는다:
- **원시 PID**: `"&m=home#root@main"` — 직접 사용.
- **`*` 별칭**: `"*home"` — `extPidMap`(PagesProvider 별칭 맵)을 통해 해석.
- **`!` managed**: `"!alert"` — 프레임워크 내장 managed PID 맵(다이얼로그, 오버레이 등)을 통해 해석.

`EstreUiCustomPageManager` 가 자동으로 `*` 를 붙이므로, 앱 코드에서는 평범한 별칭 이름을 사용.

### `bringPage(pid, intent, instanceOrigin)`

페이지를 열거나 표시한다. 주된 네비게이션 메서드.

```js
// 커스텀 페이지 매니저 경유 (권장)
myPageManager.bringPage("profile", { data: { userId: 42 } });

// 프레임워크 페이지 매니저 경유 (원시 PID)
pageManager.bringPage("&m=profile#root@main", { data: { userId: 42 } });
```

**계층 레벨별 동작:**

`bringPage` 는 PID 트리를 가장 깊은 대상부터 상위로 탐색:

1. **컴포넌트(섹션)**: 열려있지 않고 instant 이면 연다. 메인 섹션이면 루트 탭을 전환.
2. **컨테이너**: 열려있지 않고 instant 이면 컴포넌트 내에서 연다.
3. **아티클**: 열려있지 않고 instant 이면 컨테이너 내에서 연다.

각 레벨에서, 대상이 이미 존재하면:
- 인텐트가 있고 이것이 대상 레벨이면 인텐트가 push 됨 (`onIntentUpdated` 트리거).
- 인텐트가 없으면 기존 요소를 단순히 표시.

**반환값:** 가장 깊은 대상 동작의 결과, 또는 실패 시 `null`/`false`.

### `showPage(pid, intent, instanceOrigin)`

`bringPage` 와 유사하지만, **이미 존재하는** 요소만 표시. 새 인스턴스를 생성하지 않음.

```js
myPageManager.showPage("profile");
```

PID 체인의 어떤 요소라도 존재하지 않으면 `null` 반환.

### `showOrBringPage(pid, intent, instanceOrigin)`

`showPage` 를 먼저 시도; 페이지가 아직 열려있지 않으면 `bringPage` 로 폴백:

```js
myPageManager.showOrBringPage("home");
```

### `hidePage(pid, hideHost, instanceOrigin)`

페이지를 파괴하지 않고 숨김. 나중에 다시 표시 가능.

```js
myPageManager.hidePage("profile");
```

**`hideHost` 플래그:** `true` 이면 대상 article/container 뿐만 아니라 상위 컴포넌트도 숨김. 생략하거나 `false` 이면 가장 깊은 대상만 숨김. 유일한 콘텐츠인 static 요소는 자동으로 상위로 숨김이 전파.

### `closePage(pid, closeHost, instanceOrigin)`

페이지를 닫고 파괴한다 (instant 요소의 경우) 또는 숨긴다 (static 요소의 경우). Promise 를 반환.

```js
await myPageManager.closePage("profile");
```

**닫기 전파:**
- article 을 닫을 때 모든 형제 article 이 static 이면 컨테이너도 닫힘.
- container 를 닫을 때 모든 형제 container 가 static 이면 컴포넌트도 닫힘.
- 메인 섹션에서 닫기는 `"home"` 으로 전환하는 것으로 폴백.

**`closeHost` 플래그:** static 형제 상태와 무관하게 상위 container/component 를 강제 닫기.

## 인텐트

인텐트는 네비게이션에 수반되는 데이터 페이로드:

```js
myPageManager.bringPage("detail", {
    data: { itemId: 123, title: "Example" },
    action: "edit",
    bringOnBack: { pid: "list", hostType: "container" }
});
```

| 필드 | 용도 |
| --- | --- |
| `data` | `data-bind-*` 속성과 페이지 핸들러 콜백에 전달되는 객체. |
| `action` | 핸들러의 `onIntentUpdated` 에서 분기하기 위한 문자열 식별자. |
| `bringOnBack` | `{ pid, hostType }` — 이 페이지가 뒤로 가기로 닫힐 때 이동할 페이지. |

인텐트 데이터는 핸들러 콜백에서 사용 가능:

```js
"detail" = class extends EstrePageHandler {
    onOpen(handle, data, intent) {
        // data === intent.data
        this.loadItem(data.itemId);
    }

    onIntentUpdated(handle, data, intent) {
        // 이미 열린 페이지에 bringPage 가 호출될 때 실행
        this.loadItem(data.itemId);
    }
}
```

## 루트 탭

메인 섹션(`&m=...`)은 루트 탭으로 구성할 수 있다 — 앱의 최상위 네비게이션. 각 탭은 섹션 id 와 일치하는 `data-tab-id` 를 가진 버튼.

### `switchRootTab(target, intent)`

보이는 메인 섹션을 전환:

```js
// 섹션 id 로 (문자열)
estreUi.switchRootTab("home");

// 인덱스로 (숫자)
estreUi.switchRootTab(0);

// jQuery 요소로
estreUi.switchRootTab($tabButton);
```

**동작:**
1. 현재 on-top 인 모든 섹션을 숨김.
2. 대상 섹션을 표시.
3. 탭 버튼의 `data-active` 갱신.
4. 대상이 이미 on-top 이고 같은 탭이 다시 선택되면, 섹션 핸들의 `back()` 호출 (스크롤 맨 위로 또는 섹션 내 뒤로 네비게이션).

### 모달 탭

CSS 클래스 `.modal` 이 있는 섹션은 모달 탭으로 처리. `switchRootTab` 이 토글:
- on-top 이 아니면 → `openModalTab()` 으로 열기.
- 이미 on-top 이면 → `closeModalTab()` 으로 닫기.

### 탭 마크업

```html
<!-- 탭 버튼 (보통 fixedBottom.html 에) -->
<button data-tab-id="home" data-active="1">Home</button>
<button data-tab-id="calendar">Calendar</button>
<button data-tab-id="more">More</button>

<!-- 섹션 (staticDoc.html 에) -->
<section id="home" class="root_tab_content" data-static="1">...</section>
<section id="calendar" class="root_tab_content" data-static="1">...</section>
<section id="more" class="modal" data-static="1">...</section>
```

`root_tab_content` 클래스가 섹션을 루트 탭 참여자로 표시. `data-active="1"` 속성이 현재 탭 버튼을 하이라이트.

## 컨테이너 동작

### 컨테이너 열기

컨테이너는 `bringPage` 의 일부로 열리지만, 직접 열 수도 있다:

```js
const section = estreUi.mainSections["profile"];
section.openContainer("edit");
```

### 컨테이너 닫기

```js
// closePage 경유
await myPageManager.closePage("profile_edit");

// 직접 컨테이너 참조 경유
const section = estreUi.mainSections["profile"];
await section.closeContainer("edit");
```

### 컨테이너 리로드

외부에서 컨테이너 콘텐츠를 리로드하려면:

```js
const section = estreUi.mainSections["profile"];
const container = section.containers["root"];
if (container) container.reload();
```

이렇게 하면 컨테이너의 article 핸들이 `onShow` 사이클을 다시 실행하여, 표시된 데이터를 효과적으로 갱신.

### 섹션 트리 접근

```js
// 메인 섹션
estreUi.mainSections["home"]

// 풋터 섹션
estreUi.footerSections["fixedBottom"]

// Blinded (instant) 섹션
estreUi.blindedSections["login"]

// 오버레이 섹션
estreUi.overlaySections["customDialog"]

// 현재 on-top 메인 섹션
estreUi.mainCurrentOnTop
```

## 선언적 네비게이션 링크

EstreUI 는 클릭 가능한 요소에 data 속성을 통해 선언적 네비게이션을 지원:

```html
<!-- 현재 섹션 내에서 컨테이너 열기 -->
<button data-open-target="self"
        data-open-container="edit"
        data-open-id="main">
    프로필 수정
</button>

<!-- 특정 섹션에서 컨테이너 열기 -->
<button data-open-target="root@profile"
        data-open-container="details"
        data-open-id="main">
    상세 보기
</button>

<!-- 네비게이션과 함께 데이터 전달 -->
<button data-open-target="self"
        data-open-container="detail"
        data-open-id="main"
        data-open-data='{"itemId": 123}'>
    항목 열기
</button>

<!-- 닫을 때 돌아오기 -->
<button data-open-target="self"
        data-open-container="edit"
        data-open-id="main"
        data-open-bring-on-back="1">
    수정 (닫으면 여기로 복귀)
</button>
```

| 속성 | 용도 |
| --- | --- |
| `data-open-target` | `"self"` (현재 섹션) 또는 `"root@sectionId"`. |
| `data-open-container` | 열 컨테이너 타입 (예: `"component"`, `"edit"`). |
| `data-open-id` | article 또는 container id. |
| `data-open-action` | 인텐트에 전달할 action 문자열. |
| `data-open-data` | 인텐트에 전달할 JSON 데이터. |
| `data-open-bring-on-back` | `"1"` 이면 현재 페이지를 복귀 대상으로 설정; 또는 PID 문자열. |

페이지를 선언적으로 닫으려면:

```html
<button data-close-page="profile_edit">닫기</button>
<button data-open-page="home">홈으로</button>
<button data-show-page="settings">설정 표시</button>
```

이 패시브 링크들은 Active Struct 처리의 일부로 `initPassiveLinks()` 에 의해 초기화된다.

## 뒤로 가기 네비게이션

프레임워크가 뒤로 가기 네비게이션 스택을 관리한다. 브라우저 뒤로 버튼(또는 안드로이드 뒤로 버튼)이 눌리면:

1. 현재 페이지 핸들의 `back()` 메서드가 호출됨.
2. `back()` 이 핸들러의 `onBack()` 콜백을 확인 — `true` 를 반환하면 뒤로 가기가 소비됨.
3. 소비되지 않으면 `bringOnBack` 대상으로 이동하거나 루트 탭으로 폴백.
