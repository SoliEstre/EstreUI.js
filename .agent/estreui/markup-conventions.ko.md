# 마크업 컨벤션

> 영문 버전: [markup-conventions.en.md](markup-conventions.en.md)

EstreUI 는 커스텀 엘리먼트, data 속성, 토큰 문법 등 일련의 HTML 컨벤션을 정의하며, 프레임워크가 init 시점에 이를 처리한다. 이 문서는 세 가지 주요 범주를 다룬다: **섹션 export**, **local-style 스코핑**, **Active Struct** (데이터 바인딩, solid point, set-prototype).

## 섹션 export (`data-exported`)

### 문제

모든 섹션을 하나의 `index.html` 에 넣으면 파일이 비대해진다. EstreUI 는 섹션을 **export 파일**로 분리하여 해결한다 — 별도의 HTML 파일을 fetch 해서 init 시점에 슬롯에 주입.

### 동작 방식

`index.html` 에서 컨테이너 요소에 `data-exported="1"` 을 지정하고 본문을 비워 둔다:

```html
<main id="staticDoc" data-exported="1">
</main>
<footer id="fixedBottom" data-exported="1">
    <nav id="instantSections">
    </nav>
</footer>
<main id="instantDoc" data-exported="1">
</main>
<nav id="managedOverlay" data-exported="1">
</nav>
<section id="handlePrototypes" data-exported="1" style="display: none; ">
</section>
```

`estreUi.init()` 중에 프레임워크가 각 슬롯의 `data-exported` 속성을 확인한다. 값이 `"1"` 이면 대응하는 HTML 파일을 fetch 하여 슬롯에 prepend:

| 슬롯 요소 | export 파일 | 주입 위치 |
| --- | --- | --- |
| `<header id="fixedTop">` | `fixedTop.html` | 헤더 영역 (앱 바) |
| `<footer id="fixedBottom">` | `fixedBottom.html` | 풋터 영역 (하단 네비) |
| `<main id="staticDoc">` | `staticDoc.html` | 메인 static 섹션 |
| `<main id="instantDoc">` | `instantDoc.html` | instant (blinded) 섹션 |
| `<nav id="managedOverlay">` | `managedOverlay.html` | 오버레이 섹션 |
| `<nav id="mainMenu">` | `mainMenu.html` | 사이드 메뉴 |
| `<section id="handlePrototypes">` | `stockHandlePrototypes.html` + `customHandlePrototypes.html` | 핸들 프로토타입 템플릿 |

### 프리로딩

빠른 로딩을 위해 `<head>` 에 `<link rel="preload">` 태그를 추가:

```html
<link rel="preload" as="fetch" type="text/html" href="./staticDoc.html" crossOrigin="anonymous" />
<link rel="preload" as="fetch" type="text/html" href="./instantDoc.html" crossOrigin="anonymous" />
```

브라우저가 HTML 파싱과 동시에 파일 다운로드를 시작한다. `estreUi.init()` 이 실행될 때쯤이면 대부분 캐시에 들어와 있음.

### export 파일 구조

export 파일은 `<html>`, `<head>`, `<body>` 래퍼 없이 순수 섹션 마크업만 담는다:

```html
<!-- staticDoc.html -->
<section id="home" class="root_tab_content" data-static="1">
    <div class="container" data-container-id="root" data-static="">
        <article data-article-id="main" data-static="1">
            <!-- 페이지 콘텐츠 -->
        </article>
    </div>
</section>

<section id="profile" data-static="1">
    <!-- ... -->
</section>
```

### 실패 시 재시도

프레임워크는 네트워크 오류 시 각 fetch 를 무한 재시도하여, 불안정한 연결에서도 결국 앱이 로드되도록 보장한다.

---

## `local-style` 블록과 `##` 스코프 별칭

### 패턴

EstreUI 는 커스텀 `<local-style>` 요소를 통해 스코프드 CSS 를 제공한다. article(또는 임의의 컨테이너) 안에서 `##` 를 호스트 요소의 전체 셀렉터 경로에 대한 플레이스홀더로 사용:

```html
<article data-article-id="main" data-static="1">
    <local-style>
        ## { --bottom-fixed-height: 0; }
        ## > .list { padding: 8px; }
        ## > .list > .item { display: flex; }
    </local-style>
    <div class="list">
        <div class="item">...</div>
    </div>
</article>
```

### `##` 의 치환 방식

`LocalStyle.localize()` 메서드(`estreU0EEOZ.js` 에서 정의)가 `<local-style>` 요소에서 `<body>` 까지 상위로 올라가며 정확한 CSS 셀렉터 경로를 구축한다. 각 조상은 다음 기준으로 식별:

