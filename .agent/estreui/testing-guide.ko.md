# EstreUI.js — 테스트 가이드

> Parallel: [testing-guide.en.md](testing-guide.en.md)

## 개요

EstreUI.js는 브라우저 지향 프레임워크로, 여러 스크립트 파일에 걸쳐 최상위 `const` 바인딩을 선언합니다. `<script>` 태그를 통해 로드되는 이 구조는 Node.js 테스트 러너에서 문제가 됩니다 — `const`가 블록 스코프이기 때문에 각 파일을 `require()`나 `import`로 불러오면 스코프가 격리됩니다.

이 가이드는 **Vitest + jsdom** 과 **스크립트 로더** 패턴을 사용하여 브라우저의 공유 전역 스코프를 충실히 재현하는 자동화된 테스트 환경 설정 방법을 설명합니다.

## 사전 요건

- Node.js 18+
- npm 또는 pnpm

## 1. 의존성 설치

```bash
npm install --save-dev vitest jsdom
```

`package.json`에 테스트 스크립트 추가:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## 2. Vitest 설정

프로젝트 루트에 `vitest.config.js` 생성:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./test/setup.js'],
        include: ['test/**/*.test.js'],
    },
});
```

핵심 옵션:

| 옵션 | 목적 |
| --- | --- |
| `environment: 'jsdom'` | `document`, `Element`, `NodeList` 등을 제공 — EstreUI가 DOM API에 크게 의존하므로 필수. |
| `setupFiles` | 모든 테스트 파일 전에 스크립트 로더를 실행하여 EstreUI 전역 변수를 사용 가능하게 함. |
| `include` | 테스트 탐색을 `test/` 폴더로 한정. |

## 3. 스크립트 로더 (`test/setup.js`)

핵심 부분입니다. 모든 EstreUI 소스 파일을 하나의 `new Function()` 본문으로 연결하여 최상위 `const` 선언이 하나의 스코프를 공유하게 합니다 — 브라우저에서와 정확히 동일한 동작입니다.

```js
import { readFileSync } from 'fs';
import { resolve } from 'path';

const scriptsDir = resolve(import.meta.dirname, '..', 'scripts');

// index.html의 <script> 로드 순서와 일치해야 함
const loadOrder = [
    'modernism.js',
    'alienese.js',
    'doctre.js',
    'estreU0EEOZ.js',
    'estreUi.js',
];

const sources = loadOrder.map(name => {
    const path = resolve(scriptsDir, name);
    return `// --- ${name} ---\n` + readFileSync(path, 'utf8');
});

const combined = sources.join('\n\n');

const wrapper = new Function(`
    ${combined}

    return {
        // 테스트에서 접근해야 하는 모든 식별자를 나열
        // alienese
        t, f, n, u, d, s, i,
        nne, noe,
        cp, mk, ok, ov, oe, oc,
        to, ts, tn, tb, tf, tj, ia,
        xc,
        // doctre
        Doctre,
        // estreUi
        uis, eds,
        EstreUiPage, EstreUiPageManager, EstreHandle,
        pageManager, estreUi,
        // ... 필요에 따라 추가
    };
`);

