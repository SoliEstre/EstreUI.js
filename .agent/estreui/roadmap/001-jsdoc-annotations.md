# #001 — JSDoc 타입 어노테이션

- **우선순위**: 🔴 높음
- **분류**: DX / 도구
- **상태**: 1단계 완료 (2026-04-16)

## 배경

EstreUI.js는 ES11을 유지하며 TypeScript 전환 예정이 없다. 그러나 코드베이스(`estreUi.js`만 15,000줄 이상)에 타입 정보가 전혀 없어서:

- **IDE 지원이 불가.** 자동완성, 호버 문서, 파라미터 힌트가 동작하지 않음.
- **AI 에이전트가 소스 전체를 읽어야** 함수 시그니처와 반환 타입을 추론할 수 있음.
- **버그 사전 감지 불가.** `showOrBringPage` 스코프 누출(review #002), `closePage` missing return(review #001) 같은 문제를 타입 도구가 잡을 수 있었음.

JSDoc 주석은 언어·빌드 과정을 바꾸지 않고 위 세 문제를 모두 해결한다.

## 범위

모든 공개 API에 `/** @param / @returns / @typedef / @class */` 주석 추가:

| 파일 | 예상 공개 API 규모 |
| --- | --- |
| `estreUi.js` | ~60개 클래스/메서드 (PageManager, Handle, Page 등) |
| `doctre.js` | ~20개 정적 메서드 + 프로토타입 확장 |
| `estreU0EEOZ.js` | ~30개 유틸 함수/클래스 |
| `alienese.js` | ~40개 전역 식별자 |
| `boot.js` | `serviceWorkerHandler` ~20개 메서드/프로퍼티 |
| `modernism.js` | ~15개 폴리필 추가 |

## 단계별 계획

### 1단계 — 핵심 API (가장 큰 효과)

프로젝트 개발자가 직접 호출하는 API 우선:

1. `EstreUiPageManager` — `bringPage`, `showPage`, `closePage`, `hidePage`, `showOrBringPage`
2. `EstreUiCustomPageManager` — `init`, `bringPage` 오버라이드 포인트
3. `EstrePageHandler` — 라이프사이클 콜백 (`onBring`, `onShow`, `onHide`, `onClose`, `onApplied`, `onIntentUpdated`, `onBack`, `onReload`)
4. `EstreHandle` — `constructor`, `$bound`/`bound`, `release`, `registerCustomHandle`, `activeHandle`
5. `EstreUiPage` — PID 프로퍼티, `setInstanceOrigin`, `sections`

예시:

```js
/**
 * PID로 페이지를 네비게이트한다.
 * @param {string} pid - 전체 또는 별칭 PID (예: "*home", "&m=main#root@home").
 * @param {Object} [intent] - 페이지 핸들러의 onBring/onShow에 전달되는 데이터.
 * @param {string} [instanceOrigin] - 멀티 인스턴스 페이지의 인스턴스 출처 식별자.
 * @returns {Promise<boolean|null>} 페이지 진입 성공 여부.
 */
bringPage(pid, intent, instanceOrigin) {
```

### 2단계 — Doctre & Active Struct

1. `Doctre` 정적 메서드 — `createElement`, `createFragment`, `parse`, `live`, `matchReplace`, `coldify`, `stringify`
2. `Doctre` 인스턴스 — `constructor`, `fresh`, `frost`, `live` 게터
3. Element 프로토타입 확장 — `solid`, `hot`, `melt`, `worm`, `freeze`, `burn`, `alive`, `alone`
4. `NodeArray`

### 3단계 — 유틸리티 & 부트

1. `alienese.js` 전역 — `t/f/n/u/d`, `eds.*`, `uis.*`, `nne()`, `stedy()/go()`, `postPromise()`, `postQueue()`
2. `estreU0EEOZ.js` — `LocalStyle`, 유틸 클래스
3. `boot.js` — `serviceWorkerHandler` 프로퍼티·메서드
4. `modernism.js` — 폴리필 확장

### 4단계 — `@typedef` (복합 객체 형상)

여러 함수에 걸쳐 전달되는 객체에 재사용 가능한 타입 별칭 정의:

```js
/**
 * @typedef {Object} EstreIntent
 * @property {string} [action] - 인텐트 액션 식별자.
 * @property {*} [data] - 임의 페이로드.
 * @property {EstreIntent} [bringOnBack] - 뒤로가기 시 실행할 인텐트.
 */
```

주요 후보: `intent`, `targetProcessed`, PID 구성 요소, stock handle 옵션, Doctre cold/frost 포맷.

## 검증

각 단계 완료 후:
- 프로젝트에서 VS Code를 열고 어노테이션된 API의 자동완성이 동작하는지 확인.
- `tsc --noEmit --allowJs --checkJs`로 타입 불일치 검출.
- 선택적으로 `tsc --declaration --allowJs --emitDeclarationOnly`로 `.d.ts` 자동 생성 (npm 배포용).

## 참고

- TypeScript로 전환하지 않는다. ES11 소스가 유일한 진실 공급원.
- JSDoc은 간결하게 — 단순 메서드는 `@param`/`@returns` 한 줄, `@typedef`는 3곳 이상에서 쓰이는 형상에만.
- Alienese 식별자(`t`, `f`, `n`, `u`, `d`)는 선언부에 `@type`을 달아서 IDE 호버로 실제 값이 보이도록.
