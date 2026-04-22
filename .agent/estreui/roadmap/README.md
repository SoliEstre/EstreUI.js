# EstreUI.js — 로드맵

> 이 폴더는 EstreUI.js의 향후 개선 계획을 추적한다.
> 각 항목은 배경, 범위, 단계별 진행 방안을 담은 개별 문서를 갖는다.

## 대시보드

| # | 제목 | 우선순위 | 분류 | 상태 | 상세 |
| --- | --- | --- | --- | --- | --- |
| 1 | JSDoc 타입 어노테이션 | 🔴 높음 | DX / 도구 | ✅ 완료 | [001-jsdoc-annotations.md](001-jsdoc-annotations.md) |
| 2 | 모듈 분리 | 🟡 보통 | 아키텍처 | 2단계 완료 | [002-module-splitting.md](002-module-splitting.md) |
| 3 | Alienese 인라인 문서화 | 🟡 보통 | DX | ✅ 완료 | [003-alienese-inline-docs.md](003-alienese-inline-docs.md) |
| 4 | 테스트 스위트 | 🟡 보통 | 품질 | ✅ 완료 | [004-test-suite.md](004-test-suite.md) |
| 5 | 에이전트 문서 CI 린트 | 🟢 낮음 | 도구 | ✅ 완료 | [005-agent-docs-lint.md](005-agent-docs-lint.md) |
| 6 | 포커스 라이프사이클 완성 | 🟡 보통 | 라이프사이클 / 접근성 | ✅ 완료 | [006-focus-lifecycle-completion.md](006-focus-lifecycle-completion.md) |

## 우선순위 범례

- 🔴 **높음** — 인간·AI 개발자 모두에게 즉각적 효과. 가장 먼저 착수.
- 🟡 **보통** — 효과가 크지만 점진적으로 진행 가능.
- 🟢 **낮음** — 있으면 좋은 수준. 다른 항목에 의존하거나 범위가 작음.

## 운영 가이드

- 작업 시작 시 상태를 **진행 중**으로 변경.
- 완료 시 **완료**로 변경하고 버전 또는 커밋 기입.
- 새 개선 아이디어는 `NNN-slug.md` 파일과 함께 대시보드에 행 추가.
