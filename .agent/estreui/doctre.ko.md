# Doctre — 템플릿 직렬화 엔진

> **범위:** `doctre.js` (업스트림).  
> **정식 명칭:** Document Object Cold Taste Refrigeration Effortlessness.

Doctre는 DOM 트리를 JSON 기반으로 직렬화하는 포맷과, Element 프로토타입 확장 메서드 세트를 제공한다. 라이브 DOM을 **냉동(freeze)** 해서 데이터로 보존하고, 토큰 보간과 함께 다시 **해동(thaw)** 할 수 있다. EstreUI의 `data-solid` / Active Struct 파이프라인의 핵심 엔진이다.

---

## 1. 핵심 개념

### Cold — 메모리 내 표현

**cold** 배열은 하나의 엘리먼트를 기술한다:

```
cold[0]  solidId   "tag.class1.class2#id@name$type"
cold[1]  content   자식 cold 배열 | HTML 문자열 | NodeList | Element
cold[2]  style     스타일 문자열 또는 객체
cold[3]  attrs     추가 속성 객체
cold[4]  datas     dataset 객체
```

### Frost — JSON 문자열

**frost**는 cold 배열을 `JSON.stringify`한 형태. `data-frozen`(또는 임의 data 속성)에 저장하거나, 네트워크 전송, DB 저장에 사용한다.

### SolidId — 엘리먼트 식별 축약 문자열

solidId는 tag + class + id + name + type을 하나의 문자열로 압축한다:

```
"div.card.active#main@root$submit"
 │    │          │     │     └─ type
 │    │          │     └─ name
 │    │          └─ id
 │    └─ 클래스 (dot 구분)
 └─ 태그명
```

---

## 2. 정적 API

### 엘리먼트 생성

| 메서드 | 설명 |
| --- | --- |
| `Doctre.createElement(tag, majorAttrs, content, style, attrs, datas, replacer)` | 분해된 파라미터로 단일 엘리먼트 생성. |
| `Doctre.createElementBy(solidId, content, style, attrs, datas, replacer)` | solidId 문자열을 받아 생성. |
| `Doctre.createFragment(hcnlArray, replacer)` | cold 아이템과 텍스트 노드의 배열로 `DocumentFragment` 생성. |

### 직렬화

| 메서드 | 설명 |
| --- | --- |
| `Doctre.coldify(nodeOrList, ...)` | Node/NodeList를 cold 배열(메모리)로 변환. |
| `Doctre.stringify(nodeOrList, prettyJson, ...)` | frost(JSON 문자열)로 변환. |
| `Doctre.frostElement(element, ...)` | 단일 엘리먼트를 cold 배열로 직렬화. |
| `Doctre.frostNode(node, ...)` | 임의 노드(엘리먼트, 텍스트, 주석, 프래그먼트)를 직렬화. |

### 역직렬화

| 메서드 | 설명 |
| --- | --- |
| `Doctre.parse(frost, replacer)` | frost JSON 문자열을 파싱해 `DocumentFragment` 반환. |
| `Doctre.live(frostOrCold, replacer)` | frost 문자열 또는 cold 배열 모두 수용, `DocumentFragment` 반환. |
| `Doctre.takeOut(frostOrCold, replacer)` | `live()` 결과를 `<template>` 엘리먼트로 감싸 반환. |

### 토큰 보간 — `matchReplace`

```js
Doctre.matchReplace("|greeting| |name|!", {
    greeting: "Hello",
    name: () => userName
});
// → "Hello Alice!"
```

- 토큰은 `|파이프|`로 구분한다.
- 값으로 문자열, 함수(키를 인자로 호출), 객체(자동 JSON 직렬화)를 사용할 수 있다.
- `dataPlaceholder` — 매칭되지 않은 토큰의 기본값.
- `coverReplaceable: true` — 남은 모든 `|token|` 패턴을 `dataPlaceholder`로 치환.

### Safari 크래시 브로커

`Doctre.crashBroker(jsonContent)`는 Safari/iOS에서 `JSON.parse` 크래시를 방지하기 위해 개행/탭 문자를 이스케이프한다. `parse()`에서 자동 적용.

---

## 3. Element 프로토타입 확장 — `Doctre.patch()`

`Doctre.patch()`는 `Element.prototype`, `Node.prototype`, `NodeList.prototype`에 메서드를 추가한다. 애플리케이션 코드에서 실제로 사용하는 주 API이다.

### 냉동 (DOM → 데이터)

| 메서드 | 대상 | 반환 | 부수효과 |
| --- | --- | --- | --- |
| `.cold()` | Element | 자식 cold 배열 | — |
| `.takeCold()` | Element | 자식 cold 배열 | `innerHTML` 비움 |
| `.frozen()` | Element | 자식 frost JSON 문자열 | — |
| `.takeFrozen()` | Element | 자식 frost JSON 문자열 | `innerHTML` 비움 |
| `.coldify()` | Node/NodeList | cold 배열 | — |
| `.coldified()` | Node | cold 배열 | 노드 제거 |
| `.stringify()` | Node/NodeList | frost JSON 문자열 | — |
| `.stringified()` | Node | frost JSON 문자열 | 노드 제거 |
| `.freeze(dataName?)` | Element | `this` | frost를 `dataset[dataName]`에 저장 (기본 `"frozen"`) |
| `.solid(dataName?)` | Element | `this` | `freeze()` + `innerHTML` 비움 |

