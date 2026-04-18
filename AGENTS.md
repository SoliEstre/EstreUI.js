# AGENTS.md

이 프로젝트(`testclass.mangoedu.co.kr` — 망고에듀 클래스 학생·학부모용)는
[SoliEstre/EstreUI.js](https://github.com/SoliEstre/EstreUI.js) 의 라이브 버전(최우선 구현·변경점이 발생하는 대항 프로젝트)입니다.
이 문서는 모든 AI 에이전트(Claude, Gemini, Codex 등)가 동일한 규칙으로 본 저장소에서 작업하도록 하는 **공통 가이드**입니다.

---

## 1. 에이전트 지식 베이스 구조

루트의 `.agent/` 폴더에 두 개의 영역이 있습니다.

| 경로 | 대상 | 언어 | 성격 |
| --- | --- | --- | --- |
| `.agent/estreui/` | EstreUI.js 자체(업스트림 범위) 개념·API·패턴 문서 | **영어 + 한국어 투 트랙** (`*.en.md` / `*.ko.md`) | 오픈 가능한 일반 개발문서 |
| `.agent/project/` | 본 프로젝트(망고클래스)의 응용·운영 컨텍스트, 문서 작성 배경 지식 | **한국어 전용** | 내부 작업용 메모 |

**진입점(entry point):** [.agent/estreui/README.md](.agent/estreui/README.md) 와 [.agent/project/README.md](.agent/project/README.md) — 각 폴더의 `README.md`가 목차이자 작성 현황판입니다.

---

## 2. 언어 정책

- 사용자와의 **사고·응답·대화**는 한국어를 기본으로 합니다.
- `.agent/project/` 하위 문서는 **한국어로만** 작성합니다.
- `.agent/estreui/` 하위 문서는 **영어·한국어 두 언어로 각각** 작성합니다.
  - 파일명 규칙: `<topic>.en.md`, `<topic>.ko.md`.
  - 둘 중 하나만 있으면 미완성(draft)이며, README 인덱스에 표시합니다.
  - 의미가 어긋나지 않도록 두 버전은 같은 구조·같은 예시를 따릅니다. 먼저 작성한 버전의 구조를 다른 언어로 옮기는 것을 기본으로 합니다.
- `.agent/estreui/README.md` 자체는 영어·한국어 섹션을 한 파일에 병기합니다.

---

## 3. 작업 규칙 (필수)

문서를 수정/추가할 때마다 다음을 반드시 지킵니다.

1. **README 먼저 업데이트.** 새로운 문서·섹션을 추가하거나 제목을 바꿨다면 즉시 해당 폴더의 `README.md` 인덱스를 갱신합니다. 인덱스가 실제와 어긋나면 문서 전체가 쓸모없어집니다.
2. **EstreUI.js 범위 준수.** `.agent/estreui/` 문서에는 업스트림 리포지터리([SoliEstre/EstreUI.js](https://github.com/SoliEstre/EstreUI.js))에 포함된 기능·API·CSS만 기술합니다. 망고클래스 전용 확장(예: `MangoEnterRexHandle`, API 경로, 도메인 용어)은 여기 쓰지 않습니다.
3. **예시 세탁(sanitization).** 본 서비스 코드를 발췌해 설명해야 한다면 반드시 중립적인 예시로 치환합니다.
   - `mangoEdu*` / `망고에듀` / `class.mangoedu.co.kr` 같은 브랜드·도메인 식별자는 일반 명칭(`myApp`, `example.com`)으로 변경.
   - `MANGO_CLASS_WUID` 같은 상수, API 경로(`/Auth/signInByPV`), 학교 코드 체계(OEC/SAC 등)처럼 업무 도메인 전용 자산은 언급하지 않거나 추상화.
   - `.agent/project/style-guide.md` 의 치환 표를 우선 적용합니다.
4. **사례 기반 서술.** 추상적 설명보다 "이런 마크업/클래스에 어떤 파일에서 어떤 훅이 걸리고, 결과적으로 어떻게 렌더된다" 식의 구체 시나리오를 선호합니다. 코드 블록은 실행 가능한 최소 단위로 축약합니다.
5. **참조는 마크다운 링크로.** 본 프로젝트 파일을 참조할 때는 `[filename.ext](relative/path)` 형식(절대경로 금지, 역슬래시 금지). 특정 라인은 `#Lnn` 앵커를 덧붙입니다.
6. **업스트림 소스 확인.** EstreUI.js 관련 사실을 서술할 땐, 로컬 `scripts/estreUi.js` 등은 로컬 수정이 있을 수 있으므로 의심스러우면 [SoliEstre/EstreUI.js](https://github.com/SoliEstre/EstreUI.js) 의 main 브랜치를 기준으로 검증합니다.
7. **업스트림/로컬 구분.** 어떤 파일이 업스트림인지 로컬 확장인지 판단이 필요할 때는 [.agent/project/upstream-vs-local.md](.agent/project/upstream-vs-local.md) 를 먼저 읽습니다.
8. **`.agent/` 수정 시 lint 실행.** `.agent/` 하위 문서를 추가·이름변경·삭제·구조 변경했다면 커밋 전에 `npm run lint:docs` 를 실행해 clean 을 확인합니다. 린트가 깨진 상태로 커밋하지 않습니다. 검사 항목(인덱스 완전성, 죽은 링크, 투 트랙 쌍, 리뷰·로드맵 대시보드 정합성) 은 [.agent/lint.mjs](.agent/lint.mjs) 헤더 주석 참조.

---

## 4. 테스트 스위트 (업스트림 범위)

EstreUI.js 본체 동작을 검증하는 테스트는 [test/estreui/](test/estreui/) 에 모여 있습니다. 이 폴더는 프레임워크 범위만 담기며, 업스트림 [SoliEstre/EstreUI.js](https://github.com/SoliEstre/EstreUI.js) 리포와 함께 배포되는 것을 전제로 합니다.

### 폴더 분리 규칙

| 경로 | 범위 | 업스트림 배포 |
| --- | --- | --- |
| `test/estreui/` | EstreUI.js 본체 검증 (PID 파싱, Doctre, LocalStyle, handle, page manager, 회귀) | ✅ 포함 |
| `test/project/` | 망고클래스 고유 로직·플로우 검증 (앞으로 추가될 때) | ❌ 제외 |

- 새 테스트가 **업스트림 기능 검증**이면 `test/estreui/` 에 둡니다. 프로젝트 고유 식별자(`mangoEdu*`, API 경로, 도메인 용어)를 섞지 마세요 — 업스트림에 그대로 복사되어야 합니다.
- 새 테스트가 **앱 고유 로직 검증**이면 `test/project/` 에 둡니다. 해당 폴더는 `.agent/project/` 와 동일한 기준으로 업스트림에서 제외됩니다.

### EstreUI 기반 신규 프로젝트에서의 활용

새 프로젝트가 EstreUI.js 를 도입할 때, `test/estreui/` 폴더를 그대로 복사하면 즉시 회귀 스위트를 얻습니다:

1. 업스트림 `test/estreui/` 를 프로젝트 `test/estreui/` 로 복사.
2. `vitest.config.js`, `package.json` (`devDependencies`: `vitest`, `jsdom`; `scripts`: `test`, `test:watch`) 설정 — 자세한 단계는 [.agent/estreui/testing-guide.ko.md](.agent/estreui/testing-guide.ko.md) 참고.
3. `test/estreui/setup.js` 의 `loadOrder` 가 해당 프로젝트의 스크립트 목록과 일치하는지 확인 — 커스텀 핸들러·확장을 추가했다면 HTML `<script>` 순서와 동일하게 배열에 추가.
4. `npm test` 실행 → 184+ 케이스가 바로 통과해야 합니다.

### 공통 테스트 수정 시

`test/estreui/` 의 테스트를 수정하면 **업스트림 반영 대상**입니다. 리뷰(`.agent/estreui/review/`) 와 동일하게 업스트림 PR 로 역류시킵니다. 이 폴더를 수정할 때 프로젝트 고유 식별자를 섞으면 업스트림 이식 시 세탁 작업이 발생하므로 주의합니다.

---

## 5. EstreUI.js 리뷰 & 개선 추적

소스 분석·문서 작성 중 EstreUI.js 업스트림의 **버그, 오타, 개선점**을 발견하면 `.agent/estreui/review/` 에 등록합니다.

1. **파일 생성.** `NNN-slug.md` (번호-케밥케이스) 형식으로 상세 문서 작성 — 현상, 코드 위치(파일·라인), 영향, 제안 수정 포함.
2. **대시보드 갱신.** `review/README.md` 의 대시보드 표에 행 추가. 심각도(🔴 버그 / 🟡 오타 / 🟢 개선), 분류, 파일, 해결 버전 컬럼 채움.
3. **업스트림 반영 시.** 수정이 업스트림에 반영되면 "해결 버전" 컬럼에 버전/커밋 해시 기입.
4. **앱 코드(망고클래스) 이슈는 여기가 아닌 `.agent/project/` 에서 관리.** EstreUI.js 자체의 이슈만 등록.
5. **문서 언어.** 리뷰 문서는 **한국어 단일**로 작성 (운영 추적 문서이므로 투 트랙 불필요).

---

## 6. 요약 — 에이전트가 새 세션에서 해야 하는 일

1. 사용자가 망고클래스 코드 수정을 요청 → 코드만 수정, 문서는 건드리지 않아도 됨.
2. 사용자가 "EstreUI.js 관련 개념/패턴 문서 작성" 요청 → `.agent/estreui/README.md`를 먼저 열어 현황 확인 → 해당 토픽 문서(`*.en.md` + `*.ko.md`) 작성·수정 → README 인덱스 갱신.
3. 사용자가 "망고클래스 배경·컨텍스트 정리" 요청 → `.agent/project/` 안에서 한국어로 작성·수정.
4. 에이전트별 보조 파일: [CLAUDE.md](CLAUDE.md), [GEMINI.md](GEMINI.md) — 모두 본 문서(`AGENTS.md`)를 정식 지침으로 참조합니다.
