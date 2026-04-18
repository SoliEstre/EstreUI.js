# #005 — 에이전트 문서 CI 린트

- **우선순위**: 🟢 낮음
- **분류**: 도구
- **상태**: ✅ 완료 — 본 프로젝트 범위 (2026-04-18)

## 배경

`.agent/` 문서 체계는 README 인덱스가 실제 파일과 동기화되어 있어야 동작한다. 문서가 추가·이름변경·삭제될 때 인덱스를 갱신하지 않으면 이후 에이전트와 개발자가 잘못된 정보를 받게 된다. 현재는 컨벤션(AGENTS.md §3 규칙 1)으로 강제하지만, 컨벤션은 시간이 지나면 깨진다.

## 제안

경량 CI 체크(GitHub Action 또는 pre-commit 훅)로 다음을 검증:

1. **인덱스 완전성** — `.agent/estreui/`의 모든 `.md` 파일(`README.md` 제외)이 `README.md`에 링크로 존재하는지.
2. **죽은 링크 없음** — `README.md`의 모든 링크가 실제 파일을 가리키는지.
3. **투 트랙 완전성** — 각 `<topic>.en.md`에 대응하는 `<topic>.<lang>.md`가 존재하는지 (역방향도). 누락 쌍은 인덱스에 🟡(초안)으로 표시되어 있어야 함.
4. **리뷰 대시보드 정합성** — `review/`의 모든 파일이 `review/README.md`에 행으로 존재하는지.
5. **로드맵 대시보드 정합성** — `roadmap/`의 모든 파일이 `roadmap/README.md`에 행으로 존재하는지.

## 구현

[.agent/lint.mjs](../../lint.mjs) — Node ESM 스크립트, 외부 의존성 없음. `npm run lint:docs` 로 실행.

5개 체크:

1. **index-completeness** — `.agent/estreui/*.md` 중 README가 아닌 파일이 `estreui/README.md` 에 링크로 등장하는지.
2. **dead-link** — 세 README(`estreui/`, `review/`, `roadmap/`) 의 상대 `.md` 링크가 실제 파일을 가리키는지.
3. **two-track-parity** — `<topic>.en.md` 와 `<topic>.ko.md` 의 쌍 완결성. 한쪽만 있으면 인덱스의 해당 행이 🟡 로 표기되어 있어야 함.
4. **review-dashboard** — `review/NNN-*.md` 가 `review/README.md` 에 등록되어 있는지.
5. **roadmap-dashboard** — `roadmap/NNN-*.md` 가 `roadmap/README.md` 에 등록되어 있는지.

### LINT_IGNORE 마커

번호 부모 문서(예: `002-module-splitting.md`)의 자식 산출물(예: `002-dependency-graph.md`) 은 대시보드에 별도 행을 만들지 않는 편이 자연스럽다. 이 경우 파일 상단 10줄 이내에

```html
<!-- lint-ignore:unindexed -->
```

마커를 두면 check 1, 5 에서 제외된다. 부모 문서에서는 반드시 해당 자식 문서로 링크를 걸어 둘 것 (그래야 독자가 경로를 찾을 수 있고, dead-link 체크 외에도 수동 감사가 가능하다).

## 단계별 계획 — 본 프로젝트 범위 ✅

1. **1단계** ✅ (2026-04-18) — 검증 스크립트 작성, `npm run lint:docs` 제공. 수동 실행. 최초 실행에서 `002-dependency-graph.md` 누락 발견 → ignore 마커 + 부모 문서 링크 추가로 해결.
2. **2단계 — 에이전트 실행 규칙** ✅ (2026-04-18) — 본 저장소는 단독 개발·main 직푸시 워크플로우라 GitHub Action 의 효용이 낮다. CI 대신 **AI 에이전트 실행 규칙** 으로 대체: [AGENTS.md §3 규칙 8](../../../AGENTS.md) 에 "`.agent/**` 수정 시 커밋 전 `npm run lint:docs` 실행" 을 추가. 에이전트가 린트 clean 을 확인한 뒤 커밋한다.

## 채택자용 선택지 (업스트림·다운스트림)

본 프로젝트 범위 밖. `.agent/` 문서 패턴을 채택하는 저장소에서 필요에 따라 도입:

- **GitHub Action (PR 기반 협업 시)** — `.github/workflows/docs-lint.yml` 에 `node .agent/lint.mjs` 실행 단계 추가. `on.pull_request.paths: '.agent/**'` 필터 권장. 외부 기여자 PR 이 오는 공개 저장소(예: 업스트림 EstreUI.js) 에서 특히 유효. 스크립트가 외부 의존성 제로라 `npm install` 도 필요 없음.
- **pre-commit 훅 (로컬 조기 경보)** — husky 또는 `.git/hooks/pre-commit` 에 등록. Staged 파일이 `.agent/**` 를 건드렸을 때만 트리거하도록 제한. `--no-verify` 우회가 가능하고 Action 이 있으면 중복이라, 편의성 수단 정도로 위치시킨다.

스크립트의 예상 레이아웃·폴백 동작은 [.agent/lint.mjs](../../lint.mjs) 헤더 주석 참조.

## 의존성

- 다른 로드맵 항목에 의존하지 않음.
- 저노력·저위험이지만, 문서 양이 자동화를 정당화할 수준이 된 이후에 가치가 있음.
