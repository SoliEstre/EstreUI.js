# #002 — 모듈 분리

- **우선순위**: 🟡 보통
- **분류**: 아키텍처
- **상태**: 1단계 완료 (2026-04-17)

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
3. 의존성 그래프 문서화.

### 2단계 — 별도 파일로 추출

1. 위 표에 따라 개별 파일로 분리.
2. 단순한 연결(concatenation) 빌드 스텝(또는 ES module 번들러)으로 배포용 단일 `estreUi.js` 생성.
3. 배포 파일은 현재 모놀리스와 동일 — 런타임 변경 제로.

### 3단계 — (선택) ES module 지원

1. 각 모듈 파일에 `export` 문 추가.
2. ES module 진입점(`estreUi.esm.js`)을 기존 연결 버전과 함께 제공.
3. node 스캐폴딩([EstreUI-for-node](https://github.com/SoliEstre/EstreUI-for-node)) 사용 프로젝트에서 모듈 개별 import 가능.

## 제약

- 배포용 단일 파일 `estreUi.js`는 반드시 일반 `<script>` 태그로 동작해야 함 — 모듈 로더 필수 아님.
- 분리는 기존 클래스 경계를 따르며, 새로운 추상화를 만들지 않음.
- Stock handle은 가장 큰 섹션으로, 필요 시 핸들 카테고리별 추가 분리 가능하지만 이후 최적화 단계.

## 의존성

- 2단계는 JSDoc 어노테이션(#001)이 선행되면 효과적 — 타입 정보가 분리 시 암묵적 결합 확인에 도움.