### 해동 (데이터 → DOM)

| 메서드 | 대상 | 반환 | 부수효과 |
| --- | --- | --- | --- |
| `.hot(replacer?, dataName?)` | Element | `DocumentFragment` 또는 `null` | — (`dataset[dataName]`에서 읽기만) |
| `.worm(replacer?, dataName?)` | Element | `NodeArray` 또는 `null` | 프래그먼트를 엘리먼트에 append |
| `.melt(replacer?, dataName?)` | Element | `NodeArray` 또는 `null` | `innerHTML` 비우고 append |
| `.burn(replacer?, dataName?)` | Element | `DocumentFragment` 또는 `null` | `dataset.frozen` 삭제 |
| `.wormOut(replacer?, dataName?)` | Element | `NodeArray` 또는 `null` | `worm()` + `dataset.frozen` 삭제 |
| `.meltOut(replacer?, dataName?)` | Element | `NodeArray` 또는 `null` | `melt()` + `dataset.frozen` 삭제 |

### 라이브 주입

| 메서드 | 대상 | 반환 | 부수효과 |
| --- | --- | --- | --- |
| `.alive(frostOrCold, replacer?)` | Element | `NodeArray` | 파싱된 콘텐츠 append |
| `.alone(frostOrCold, replacer?)` | Element | `NodeArray` | 비우고 append |

---

## 4. EstreUI Active Struct에서의 라이프사이클

EstreUI가 초기화 시 `data-solid="1"` 엘리먼트를 처리하는 흐름:

```
   개발자가 라이브 콘텐츠 + |토큰|이 포함된 HTML 작성
                    ↓
   EstreUI가  element.solid() 호출
     → .freeze()  — 자식을 data-frozen으로 직렬화
     → innerHTML 비움  — DOM이 빈 상태
                    ↓
   이후 데이터 도착 (API 응답, 사용자 액션)
                    ↓
   핸들러가  element.melt({ key: value, ... }) 호출
     → .hot()     — data-frozen 읽기, 파싱 + |토큰| 치환
     → 비우고 + append  — DOM에 실제 데이터 반영
```

### 실전 예시

```html
<ul data-solid="1">
    <li class="item">
        <span>|title|</span>
        <time>|date|</time>
    </li>
</ul>
```

`solid()` 후 `<ul>`은 비어 있지만 `data-frozen`에 냉동 템플릿을 보유한다. 리스트 렌더링:

```js
const list = document.querySelector("ul");
for (const item of items) {
    list.worm({
        title: item.title,
        date: item.createdAt
    });
}
```

`worm()` 호출마다 토큰이 치환된 새 `<li>`가 추가된다.

---

## 5. `Doctre` 인스턴스

정적 메서드 외에, `Doctre`를 인스턴스화해서 재사용 가능한 템플릿으로 보유할 수 있다:

```js
const template = new Doctre("li.item", [
    ["span", "|title|"],
    ["time", "|date|"]
]);

// 라이브 DOM 생성
const fragment = template.fresh({ title: "Hello", date: "2025-01-01" });
```

| 프로퍼티/메서드 | 설명 |
| --- | --- |
| `.live` | 토큰 치환 없이 DOM 생성. |
| `.fresh(replacer)` | 토큰 치환 포함 DOM 생성. |
| `.frost(...)` | cold 배열로 재직렬화. |
| `.icy` | 트림된 frost 축약. |
| `.toString(prettyJson?)` | JSON 문자열 출력. |
| `.chill` | 자식 프래그먼트만 생성. |
| `.cold(...)` | 자식을 cold 배열로 직렬화. |
| `.frozen(...)` | 자식을 frost 문자열로 직렬화. |

---

## 6. `NodeArray`

`NodeArray`는 `Array`를 확장하며, 방금 주입한 노드에 대한 참조를 보유한다. `.worm()`, `.melt()`, `.alive()`, `.alone()`이 반환한다.

```js
const nodes = container.melt({ name: "Alice" });
// nodes는 NodeArray — 표준 Array 메서드 사용 가능
nodes.forEach(node => { /* ... */ });
```

`DocumentFragment`의 자식은 append 시 이동하므로, `NodeArray`가 참조를 유지해준다.

---

## 7. 설계 포인트

- **비파괴 읽기**: `.cold()`, `.frozen()`, `.hot()`은 DOM을 수정하지 않는다.
- **파괴적 변형**: 메서드명이 의도를 드러낸다 — `take*`는 소스를 비우고, `*Out`은 냉동 데이터를 삭제하고, `solid` = freeze + 비움.
- **온도 메타포**: Cold/frozen = 직렬화(보존). Hot/melt/worm/burn = 역직렬화(살아남). 일관된 온도 메타포를 전체에 적용.
- **jQuery 지원**: jQuery가 로드되어 있으면 `.coldify()`, `.stringify()`, `.coldified()`, `.stringified()`가 jQuery 객체에도 패치된다.
