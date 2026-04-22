# EstreUI.js — 리뷰 & 개선 대시보드

> 이 폴더는 EstreUI.js 소스 분석 중 발견한 **버그, 오타, 개선 제안, 설계 의문점**을 건별로 추적한다.
> 업스트림 [SoliEstre/EstreUI.js](https://github.com/SoliEstre/EstreUI.js) 에 반영해야 할 항목들이며, 앱(망고클래스) 고유 이슈는 [../project/](../../project/) 에서 관리.

## 대시보드

| # | 제목 | 심각도 | 분류 | 파일 | 해결 버전 | 상세 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `closePage` — resolve 후 실행 계속 (missing return) | 🔴 버그 | navigation | `estreUi.js` L6056-6064 | live 2026-04-16 | [001-closepage-missing-return.md](001-closepage-missing-return.md) |
| 2 | `showOrBringPage` — 변수 스코프 누락 (전역 오염) | 🔴 버그 | navigation | `estreUi.js` L6152-6154 | live 2026-04-16 | [002-showorbringpage-scope-leak.md](002-showorbringpage-scope-leak.md) |
| 3 | `getConatiner` — 메서드명 오타 | 🟡 오타 | page-manager | `estreUi.js` L5785 | live 2026-04-16 | [003-getconatiner-typo.md](003-getconatiner-typo.md) |
| 4 | `EstreDedicatedCalanderHandle` — 클래스명 오타 | 🟡 오타 | handles | `estreUi.js` L6177, L9613 | live 2026-04-16 | [004-calander-typo.md](004-calander-typo.md) |
| 5 | `bringPage`/`showPage` switch fall-through 의도성 불명확 | 🟢 가독성 | navigation | `estreUi.js` L5893 | live 2026-04-16 | [005-bringpage-switch-fallthrough.md](005-bringpage-switch-fallthrough.md) |
| 6 | export fetch 재시도 — 백오프 없음 | 🟢 개선 | bootstrap | `estreUi.js` L14907-14981 | live 2026-04-16 | [006-export-fetch-no-backoff.md](006-export-fetch-no-backoff.md) |
| 7 | `LocalStyle` `##` 정규식 — 연속 `##` 에지 케이스 | 🟢 에지케이스 | markup | `estreU0EEOZ.js` L941 | live 2026-04-16 | [007-localstyle-regex-edge.md](007-localstyle-regex-edge.md) |
| 8 | `#isHiding` / `#isClosing` 플래그가 리셋되지 않음 | 🔴 버그 | lifecycle | `estreUi-pageModel.js` L103-106, L356, L380 | live 2026-04-22 | [008-hiding-closing-flags-not-reset.md](008-hiding-closing-flags-not-reset.md) |
| 9 | 재포커스 시 포커스 앵커가 없으면 첫 포커서블로 떨어짐 | 🟡 개선 | lifecycle / focus | `estreUi-pageManager.js` L538-565, `estreUi-pageModel.js` L423-438 | — | [009-autofocus-refocus-no-anchor.md](009-autofocus-refocus-no-anchor.md) |

## 심각도 범례

- 🔴 **버그** — 런타임 오류 또는 잘못된 동작을 유발할 수 있음.
- 🟡 **오타** — 기능에 영향 없으나 API 일관성/가독성 저해.
- 🟢 **개선/가독성** — 현재 동작하지만 더 나은 방식이 존재.

## 운영 가이드

- **새 이슈 발견 시**: `NNN-slug.md` 파일을 만들고, 대시보드 표에 행 추가.
- **업스트림에 반영 완료 시**: "해결 버전" 컬럼에 버전/커밋 해시 기입.
- **앱 코드(망고클래스) 이슈**: 여기가 아닌 `.agent/project/` 에서 관리.
- **문서 작성 중 발견한 이슈도** 같은 방식으로 등록.