try {
    const exports = wrapper();
    for (const [key, value] of Object.entries(exports)) {
        globalThis[key] = value;
    }
} catch (e) {
    console.error('Failed to load EstreUI scripts:', e.message);
    throw e;
}
```

### 왜 `new Function()`인가?

브라우저에서는 모든 `<script>`가 동일한 최상위 스코프에서 실행됩니다. `alienese.js`에서 선언된 `const`는 전역 실행 컨텍스트를 공유하기 때문에 `estreUi.js`에서도 보입니다. Node.js에서는 각 파일이 자체 모듈 스코프를 가지므로, 단순히 import하면 파일 간 참조가 깨집니다.

`new Function(body)`는 모든 스크립트의 연결이 본문인 단일 함수를 생성합니다. 그 함수 안에서 모든 `const`/`let` 선언은 같은 블록 스코프를 공유합니다 — 브라우저 동작을 충실히 재현합니다.

### export 목록 조정

`return { ... }` 블록은 테스트에서 필요한 모든 전역 식별자를 열거해야 합니다. 새 기능에 대한 테스트를 추가할 때 관련 식별자를 여기에 추가하세요. 사용 가능한 식별자의 전체 목록은 각 소스 파일의 JSDoc 어노테이션에서 확인할 수 있습니다.

## 4. 테스트 구성

테스트는 복잡도에 따라 티어로 구성합니다:

### Tier 1 — 순수 로직 (DOM 불필요)

DOM 노드를 건드리지 않는 함수를 검증하는 테스트. 작성이 가장 간단하고 실행이 가장 빠릅니다.

| 테스트 대상 | 파일 |
| --- | --- |
| `nne()`, `noe()`, 프리미티브 별칭, 타입 검사 | `alienese-helpers.test.js` |
| `Doctre.matchReplace`, `crashBroker`, `copyPrimitives` | `doctre-match-replace.test.js` |
| PID 파싱 (`getPidComponent`, 스트리퍼, 세터) | `pid-parsing.test.js` |

### Tier 2 — DOM 상호작용 (jsdom)

DOM 요소를 생성하거나 조작하는 테스트. jsdom이 대부분의 경우 충분한 충실도를 제공합니다.

| 테스트 대상 | 비고 |
| --- | --- |
| `element.solid()` → `element.melt()` 라운드트립 | Doctre 프로토타입 확장 |
| `LocalStyle.localize()` | `##` 셀렉터 치환 |
| `loadExported` 슬롯 주입 | mock fetch 필요 |
| Active Struct 파이프라인 | `data-bind-*`, `data-solid`, `data-set-prototype` |

### Tier 3 — 페이지 라이프사이클

`bringPage`, `showPage`, `closePage` 등을 검증하는 테스트. DOM에 mock 페이지 구조(section, container, article)를 구성해야 하므로 셋업이 가장 복잡합니다.

## 5. 테스트 작성

테스트는 표준 Vitest 문법을 사용합니다. 모든 EstreUI 전역 변수는 import 없이 사용 가능합니다 (setup 파일이 `globalThis`에 바인딩).

```js
import { describe, test, expect } from 'vitest';

describe('nne() — isNotNullAndEmpty', () => {
    test('비어있지 않은 문자열에 대해 true 반환', () => {
        expect(nne('hello')).toBe(true);
    });

    test('null에 대해 false 반환', () => {
        expect(nne(null)).toBe(false);
    });

    test('빈 객체에 대해 false 반환 (falsy = empty)', () => {
        expect(nne({})).toBe(false);
    });
});
```

### 주의사항

1. **Falsy = empty.** `nne(0)`, `nne(false)`, `nne({})`, `nne([])` 모두 `false`를 반환합니다. 이것은 의도된 동작입니다 — Alienese는 모든 falsy 값을 "비어있음"으로 취급합니다.

2. **`matchReplace` 함수 플레이스홀더는 파이프를 포함한 전체 매치를 수신합니다.** `dataPlaceholder`가 함수인 경우 `token`이 아닌 `|token|` (파이프 포함)을 받습니다.

3. **`copyPrimitives`는 `null`을 유지합니다.** `null`은 `Object(v) !== v` 프리미티브 검사를 통과하므로 결과에 포함됩니다.

4. **ES 모듈 export가 없습니다.** 소스 파일은 `export`를 사용하지 않으며 모든 것이 전역입니다. 소스 파일에서 개별 함수를 `import`하려 하지 마세요.

## 6. 테스트 실행

```bash
# 단일 실행
npm test

# watch 모드 (파일 변경 시 재실행)
npm run test:watch

# 특정 파일 실행
npx vitest run test/alienese-helpers.test.js
```

## 7. 로더에 스크립트 추가

EstreUI에 새 스크립트 파일(예: 플러그인 또는 확장)을 추가하면, `test/setup.js`의 `loadOrder` 배열에 HTML `<script>` 태그에 나타나는 것과 동일한 위치에 추가하세요. 그런 다음 새 전역 식별자를 `return` 블록에 추가합니다.
