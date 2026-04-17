# #004 — 테스트 스위트

- **우선순위**: 🟡 보통
- **분류**: 품질
- **상태**: ✅ 완료 (2026-04-18)

## 배경

EstreUI.js에 현재 자동화된 테스트가 없다. 문서화 과정에서 발견한 7개 이슈(review #001–#007) — `return` 누락으로 가드 절 이후 실행이 계속되는 버그, 전역 변수 누출 등 — 는 단위 테스트로 충분히 사전 감지할 수 있었던 문제.

테스트는 인간과 AI 에이전트 모두에게 유용:

- **리팩터링 안전망.** 모듈 분리(#002)나 JSDoc 추가(#001) 시 아무것도 깨지지 않았다는 검증.
- **AI 에이전트 검증.** 에이전트가 코드를 수정한 뒤 테스트를 돌려서 정합성을 자동 확인.
- **살아있는 명세.** 테스트는 코드와 절대 어긋나지 않는 형태로 기대 동작을 기록.

## 테스트 프레임워크 선택

EstreUI.js는 브라우저 지향 프레임워크로 DOM 의존성이 있으므로:

- **테스트 러너**: DOM 지원이 있는 모던 러너 — 예: Vitest + jsdom, 또는 Jest + jsdom.
- **빌드 불필요**: 테스트가 원본 JS 파일을 직접 import (ES11, TS 없음).
- **DOM 환경**: jsdom이 `document`, `Element`, `NodeList` 등을 제공.

## 우선순위별 테스트 대상

### Tier 1 — 순수 로직 (DOM 불필요)

| 대상 | 테스트 내용 |
| --- | --- |
| PID 파싱 | `EstreUiPage` 생성자: `&m=section#container@article%step`, `^` 멀티 인스턴스, `!` managed, `*` external 파싱 |
| Doctre `matchReplace` | 토큰 치환: 문자열 값, 함수 값, 객체 값, `dataPlaceholder`, `coverReplaceable` |
| Doctre `coldify` / `stringify` | 라운드트립: 엘리먼트 생성 → coldify → stringify → parse → 비교 |
| `crashBroker` | Safari 호환 개행/탭 이스케이프 |
| Alienese 헬퍼 | `nne()`, `stedy()/go()`, `postPromise()`, `postQueue()` |

### Tier 2 — DOM 상호작용

| 대상 | 테스트 내용 |
| --- | --- |
| Doctre 프로토타입 확장 | `element.solid()` → `element.melt({...})` 라운드트립; `freeze`/`hot`/`worm`/`burn` |
| `LocalStyle.localize()` | `##`가 올바른 셀렉터 경로로 치환되는지 |
| `data-exported` 슬롯 주입 | `loadExported`가 HTML을 fetch해서 올바른 슬롯에 삽입하는지 |
| Active Struct 파이프라인 | `applyActiveStruct`가 `data-bind-*`, `data-solid`, `data-set-prototype`을 올바른 순서로 처리하는지 |

### Tier 3 — 페이지 라이프사이클

| 대상 | 테스트 내용 |
| --- | --- |
| `bringPage` | PID 해석 (`*` → extPidMap, `!` → managedPidMap), 페이지 생성, 핸들러 `onBring` 호출 |
| `showPage` / `hidePage` | switch fall-through가 올바른 hostType 레벨을 처리하는지 |
| `closePage` | 가드 절이 조기 반환하는지 (#001 수정 검증), 비동기 resolve |
| `showOrBringPage` | `showPage`가 falsy 반환 시 `bringPage`로 폴백하는지 |

## 단계별 계획

1. **1단계** ✅ — 테스트 러너 설정, Tier 1 테스트 작성 (순수 로직, ~20 케이스). 설정 검증 + 가장 테스트하기 쉬운 코드 커버.
2. **2단계** ✅ — Tier 2 테스트 추가 (jsdom, 67 케이스). DOM 의존 기능 검증. Doctre 프로토타입 확장(solid/melt/freeze/hot/worm/burn), createElement/createElementBy, coldify→stringify→live 라운드트립, LocalStyle.localize, data-solid 처리, selector 빌더, exported 슬롯, doc 유틸리티.
3. **3단계** ✅ (2026-04-18) — Tier 3 테스트 추가 (21 케이스). `bringPage`/`showPage`/`closePage`/`showOrBringPage`의 PID 별칭 해석 및 early-return 가드, `EstreUiCustomPageManager`의 `*` prefix 위임 계약, 페이지 레지스트리 등록·조회. 전체 페이지 트리 마운트 대신 mock 페이지 오브젝트로 핵심 흐름 검증.
4. **4단계** ✅ (2026-04-18) — 리뷰 항목(#001–#007) 각각에 대한 회귀 테스트 추가 (23 케이스). `test/regression.test.js` 한 파일에 describe 블록 단위로 분리. 런타임 동작 검증이 가능한 항목(#001, #002, #003, #007)은 실행 테스트, 소스 레벨 변경만 확인 가능한 항목(#004, #005, #006)은 `fs.readFileSync`로 정규식 매치 테스트.

## 테스트 예시 (Tier 1)

```js
describe("Doctre.matchReplace", () => {
    test("파이프 구분 토큰을 문자열 값으로 치환", () => {
        const result = Doctre.matchReplace("|greeting| |name|!", {
            greeting: "Hello",
            name: "World"
        });
        expect(result).toBe("Hello World!");
    });

    test("함수 값을 키로 호출해서 치환", () => {
        const result = Doctre.matchReplace("|x|", {
            x: (key) => key.toUpperCase()
        });
        expect(result).toBe("X");
    });

    test("dataPlaceholder 없으면 미매칭 토큰을 그대로 유지", () => {
        const result = Doctre.matchReplace("|known| |unknown|", {
            known: "yes"
        });
        expect(result).toBe("yes |unknown|");
    });
});
```

## 의존성

- 다른 로드맵 항목과 독립적이지만, 모듈 분리(#002) 후에는 테스트 조직이 더 깔끔해짐.
- JSDoc 어노테이션(#001)이 있으면 기대 타입이 명확해져 테스트 작성이 수월.