1. **`id`** 가 있으면 → `tagName#id`
2. **`data-container-id`** 가 있는 `.container` div → `div[data-container-id="root"]`
3. **`data-article-id`** 가 있는 `<article>` → `article[data-article-id="main"]`
4. **`class`** 를 폴백으로 → `tagName.class1.class2`
5. 같은 specifier 를 가진 형제가 있으면 **`:nth-child(n)`**

최종 셀렉터는 ` > ` 자식 결합자로 연결된다. 예를 들어 위 마크업의 `##` 는 다음과 같이 치환될 수 있다:

```
main#staticDoc > section#home > div[data-container-id="root"] > article[data-article-id="main"]
```

스타일 텍스트 내 모든 `##` 가 이 경로로 교체되어, 원래의 `<local-style>` 태그를 대체하는 표준 `<style>` 요소가 생성된다.

### 왜 표준 스코핑을 안 쓰는가?

- **Shadow DOM 오버헤드 없음** — 스타일이 일반 문서 캐스케이드에 살아있음.
- **명세도(specificity)가 정밀** — 생성되는 셀렉터가 충분히 길어 `!important` 없이도 스코프 적용.
- **`@media` 쿼리가 자연스럽게 동작** — 같은 `<local-style>` 블록 안에 그냥 넣으면 됨:

```html
<local-style>
    ## > .grid { display: grid; grid-template-columns: 1fr; }
    @media (min-width: 740px) {
        ## > .grid { grid-template-columns: 1fr 1fr; }
    }
</local-style>
```

### 실행 시점

`initLocalStyle()` 은 페이지 핸들의 콘텐트 브로커 초기화 과정에서 `applyActiveStruct()` 의 일부로 호출된다. 각 `<local-style>` 요소는 한 번 처리되어 제자리에서 `<style>` 태그로 교체.

### 프로그래밍 방식 사용

자바스크립트에서 스코프드 스타일을 주입할 수도 있다:

```js
LocalStyle.appendLocalize(hostElement, "## > .highlight { color: red; }");
```

---

## Active Struct

Active Struct 는 데이터를 DOM 요소에 바인딩하는 EstreUI 의 선언적 시스템이다. 세 가지 메커니즘을 결합: **data-bind 속성**, **solid point** (템플릿 동결), **`|token|` 보간**.

### `|token|` 보간

`|token|` 문법은 템플릿 콘텐츠의 기초. 텍스트 콘텐츠나 속성값에 토큰을 배치:

```html
<span>|userName|</span>
<img src="|profileImage|">
<button data-id="|itemId|">|label|</button>
```

토큰은 Doctre 엔진의 `matchReplace()` 메서드를 통해, 동결된 템플릿을 `.hot()`, `.melt()`, `.worm()` 으로 인스턴스화할 때 치환된다. replacer 는 토큰 이름을 값에 매핑하는 객체:

```js
element.melt({ userName: "Alice", profileImage: "/img/alice.png" });
```

### `data-solid` — 템플릿 동결

`data-solid="1"` 로 마크된 요소는 내부 HTML 이 직렬화(동결)되어 `data-frozen` 속성에 저장되고, 원래 자식은 제거:

```html
<!-- init 전 -->
<ul data-solid="1">
    <li>|name|</li>
</ul>

<!-- initSolidPoint() 후 -->
<ul data-solid="" data-frozen='[["li","|name|"]]'>
</ul>
```

동결된 콘텐츠는 Doctre 형식 JSON 문자열이다. 이후 토큰 치환과 함께 인스턴스화할 수 있다:

```js
// 렌더링된 복사본 하나 추가
listElement.worm({ name: "Alice" });

// 비우고 다시 렌더링
listElement.melt({ name: "Bob" });
```

#### 우선순위 정렬

`data-solid` 는 숫자 우선순위 값을 받는다. 높은 숫자의 요소가 먼저 동결되어(역순 처리), 중첩된 solid point 가 부모보다 먼저 처리되도록 보장.

### Doctre 요소 메서드

Doctre 라이브러리는 `Element.prototype` 에 동결/해동 메서드를 확장:

| 메서드 | 효과 |
| --- | --- |
| `elem.freeze(dataName)` | 자식을 `dataset[dataName]` 에 직렬화 (기본: `"frozen"`) |
| `elem.solid(dataName)` | `freeze()` + `innerHTML` 비우기 |
| `elem.hot(replacer, dataName)` | 동결 데이터 파싱, `\|token\|` 치환, DOM 노드 반환 (추가 안 함) |
| `elem.worm(replacer, dataName)` | `hot()` + 결과를 요소에 append, NodeArray 반환 |
| `elem.melt(replacer, dataName)` | `innerHTML` 비우기 + `worm()` |
| `elem.burn(replacer, dataName)` | `hot()` + frozen 데이터 속성 삭제 |
| `elem.stringified()` | 요소를 Doctre 문자열로 직렬화한 뒤 요소 제거 |

