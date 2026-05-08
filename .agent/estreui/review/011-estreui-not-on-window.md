# #011 — `estreUi` 가 `window` 에 노출되지 않음 (module realm 임베드 차단)

- **심각도**: 🔴 버그 (외부 module-realm 임베드 통합 차단)
- **파일**: `estreUi-main.js` — `const estreUi = { ... };` (L18, L2010 닫는 `}`)
- **해결 버전**: live 2026-05-08 (commit ↗ next)

## 현상

`scripts/estreUi-main.js` 의 `estreUi` 객체가 **classic script 의 top-level `const`** 로 선언:

```js
const estreUi = {
    // ... back(), pushBackHandler(), popBackHandler(), ...
};
```

JavaScript 사양상 **classic script 의 top-level `const` / `let` 은 `window` (전역 객체) 에 자동 노출되지 않는다** (`var` 만 자동 노출). 같은 classic script realm 내 다른 `<script>` 들은 lexical scope chain 을 공유하므로 `estreUi` 식별자로 직접 참조 가능하다 — 호스트 자체 스크립트들 (`main.js`, page handler 들 등) 에서는 정상 동작한다.

문제는 **ES module realm 으로 로드된 외부 임베드** — 예: `<script type="module" src=".../embed.js">` — 가 별도 module realm 을 가지므로 classic script 의 top-level `const` 가 lexical scope chain 에 들어오지 않는다. module 코드에서는 `estreUi` 식별자 reference 불가, `window.estreUi` 도 `undefined`.

### 검증

호스트 페이지 콘솔에서:

```js
typeof window.estreUi
// → "undefined"   (fix 전)
```

## 영향

- **roadmap #011 의 `pushBackHandler` / `popBackHandler` API 가 module-realm 임베드에서 reference 자체 불가** — 010 작업이 망고톡 등 module 임베드에 실제로 닿지 못한 root cause.
- `window.estreUi` 존재 여부를 host-environment detection 으로 사용하는 module 임베드 측 가드 (예: history.pushState 가드) 가 항상 false → 가드 비활성.
- 향후 추가될 module-realm 임베드 (외부 결제 위젯, 알림 센터, 다른 micro-frontend 등) 모두 동일 차단.

## 수정

`estreUi` 객체 선언 직후 한 줄 추가:

```js
const estreUi = {
    // ...
};

window.estreUi = estreUi;
```

classic script realm 의 lexical 식별자는 그대로 유지 + `window` 표면 추가. 호환성 영향 0 — 기존 자체 스크립트들은 lexical 식별자로 그대로 접근하고, module-realm 임베드는 `window.estreUi` 로 새 경로 확보.

## 회귀 가드

수정 후 검증:

```js
typeof window.estreUi
// → "object"

typeof window.estreUi.pushBackHandler
// → "function"

typeof window.estreUi.onBack
// → "function"
```

본 fix 는 jsdom 테스트 환경에서는 별도 검증 불필요 — test setup 이 이미 `globalThis.estreUi` 로 직접 바인딩한다 (`test/estreui/setup.js` 의 export 목록). 운영 환경 (실제 브라우저 + module-realm 임베드) 에서만 발현되는 함정.

## 미고려 / 추가 검토

- **다른 EstreUI 식별자도 같은 함정** — `pageManager`, `EstreHandle`, `EstreSwipeHandler`, `EstreUiPage`, `EstrePageHandler` 등 (test setup 의 globalThis 바인딩 목록 참고). 본 fix 는 의뢰서 §4 의 한 줄 권장 그대로 `estreUi` 만 노출. 다른 식별자가 module-realm 임베드에서 필요해지면 별도 의뢰/fix 시점에 동일 패턴 (`window.<name> = <name>;`) 적용.
- **동일 예방 차원에서 `pageManager` 등을 같은 시점에 노출할지** 는 운영 정책 결정 — 현재 사용처가 명확한 표면만 노출하는 게 표면 관리상 깔끔.

## 검색 힌트

window estreUi undefined module realm classic script const top-level lexical scope chain ES module embed pushBackHandler popBackHandler reference not found
