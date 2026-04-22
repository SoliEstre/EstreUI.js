# #009 — 재포커스 시 포커스 앵커가 없으면 첫 포커서블로 떨어짐

- **심각도**: 🟡 개선 (엣지 케이스, 놀람의 원칙 위반)
- **파일**: `estreUi-pageManager.js` — `EstreUiPageManager.autoFocus` (L538-565) / `estreUi-pageModel.js` — `EstreUiPageArticleHandle.onFocus` (L423-438)
- **해결 버전**: —

## 현상

핸들러의 `onFocus(handle, isFirstFocus=true)` 가 `return true` 로 자체 처리를 선언했지만 **DOM 엘리먼트에 `.focus()` 를 걸지 않은 경우** (예: 하이라이트/드롭다운 UI 작업만 수행, 혹은 포커스 대상이 `host` 밖, 혹은 프로그래매틱 포커스가 `document.body` 로 떨어진 경우), 이후 **백그라운드 → 포그라운드 전환 시** 페이지의 **첫 포커서블 엘리먼트가 포커스** 되는 현상이 발생할 수 있다.

## 재현 경로

```
1. 페이지 오픈 → onFocus(isFirstFocus=true) → handler가 true 반환
2. handler가 .focus() 호출 안 함 → lastFocusedElement = null
3. 앱 백그라운드 → onBlur (isFocused=false, everFocused 유지)
4. 앱 포그라운드 → onFocus(isFirstFocus=false)
5. handler가 "첫 포커스 전용" 분기라면 이번엔 true 반환 안 함
6. autoFocus(isFirstFocus=false) 실행
7. lastFocusedElement == null → 건너뜀
8. [data-autofocus] 없음 → 건너뜀
9. 첫 포커서블 엘리먼트 포커스 ❌
```

#006 phase A + Option A 패치([estreUi-pageModel.js:431-436](../../../scripts/estreUi-pageModel.js#L431-L436))로 **핸들러가 실제 `.focus()` 를 걸었고 그 대상이 `host` 안에 있는 경우** 는 `document.activeElement` 스냅샷으로 커버된다. 남은 엣지는 위와 같이 핸들러가 "포커스를 일부러 걸지 않은 경우" 뿐.

## 영향

- 사용자가 의도치 않은 엘리먼트(첫 입력 필드 등)가 포커스됨 → 가상 키보드 팝업, 스크롤 이동 등 UX 혼란.
- 순수 버그라기보단 계약 애매성에 가깝다: "핸들러 `return true` 의 의미 = 모든 포커스 정책을 위임받음" 인지, "= 지금 이 순간의 autoFocus 만 스킵" 인지 명확하지 않음.

## 논의 방향

세 가지 중 선택:

**A. 계약 명시** — 핸들러 `return true` 는 "모든 포커스 정책을 핸들러가 책임진다(재포커스 포함)" 로 정의. 프레임워크는 `#everFocused` 와 무관하게 **항상** 핸들러에게 물어보고 핸들러가 처리 선언하지 않을 때만 fallback. 현재 구조와 가장 근접하며 핸들러 측 재작성이 핵심.

**B. `#everFocused` 의미 재정의** — "이전 포커스 앵커가 존재하는지" 로 바꿈. `lastFocusedElement == null` 이면 재포커스에서도 `isFirstFocus=true` 로 취급해 핸들러의 첫 포커스 로직 재실행 기회 부여. 자동으로 올바른 동작이 나오나 의미 혼동 가능.

**C. autoFocus 마지막 fallback 제거** — 앵커(`lastFocusedElement` 또는 `[data-autofocus]`) 가 없으면 포커스하지 않음. "첫 포커서블" 추정 자체를 버림. 보수적이고 놀람의 원칙 준수. 기존 페이지가 이 fallback 에 의존하고 있었다면 회귀.

초기 판단: **A 권장.** 계약 명시가 단순하고 핸들러 작성자의 의도와 잘 맞는다. B/C 는 프레임워크 정책을 바꾸는 것이라 범위가 커짐.

## 참조

- #006 roadmap phase A/B: 포커스 라이프사이클 완성
- Option A 패치: `onFocus` 내 `document.activeElement` 스냅샷