### `data-bind` — 선언적 데이터 바인딩

인텐트 데이터와 함께 페이지를 열면(`pageManager.bringPage("page", { data: {...} })`), 프레임워크의 `initDataBind()` 가 데이터 필드를 DOM 요소에 매핑:

```html
<!-- 단순 텍스트 바인딩 -->
<span data-bind="userName">placeholder</span>

<!-- 값 바인딩 (입력 요소용) -->
<input data-bind-value="email" />

<!-- 속성 바인딩: item@targetAttr -->
<img data-bind-attr="profileImage@src" />

<!-- 스타일 바인딩: item@cssProperty -->
<div data-bind-style="themeColor@background-color"></div>
```

#### 바인드 속성 레퍼런스

| 속성 | 바인딩 대상 | 소스 |
| --- | --- | --- |
| `data-bind="key"` | `innerHTML` | `intent.data[key]` |
| `data-bind-amount="key"` | `innerHTML` (서식 적용 숫자) | `intent.data[key]` |
| `data-bind-value="key"` | `value` 프로퍼티 | `intent.data[key]` |
| `data-bind-attr="key@attr"` | HTML 속성 | `intent.data[key]` |
| `data-bind-style="key@prop"` | CSS 프로퍼티 | `intent.data[key]` |

#### prefix·suffix 수정자

속성 및 스타일 바인딩은 `^prefix` 와 `$suffix` 수정자를 지원:

```html
<!-- data-bind-attr="key^prefix" → 속성값이 prefix + data[key] 가 됨 -->
<a data-bind-attr="path^/users/@href">Link</a>

<!-- data-bind-attr="$suffix key" → 속성값이 data[key] + suffix 가 됨 -->
```

`^` 문자가 키와 prefix 를 구분하고, `$` 가 suffix 와 키를 구분한다.

#### 배열 바인딩

리스트 데이터에는 `data-solid` 자식을 가진 컨테이너에 `data-bind-array` 를 사용:

```html
<ul data-bind-array="items" data-solid="1">
    <li data-bind-array-item="name">|name|</li>
</ul>
```

`intent.data.items` 가 배열일 때:
1. 컨테이너의 자식이 동결됨 (아직 안 되어 있으면)
2. 컨테이너가 비워짐
3. 각 배열 원소마다 동결 템플릿에서 복사본이 생성됨
4. 배열이 비어있으면 플레이스홀더 표시 (`data-frozen-placeholder` 에서)

객체 배열에는 `data-bind-object-array-*` 변형 사용:

```html
<ul data-bind-array="students" data-solid="1">
    <li>
        <span data-bind-object-array-item="name"></span>
        <span data-bind-object-array-item="grade"></span>
    </li>
</ul>
```

#### 조건부 가시성

| 속성 | 요소를 표시하는 조건 |
| --- | --- |
| `data-show-on-exists="key"` | `data[key]` 가 null/undefined 가 아닐 때 |
| `data-show-on-not-exists="key"` | `data[key]` 가 null/undefined 일 때 |
| `data-show-on-equals="key=value"` | `data[key] == value` 일 때 |

### `data-set-prototype` — 핸들 템플릿 주입

핸들의 바운드 요소에 `data-set-prototype="1"` 을 지정하면, 핸들이 init 시점에 프로토타입 템플릿을 주입해야 함을 알림. 핸들 클래스는 Doctre 기반 DOM 템플릿을 반환하는 `prototypeTemplate` getter 를 정의.

```html
<div class="my_widget" data-set-prototype="1"></div>
```

핸들 초기화 시:
1. `data-set-prototype="1"` 을 읽음
2. `applyPrototype()` 호출 — 핸들의 `prototypeTemplate` 을 가져옴
3. 프로토타입의 클래스, 스타일, 속성을 바운드 요소에 병합
4. 프로토타입의 자식을 append
5. `data-set-prototype=""` 로 설정하여 재적용 방지

이를 통해 핸들이 재사용 가능하고 자기 완결적인 UI 템플릿을 선언적으로 주입할 수 있다.

### 처리 순서

Active Struct 시스템은 `applyActiveStruct()` 내에서 특정 순서로 실행:

```
applyActiveStruct()
  ├── initContentBrokers()
  │     ├── initDataBind()       ← data-bind-* 속성 해석
  │     ├── initSolidPoint()     ← data-solid 요소 동결
  │     └── initLocalStyle()     ← <local-style> 요소 지역화
  └── initLiveElement()
        ├── initHandles()        ← EstreHandle 인스턴스 결선
        └── initPassiveLinks()   ← data-open-* / data-close-* 링크 바인딩
```

`data-bind` 가 먼저 실행되어 바인딩된 값이 제자리에 들어간 뒤, solid point 가 콘텐츠를 동결하고 local style 이 계산된다.
