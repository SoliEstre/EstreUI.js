# #006 — 포커스 라이프사이클 완성

- **우선순위**: 🟡 보통
- **분류**: 라이프사이클 / 접근성 / 네이티브 연동
- **상태**: ✅ 완료 — D0 실측 결과로 D 단계 스킵 (2026-04-22)

## 배경

EstreUI 의 포커스 라이프사이클은 페이지 핸들 레벨(`onFocus`/`onBlur`) 까지는 구현되어 있으나, 그 위·아래 두 층이 미완성이다.

### 현재 상태 요약

| 레이어 | 상태 | 위치 |
| --- | --- | --- |
| 페이지 핸들 `onFocus`/`onBlur` (handler + intent 디스패치) | ✅ 동작 | [estreUi-pageModel.js:417-457](../../../scripts/estreUi-pageModel.js#L417-L457) |
| 페이지 진입 시 자동 포커싱 (`estreUi.focus(article)`) | ⚠️ 부분 동작 — 핸들까지만 전달, 페이지 내부 DOM 요소 선택 로직 없음 | [estreUi-pageModel.js:308](../../../scripts/estreUi-pageModel.js#L308), [estreUi-main.js:1465](../../../scripts/estreUi-main.js#L1465) |
| Dialog 핸들 내부 포커스 | ✅ 동작 (`$confirm.focus()`, `$input.focus()` 등) | [estreUi-pageModel.js:2973,3079,3108](../../../scripts/estreUi-pageModel.js#L2973) |
| window `focus`/`blur` 수신 라우팅 | ✅ 연결됨 | [estreUi-main.js:381-388](../../../scripts/estreUi-main.js#L381-L388) |
| 최상위 `estreUi.onFocus()` / `onBlur()` | ❌ **빈 stub** | [estreUi-main.js:1577-1584](../../../scripts/estreUi-main.js#L1577-L1584) |
| 페이지별 "마지막 포커스 요소" 기억·복원 | ❌ 미구현 | — |
| `visibilitychange` 통합 | ❌ 미구현 | — |
| WVCA4EUI 래퍼 연동 실효성 | ❓ 미검증 (네이티브 `requestFocus/clearFocus` 호출 중이나 Android 에서 실제 `window.focus/blur` 가 발화되는지 불명) | — |

### 기대 시나리오

1. 사용자가 페이지에 진입하면 **자동으로 첫 입력 요소** 또는 **마지막으로 포커스했던 요소** 에 포커스가 꽂힌다.
2. 브라우저 탭 전환·앱 백그라운드 전환 후 돌아오면 직전 포커스가 **자연스럽게 복원**된다.
3. Flutter WebView 래퍼(WVCA4EUI) 가 앱 라이프사이클(`resumed`/`paused`) 에서 WebView 에 `requestFocus`/`clearFocus` 를 호출하면, EstreUI 의 최상위 `onFocus`/`onBlur` 가 정확히 트리거되고 위 1·2 시나리오가 자동으로 동작한다.

## 설계

### 계약 변경 — handler.onFocus / onBlur 반환값

현재 `pageHandle.onFocus()` 는 handler 를 호출만 하고 반환값을 무시한다 ([estreUi-pageModel.js:417-425](../../../scripts/estreUi-pageModel.js#L417-L425)). 이를 다음과 같이 확장:

```js
onFocus() {
    if (!this.isFocused) {
        this.#isFocused = true;
        if (window.isDebug) console.log("[onFocus] " + this.sectionBound + " " + this.hostType + " " + this.pid);

        const handled = this.handler?.onFocus?.(this);
        if (this.intent?.onFocus != null) {
            for (var item of this.intent.onFocus)
                if (item.from == this.hostType && !item.disabled) this.processAction(item);
        }
        if (handled !== true) pageManager.autoFocus(this);  // ← 신규
        return true;
    } else return false;
}
```

- `handler.onFocus(handle)` 가 **`true` 를 반환** 하면 "자체 포커싱 완료" 로 간주하고 기본 autoFocus 스킵.
- 반환값 없거나 `false` 면 매니저의 기본 로직 실행.
- `onBlur` 쪽도 대칭적으로 동일 계약 적용.

기존 dialog 핸들(`onFocus(handle) { this.$confirm.focus(); }`) 은 반환값이 undefined 라 **하위 호환**. 다만 리팩터 시 `return true` 를 명시적으로 붙여 의도를 드러내는 게 낫다.

### 추가 인자 — `isFirstFocus` / `isFinalBlur`

handler 가 "최초 포커스냐" / "닫히기 직전 포커스냐" 를 분기해야 할 수요가 크다 (예: 첫 진입에만 `[data-autofocus]` 적용, 닫힘 시점엔 저장만 하고 자동 복원 스킵). 기존 handle 상태로 이 분기를 만들 수 있는지 점검:

| 의미 | 기존 변수로 대체 가능? | 비고 |
| --- | --- | --- |
| `isFinalBlur` (닫히기 직전 blur) | ✅ `handle.isClosing` 로 대체 가능 | `close()` 가 `#isClosing = true` 후 `hide()` → `blur()` 호출하는 순서이므로 `onBlur` 시점에 이미 참 ([estreUi-pageModel.js:378-387](../../../scripts/estreUi-pageModel.js#L378-L387)) |
| `isFirstFocus` (onOpen 후 최초 focus) | ❌ 신규 플래그 필요 | 현재 `#isFocused` 는 focus/blur 토글용이라 2회차 이상 포커스를 구분 못함 |

따라서:

- `isFinalBlur` → handler 에 별도 인자로 주기보다 **`handle.isClosing` 를 그대로 쓰도록 문서화**. 인자 중복 회피.
- `isFirstFocus` → 신규 private 필드 `#everFocused` 추가, 첫 `onFocus` 시 `true` 로 전환. 두 번째 이상 호출에선 이미 참.

```js
#everFocused = false;
get everFocused() { return this.#everFocused; }

onFocus() {
    if (!this.isFocused) {
        const isFirstFocus = !this.#everFocused;
        this.#isFocused = true;
        this.#everFocused = true;
        // ... (로깅)
        const handled = this.handler?.onFocus?.(this, isFirstFocus);
        // ... (intent 디스패치)
        if (handled !== true) pageManager.autoFocus(this, isFirstFocus);
        return true;
    } else return false;
}

async onBlur() {
    if (this.isShowing) {
        this.#isFocused = false;
        // ... (로깅, intent)
        await this.handler?.onBlur?.(this, this.isClosing);
        return true;
    } else return false;
}
```

**`#everFocused` 리셋**: `onClose()` 종료 시 `false` 로 되돌려 재오픈(static page) 시 다시 최초 포커스로 간주. `release()` 에선 어차피 핸들 자체가 폐기되므로 리셋 불필요.

#### 에지 케이스

- **단독 `hide()` (close 없이)**: `isClosing === false` 상태로 `onBlur` 호출 → `isFinalBlur === false`. 정상 동작 (단순 은닉 후 재포커스 기대).
- **hidden 상태에서 close**: `isShowing === false` 라 `onBlur` 가드 통과 못함 → blur 이벤트 자체가 발화되지 않음. handler 는 `onFocus` 가 없었던 페이지의 `onBlur` 를 못 받는 게 자연스러움. 이 경로는 `onClose` 로만 처리.
- **연속 close 재시도**: `#isClosing` 가 한 번 true 로 설정된 후 리셋되지 않는 것으로 보임 ([estreUi-pageModel.js:380](../../../scripts/estreUi-pageModel.js#L380) 에서만 true, 다른 지점에서 false 전환 없음). 정적 페이지 재사용 시 `isFinalBlur` 시맨틱이 오염될 여지 있음 → 별도 리뷰 항목으로 등록 (review #008).

### `EstreUiCustomPageManager.autoFocus(handle)` 기본 구현

포커싱 우선순위:

1. `handle.lastFocusedElement` 가 아직 DOM 에 살아있으면 그것을 복원.
2. `handle.host` 내부에서 `[data-autofocus]` 선택자로 탐색 → 첫 매치에 포커스.
3. 그 외 host 내부 첫 focusable 요소 (input/textarea/select/button/[tabindex>=0] 등, `disabled`/`hidden` 제외) → 포커스.
4. 모두 없으면 no-op.

`EstreUiCustomPageManager` 의 메서드로 둬서 `*` prefix delegation 과 동일한 확장 패턴 유지. 특정 매니저가 다른 정책을 쓰고 싶으면 override.

### `lastFocusedElement` 기록

`blur` 이벤트는 활성 요소가 DOM 에서 제거되면 누락되고, Chrome 은 blur 시점에 이미 `document.activeElement` 를 `<body>` 로 돌려놓아 늦다. 따라서 **능동적 기록**:

```js
document.addEventListener("focusin", (e) => {
    const topHandle = estreUi.showingTopArticle ?? estreUi.mainCurrentOnTop;
    if (topHandle != null && topHandle.host?.contains(e.target)) {
        topHandle.lastFocusedElement = e.target;
    }
}, true);
```

- `focusin` 은 bubbling 이라 document 레벨에서 잡힘 (`blur` 는 non-bubbling).
- 페이지 `close` 시 `lastFocusedElement = null` 로 GC 돕기.

### 최상위 `estreUi.onFocus` / `onBlur` 실구현

```js
async onFocus() {
    const top = this.showingTopArticle ?? this.mainCurrentOnTop;
    top?.focus();  // 이미 isFocused 면 no-op, 아니면 autoFocus 경로 실행
},
async onBlur() {
    const top = this.showingTopArticle ?? this.mainCurrentOnTop;
    await top?.blur();  // lastFocusedElement 는 focusin 으로 이미 기록되어 있음
}
```

추가로 `document.visibilitychange` 도 연결 — 탭 숨김/재표시가 `window.blur/focus` 보다 모바일에서 신뢰성이 높음. 중복 호출은 `isFocused` 가드로 멱등 보장.

### WVCA4EUI 래퍼 연동

래퍼는 이미 Flutter `AppLifecycleState` 전환 시 WebView 의 `requestFocus()` / `clearFocus()` 를 호출하는 구조. 이론적으로 이 호출이 WebView 내 `window.focus`/`blur` 이벤트를 발화하면 EstreUI 의 라우팅이 완성된다.

단 **Android WebView 의 고질 이슈** — 네이티브 focus 변경이 JS 이벤트로 이어지지 않는 케이스가 다수 보고됨 (react-native-webview#306, flutter#132143, flutter_inappwebview#1974). iOS 는 보통 정상. 따라서 실측이 선행되어야 한다.

실측 결과에 따른 분기:

- **양쪽 정상**: 추가 래퍼 작업 불필요. EstreUI 쪽만 완성.
- **Android 미도달**: 래퍼 PR 필요. 라이프사이클 훅에서 `requestFocus/clearFocus` 와 **병행** 으로 `evaluateJavascript("window.dispatchEvent(new Event('focus'|'blur'))")` 강제 송출. EstreUI 측은 수정 불필요 (이미 window 이벤트 수신 중). 중복 발화는 `isFocused` 가드로 멱등.

## 단계별 계획

### D0 — 래퍼 실측 로깅 (선제) — ✅ 완료 (2026-04-22)

배포된 진단 로깅:

- [estreUi-main.js:1577-1588](../../../scripts/estreUi-main.js#L1577-L1588) — `estreUi.onFocus`/`onBlur` 에 `[D0 estreUi.onFocus]` / `[D0 estreUi.onBlur]` 한 줄 출력 (visibility, hasFocus, top page pid).
- [estreUi-main.js:390-396](../../../scripts/estreUi-main.js#L390-L396) — 비교용 `document.visibilitychange` 리스너 추가, `[D0 visibilitychange]` 출력.

Android·iOS 실기기에서 다음 시나리오로 로그 수집:

- 앱 전환 (백그라운드 → 포어그라운드).
- 앱 내 키보드 open/dismiss.
- 페이지 전환 후 탭 복귀.

수집 결과:

- **iOS**: window focus/blur 가 정상 발화되는지 확인.
- **Android**: window focus/blur 누락 시 `visibilitychange` 만 발화되는 패턴인지 확인.

→ Android 에서 발화 누락 확인 시 D 단계에 래퍼 PR 포함, 정상이면 스킵.

**실측 결과 (2026-04-22)**: Android·iOS 모두 `window.focus/blur` 와 `visibilitychange` 가 **둘 다** 정상 발화됨 (한 줄 간격). 핸들 `isFocused` 가드로 중복 호출 멱등 보장 확인. → **D 단계 스킵 확정.**

### A — `lastFocusedElement` 능동 기록 — ✅ 완료 (2026-04-22)

- [estreUi-pageModel.js:128](../../../scripts/estreUi-pageModel.js#L128) — `EstreUiPageArticleHandle.lastFocusedElement` 공개 필드 추가.
- [estreUi-main.js:398-405](../../../scripts/estreUi-main.js#L398-L405) — document 레벨 capture phase `focusin` 리스너. `showingTopArticle ?? mainCurrentOnTop` 의 host 안에 들어온 포커스만 기록.
- [estreUi-pageModel.js:485](../../../scripts/estreUi-pageModel.js#L485) — `onClose` 진입 시 `lastFocusedElement = null` 로 DOM 참조 해제.
- 회귀: [test/estreui/page-lifecycle.test.js](../../../test/estreui/page-lifecycle.test.js) "Roadmap #006 phase A" 블록 (3건).

### B — `pageManager.autoFocus` + handler 반환값 계약 — ✅ 완료 (2026-04-22)

- [estreUi-pageModel.js:102-103](../../../scripts/estreUi-pageModel.js#L102-L103) — `#everFocused` private 필드 + getter 추가.
- [estreUi-pageModel.js:421-432](../../../scripts/estreUi-pageModel.js#L421-L432) — `onFocus()` 가 `isFirstFocus` 계산 → handler 호출 → `handled !== true` 일 때 `pageManager.autoFocus(this, isFirstFocus)`.
- [estreUi-pageModel.js:455-462](../../../scripts/estreUi-pageModel.js#L455-L462) — `onBlur()` 가 `handler.onBlur(this, this.isClosing)` 로 `isFinalBlur` 전달.
- [estreUi-pageModel.js:486-487](../../../scripts/estreUi-pageModel.js#L486-L487) — `onClose()` 에서 `#everFocused = false` 리셋 (정적 페이지 재오픈 대응).
- [estreUi-pageManager.js:526-565](../../../scripts/estreUi-pageManager.js#L526-L565) — `EstreUiPageManager.autoFocus(handle, isFirstFocus)` 기본 구현. 우선순위: `lastFocusedElement` (2회차 이상) → `[data-autofocus]` → 첫 focusable.
- [estreUi-pageModel.js](../../../scripts/estreUi-pageModel.js) Dialog 핸들 6건 (`EstreDialogPageHandler`, `EstreConfirmDialogPageHandler` 외 4건) 의 `onFocus(handle)` 에 `return true` 명시.
- 회귀: [test/estreui/page-lifecycle.test.js](../../../test/estreui/page-lifecycle.test.js) "Roadmap #006 phase B" 블록 (11건). DOM 우선순위·반환값 계약·dialog 옵트아웃 검증.

> **주의**: `autoFocus` 의 위치는 설계 단계에서 `EstreUiCustomPageManager` 로 가정했으나, `pageHandle` 가 보유한 글로벌 참조가 `pageManager` (= `EstreUiPageManager` 인스턴스) 라는 구조 제약으로 base class 에 두었다. 프로젝트별 정책 확장은 base 메서드를 monkey-patch 또는 Custom 매니저에서 wrap 하는 방식으로 가능.

### C — `estreUi.onFocus`/`onBlur` 실구현 + visibility 통합 — ✅ 완료 (2026-04-22)

- [estreUi-main.js:1594-1604](../../../scripts/estreUi-main.js#L1594-L1604) — `estreUi.onFocus` / `onBlur` 가 `showingTopArticle ?? mainCurrentOnTop` 의 `focus()` / `blur()` 로 위임. 핸들의 `isFocused` 가드가 멱등 보장.
- [estreUi-main.js:390-399](../../../scripts/estreUi-main.js#L390-L399) — D0 진단 리스너 → `visibilitychange` 가 `visible` 시 `onFocus()`, 아니면 `onBlur()` 호출하는 정식 라우팅으로 교체. 기존 `window.focus`/`blur` 와 함께 발화돼도 핸들 레벨 가드로 중복 무해.
- D0 진단 console.log 는 `window.isDebug` 게이트 안으로 보존 (실측 계속 가능).
- A 의 `lastFocusedElement` 와 B 의 `autoFocus` 경로가 자연스럽게 소비됨 — 별도 배선 불필요.
- 회귀: [test/estreui/page-lifecycle.test.js](../../../test/estreui/page-lifecycle.test.js) "Roadmap #006 phase C" 블록 (3건).

### D — 래퍼 보강 — ⏭️ 스킵 (2026-04-22)

D0 실측에서 Android·iOS 모두 `window.focus/blur` 정상 발화 확인. 래퍼 추가 작업 불필요.

(래퍼 PR 계획은 본 문서 이력으로만 보존 — 향후 다른 WebView 환경에서 누락 확인 시 재검토.)

### 후속 — 잔여 엣지 케이스

C 배포 후 실측에서 "핸들러가 `onFocus(isFirstFocus=true)` 에서 `return true` 하면서 DOM `.focus()` 를 걸지 않은 경우 백→포그라운드 전환 시 첫 포커서블로 떨어지는" 현상 발견. Option A 패치로 **핸들러가 실제 `.focus()` 한 경우** 는 해결 ([estreUi-pageModel.js:431-436](../../../scripts/estreUi-pageModel.js#L431-L436) — `document.activeElement` 스냅샷을 `lastFocusedElement` 로 기록).

핸들러가 의도적으로 포커스를 걸지 않은 엣지 케이스는 계약 애매성 논의가 필요 → [review/009-autofocus-refocus-no-anchor.md](../review/009-autofocus-refocus-no-anchor.md) 로 이관.

### 테스트

- Tier 2 DOM 테스트 추가: `focusin` 기반 `lastFocusedElement` 기록, `EstreUiCustomPageManager.autoFocus` 우선순위 로직, handler 반환 `true` 시 자동 포커싱 스킵.
- Tier 3 라이프사이클 테스트: `estreUi.onFocus` 호출 시 최상위 페이지의 `focus()` 호출 검증 (mock).
- 회귀: Dialog 핸들들(`$confirm.focus()` 등) 이 계약 변경 후에도 동일하게 동작하는지.

## 의존성

- 다른 로드맵 항목에 의존하지 않음.
- 테스트 스위트(#004) 완료되어 있어 계약 변경을 회귀로 검증 가능.
- D 단계는 WVCA4EUI 저장소의 별도 릴리스가 필요 → 본 저장소 진행과 병행 가능하지만 머지 순서 조율 필요.

## 참고 자료

- [Window: focus / blur event — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/focus_event)
- [Page Visibility API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [bugzilla 559561 — 포커스된 요소가 제거되면 blur 미발화](https://bugzilla.mozilla.org/show_bug.cgi?id=559561)
- [flutter_inappwebview#1974 — requestFocus 구현 경위](https://github.com/pichillilorenzo/flutter_inappwebview/issues/1974)
- [react-native-webview#306 — Android window focus/blur 미발화 이슈](https://github.com/react-native-community/react-native-webview/issues/306)
- [flutter#132143 — webview_flutter 텍스트 입력 포커스](https://github.com/flutter/flutter/issues/132143)
- [flutter#41293 — 키보드 open 시 H5 페이지 포커스 상실](https://github.com/flutter/flutter/issues/41293)
- [WebViewContainerApplication-for-EstreUI.js](https://github.com/SoliEstre/WebViewContainerApplication-for-EstreUI.js)
