# #003 — Alienese 인라인 문서화

- **우선순위**: 🟡 보통
- **분류**: DX
- **상태**: ✅ 완료 (2026-04-17)

## 배경

EstreUI의 "alienese" 식별자(`t`, `f`, `n`, `u`, `d`, `cls`, `eid`, `eds.*`, `uis.*`, `nne()`, `stedy()/go()` 등)는 간결한 코드를 위한 의도적 설계이다. 그러나 처음 접하는 사람에게는 가장 큰 진입 장벽:

- **인간 개발자**: `if (nne(x))`나 `eds.satisfy`를 처음 보면 각 식별자를 찾아봐야 함.
- **AI 에이전트**: 일부(`t` = `true`)는 추측 가능하지만, `d` = `"."`(document나 data가 아님) 같은 것은 오판.
- [alienese 문서](../alienese.ko.md)가 있지만, 소스를 읽는 동안 항상 열어놓고 있지는 않음.

## 제안

`alienese.js`의 선언부에 JSDoc `@type` / `@const` 주석을 추가해서 **IDE 호버**로 의미를 즉시 확인할 수 있도록 한다.

### 변경 전

```js
const t = true;
const f = false;
const n = null;
const d = ".";
```

### 변경 후

```js
/** @const {boolean} t - `true`의 별칭. */
const t = true;
/** @const {boolean} f - `false`의 별칭. */
const f = false;
/** @const {null} n - `null`의 별칭. */
const n = null;
/** @const {string} d - 점 문자열 `"."`. 구분자 및 CSS 클래스 셀렉터 접두어로 사용. */
const d = ".";
```

### `eds.*`, `uis.*` 레지스트리

```js
const eds = {
    /** @type {string} "satisfy" 조건 data 속성명. 값: `"data-satisfy"`. */
    satisfy: "data-satisfy",
    /** @type {string} "solid" (Doctre 냉동 마커) data 속성명. 값: `"data-solid"`. */
    solid: "data-solid",
    // ...
};
```

### 헬퍼 함수

```js
/**
 * 값이 null이 아니고, undefined가 아니고, 빈 문자열이 아닌지 확인.
 * @param {*} value - 확인할 값.
 * @returns {boolean} 값이 의미 있으면 `true`.
 */
function nne(value) { /* ... */ }
```

## 범위

| 대상 | 예상 항목 수 |
| --- | --- |
| 단일 문자 별칭 (`t`, `f`, `n`, `u`, `d` 등) | ~10 |
| 셀렉터 접두어 (`cls`, `eid`, `c.c`, `inp` 등) | ~10 |
| `eds.*` 레지스트리 항목 | ~40 |
| `uis.*` 레지스트리 항목 | ~50 |
| 헬퍼 함수 (`nne`, `stedy`, `go`, `note`, `postPromise`, `postQueue` 등) | ~15 |

## 단계별 계획

1. **1단계** — 단일 문자 별칭과 셀렉터 접두어 주석 추가 (혼란 위험 최대, ~20항목).
2. **2단계** — `eds.*` 항목 주석 추가 (data 속성명, ~40항목).
3. **3단계** — `uis.*` 항목 주석 추가 (UI 셀렉터명, ~50항목).
4. **4단계** — 헬퍼 함수에 `@param`/`@returns` 완전 주석 추가 (~15항목).

## 다른 항목과의 관계

- JSDoc 전체 작업(#001)의 부분 집합이지만, `alienese.js`가 독립 파일이므로 별도 진행 가능.
- 코드베이스에서 가장 혼란스러운 부분이라 이것부터 완료하면 즉각적인 DX 개선 효과.
