# #002 — 모듈 분리

- **우선순위**: 🟡 보통
- **분류**: 아키텍처
- **상태**: 2단계 완료 (2026-04-18)

## 배경

`estreUi.js`가 단일 파일로 15,000줄 이상이라 탐색·수정·리뷰에 부담이 크다:

- **인간 개발자**: 수천 줄을 스크롤해서 클래스를 찾아야 하고, 작은 변경에도 diff가 방대하며, 여러 사람이 다른 부분을 수정하면 머지 충돌 발생.
- **AI 에이전트**: 하나의 클래스만 필요해도 파일 전체를 컨텍스트에 로드해야 하므로 토큰 예산 낭비.

## 제안 분리 구조

| 모듈 | 현재 위치 (대략) | 내용 |
| --- | --- | --- |
| `estreUi-core.js` | L1–500 | 상수, `eds`/`uis` 레지스트리, 기본 유틸 |
| `estreUi-page.js` | L500–2100 | `EstreUiPage`, PID 파싱, 페이지 데이터 모델 |
| `estreUi-activeStruct.js` | L2100–2420 | `initDataBind`, `initSolidPoint`, `initLocalStyle`, `applyActiveStruct` |
| `estreUi-section.js` | L2420–5700 | 섹션 호스트, 컨테이너, 아티클, 컴포넌트 관리 |
| `estreUi-pageManager.js` | L5700–6170 | `EstreUiPageManager`, `EstreUiCustomPageManager` |
| `estreUi-handle.js` | L6170–6210 | `EstreHandle` 베이스 클래스, `registerCustomHandle`, stock handle 맵 |
| `estreUi-stockHandles.js` | L6210–12000 | 모든 내장 핸들 클래스 |
| `estreUi-main.js` | L12000–15000+ | `EstreUi` 싱글턴, init 시퀀스, DOM 오케스트레이션 |

## 단계별 계획

### 1단계 — 논리적 경계 (런타임 변경 없음)

1. 위 제안 모듈 경계마다 명확한 섹션 구분 주석 추가.
2. 섹션 간 순환 참조가 없는지 클래스/함수 참조 추적으로 확인.
3. 의존성 그래프 문서화 → [002-dependency-graph.md](002-dependency-graph.md).

### 2단계 — 별도 파일로 추출 ✅ (2026-04-18)

의존성 그래프에서 순환 참조가 있는 M4+M5+M6을 `estreUi-pageModel.js`로, M8+M9를 `estreUi-handles.js`로 묶어 최종 **8개 파일**로 분리했다. 빌드 스텝 없이 HTML에서 개별 `<script>` 태그로 순서대로 로드 — 모든 파일이 전역 스코프를 공유하므로 ES module 변환 불필요.

| 파일 | 라인 수 | 담당 모듈 |
| --- | --- | --- |
| `estreUi-core.js` | 554 | M1 Core |
| `estreUi-dialog.js` | 510 | M2 Dialog API |
| `estreUi-notation.js` | 595 | M3 Notation & Storage |
| `estreUi-pageModel.js` | 4316 | M4 Page Handle + M5 Page Handler + M6 Page Model |
| `estreUi-pageManager.js` | 624 | M7 Page Manager |
| `estreUi-handles.js` | 7242 | M8 Handle Base + M9 Stock Handles |
| `estreUi-interaction.js` | 1373 | M10 Swipe/Draggable |
| `estreUi-main.js` | 1667 | M11 estreStruct, estreUi 싱글턴, DOM init |

검증: Tier 1 + Tier 2 테스트 140개 전부 통과 — 런타임 동작 변경 없음. 업데이트 대상: `index.html`, `scripts/serviceWorker.js` (캐시 목록), `test/setup.js`.

### 3단계 — 모듈 소비자 지원 (이정표: 소비자 요구 대기)

현재 모든 소비자(브라우저 HTML, Vitest setup) 는 전역 스코프 기반으로 심볼을 참조한다 — `require`/`import` 로 EstreUI.js 를 쓰는 경로가 **아예 존재하지 않음**. 따라서 어떤 모듈 시스템을 미리 추가해도 소비자가 없어 죽은 코드가 된다.

3단계는 착수 시점이 아니라 **이정표(decision milestone)** 로 둔다. 다음 중 하나라도 발생하면 진행:

- [EstreUI-for-node](https://github.com/SoliEstre/EstreUI-for-node) 이 개별 모듈 import 방식으로 재편됨.
- npm 패키지 배포 계획이 구체화됨.
- 외부 기여자·다운스트림에서 module import 요구가 발생함.

착수 시점엔 아래 두 단계로 나눠 점진적으로 진행한다.

#### 3a — CJS 듀얼 패턴 (저비용 경로, 먼저 진행)

각 모듈 파일 끝에 CommonJS 가드 블록을 추가. `jcodd.js` 와 동일 패턴.

```js
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { EstreUiPage, eds, uis, /* 필요 심볼 */ };
}
```

커버 범위:

- ✅ 기존 브라우저 `<script>` 로드 그대로 유지 (`const` 최상위 바인딩은 classic script 전역 스코프에 그대로 남음).
- ✅ Node `require('./estreUi-core.js')` 로 개별 모듈 접근.
- ✅ Node `import ... from` (Node 의 CJS↔ESM interop 경유, default import).
- ❌ 브라우저 `<script type="module">` + named `import`.
- ❌ 개별 심볼 tree-shaking.

빌드 스텝 불필요. 파일당 10줄 가드만 추가하며 기존 전역 사용과 충돌하지 않는다. [EstreUI-for-node](https://github.com/SoliEstre/EstreUI-for-node) 수준의 Node 연동에는 이 범위로 충분.

#### 3b — 풀 ESM 지원 (빌드 스텝 도입 필요, 요구 발생 시)

브라우저 ESM·tree-shaking·named import 가 필요할 때만. `export` 는 정적 구문이라 classic `<script>` 와 한 파일에서 공존 불가 → **빌드 파이프라인(Rollup/esbuild) 도입이 불가피**하다.

지속 비용(참고):

- 빌드 툴링 설정·CI 통합·산출물 버전 관리.
- 파일 간 cross-reference 를 전부 명시적 `import` 로 전환하는 대규모 리팩터 (현재 2단계 분리는 "전역 스코프 공유" 전제).
- `new Function()` 기반 테스트 setup 재설계.
- classic·ESM 두 산출물 간 리그레션 교차 검증.
- 문서·샘플 2벌 유지.

따라서 3b 는 외부 ESM 소비자 요구가 위 비용을 정당화할 때 착수. 3a 범위로 커버되는 요구에는 진행하지 않는다.

## 연계 작업 — `EstreUI-for-node` 워크스페이스

별도 저장소([EstreUI-for-node](https://github.com/SoliEstre/EstreUI-for-node)) 에서 수행할 작업 — 본 저장소 범위 밖이지만 방향을 기록해 둔다.

1. 현재 EstreUI.js 로딩 방식 점검: 전역 스크립트 주입인지, 모듈 import 인지.
2. 3a 가 반영된 뒤에는 `require()` / default `import` 로 개별 모듈 접근 가능 → 필요 심볼만 가져오는 스캐폴딩 템플릿으로 갱신.
3. 3b 가 도입되면 ESM named import 기반 템플릿으로 전환하고 tree-shaking 이익을 확인.
4. 버전 동기화: 본 저장소 릴리스 태그를 EstreUI-for-node `package.json` 에 peer/실의존으로 명시.

이 연계 작업이 **시작 요건**으로 선행되거나, 본 저장소 3a 반영과 동시 진행될 때 CJS 듀얼 패턴의 투자가 의미를 가진다.

## 제약

- 배포용 단일 파일 `estreUi.js`는 반드시 일반 `<script>` 태그로 동작해야 함 — 모듈 로더 필수 아님.
- 분리는 기존 클래스 경계를 따르며, 새로운 추상화를 만들지 않음.
- Stock handle은 가장 큰 섹션으로, 필요 시 핸들 카테고리별 추가 분리 가능하지만 이후 최적화 단계.

## 의존성

- 2단계는 JSDoc 어노테이션(#001)이 선행되면 효과적 — 타입 정보가 분리 시 암묵적 결합 확인에 도움.
- 3a: module import 소비자(node workspace 또는 외부 패키지) 가 출현하는 시점에 진행.
- 3b: 3a 사용 경험 축적 + 브라우저 ESM/tree-shaking 요구가 발생하고 빌드 비용을 정당화할 때 진행.
