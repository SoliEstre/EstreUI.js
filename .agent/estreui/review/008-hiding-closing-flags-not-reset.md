# #008 — `#isHiding` / `#isClosing` 플래그가 리셋되지 않음

- **심각도**: 🔴 버그
- **파일**: `estreUi-pageModel.js` — `EstreUiPageArticleHandle` (L103-106, L356, L380)
- **해결 버전**: live 2026-04-22

## 현상

페이지 핸들의 라이프사이클 플래그 중 `#isHiding` 과 `#isClosing` 은 `true` 로 세팅만 되고 `false` 로 되돌려지지 않는다.

```js
// scripts/estreUi-pageModel.js
#isHiding = false;
get isHiding() { return this.#isHiding; }
#isClosing = false;
get isClosing() { return this.#isClosing; }
// ...
async hide(fullyHide = true) {
    if ((!this.isHiding && this.isShowing) || (fullyHide && !this.isFullyHided)) {
        this.#isHiding = true;                 // ← set only, never cleared
        await this.blur();
        await this.onHide(fullyHide);
        // ... (no reset on completion)
    } else return false;
}

close(isTermination = false, isOnRelease = false) {
    if (this.isOpened) {
        if (this.isOpened && (isOnRelease || isTermination || !this.isStatic))
            this.#isClosing = true;             // ← set only, never cleared
        const task = this.hide();
        return postAsyncQueue(async _ => {
            await task;
            return await this.onClose(isTermination, isOnRelease);
        });
    } else return false;
}
```

`grep` 으로 확인했을 때 전체 파일에서 `#isHiding` / `#isClosing` 의 대입 지점은 각각 초기화 1회 + `true` 세팅 1회 뿐. `false` 로 되돌리는 코드가 존재하지 않음.

## 영향

### 1. 정적 페이지(`isStatic`) 의 재사용 경로에서 `hide()` 가 차단됨

`hide()` 의 가드:

```js
if ((!this.isHiding && this.isShowing) || (fullyHide && !this.isFullyHided)) { ... }
```

- 최초 hide: `isHiding = false`, `isShowing = true` → 가드 통과 → `#isHiding = true` 로 전환.
- 이후 `onShow()` 호출로 페이지 재표시: `#isShowing = true` 로 돌아옴. 그러나 `#isHiding` 은 여전히 `true`.
- 재 hide 시도: `(!true && true)` = false. 두 번째 분기 `(fullyHide && !this.isFullyHided)` 가 true 면 통과하지만, `fullyHide === false` (단순 은닉) 케이스에서는 **가드 전체가 false 가 되어 hide 자체가 무시됨**.

### 2. `isClosing` 를 의미 시그널로 소비하는 로직이 오염됨

현재 `isClosing` 는 `onHide()` 안에서 `bringOnBack` 라우팅 판별에 쓰임 ([L470](../../../scripts/estreUi-pageModel.js#L470)):

```js
if ((this.isStatic && isMatchHostType) || this.isClosing && (...)) {
    // bringOnBack 실행
}
```

정적 페이지가 `close()` (with `isTermination` 또는 `isOnRelease`) 를 한 번 겪으면 `#isClosing` 이 영구적으로 `true` 가 되어, 이후 **의도하지 않은 단순 hide 에서도 bringOnBack 이 트리거될 수 있음**.

또한 [#006 로드맵](../roadmap/006-focus-lifecycle-completion.md) 에서 `handler.onBlur(handle, isFinalBlur)` 의 `isFinalBlur` 를 `handle.isClosing` 로 매핑할 계획인데, 플래그가 리셋되지 않으면 정적 페이지 재오픈 후의 blur 가 "닫힘 중" 으로 오인되어 **autoFocus 우회 등 실제로 트리거되면 안 되는 로직이 발화**할 수 있음.

### 3. 다른 상태 플래그와의 불일치

같은 핸들의 `#isOpened` / `#isShowing` / `#isFocused` 는 각각 `onClose` / `onHide` / `onBlur` 에서 정상적으로 `false` 로 되돌아온다. `#isHiding` / `#isClosing` 만 예외인데 의도된 설계로 보이지 않음 (주석·문서 없음).

## 재현 시나리오

```
정적 페이지 A (static=true, fullyHide=false 단순 은닉 지원)

1. show(A)    → #isShowing=true
2. hide(A, false) → #isHiding=true, #isShowing=false     [정상]
3. show(A)    → #isShowing=true                           [#isHiding=true 유지]
4. hide(A, false) → 가드 (!true && true) = false
                   → 가드 전체 false → hide 무시           [버그]
```

## 제안 수정

각 라이프사이클 이벤트의 **완료 시점** 에 플래그를 리셋:

### `onHide` 완료 시 `#isHiding = false`

```js
async onHide(fullyHide) {
    if (this.isShowing) {
        this.#isShowing = false;
        // ... (기존 로직)
        this.#isHiding = false;  // ← 추가
        return true;
    } else return false;
}
```

또는 `hide()` 의 Promise resolve 시점 (setTimeout 콜백) 에 리셋해 "hide 애니메이션 종료" 기준으로 맞춰도 됨. 시맨틱 선택 필요.

### `onClose` 완료 시 `#isClosing = false`

```js
async onClose(isTermination = false, isOnRelease = false) {
    if (this.isOpened && (isOnRelease || !this.isStatic)) {
        this.#isOpened = false;
        // ... (기존 로직)
        this.#isClosing = false;  // ← 추가
        return true;
    } else return false;
}
```

정적 페이지를 제외한 케이스에선 `onClose` 직후 `release()` 가 연쇄되므로 플래그 값이 무의미하지만, 정적 페이지의 재오픈 경로에서 중요.

### 선택: `isStatic` 케이스에서 플래그 자체를 사용하지 않기

대안으로 `#isClosing` 은 **정적 페이지에선 세팅 자체를 스킵**하도록 하는 방법도 있음 (현재 L380 가드는 이미 `isOnRelease || isTermination || !this.isStatic` 이라 거의 그렇게 동작 중). 다만 `isOnRelease === true` 로 정적 페이지를 닫는 경우는 여전히 문제.

## 테스트 제안

- 정적 페이지 `show → hide(false) → show → hide(false)` 회귀 테스트 (#004 Tier 3).
- `isClosing` 플래그 세터·리셋 단위 테스트 (#004 Tier 1).
- `bringOnBack` 라우팅이 두 번째 hide 에서 발화하지 않는지 검증.

## 비고

- #006 로드맵에서 `isFinalBlur` 시맨틱을 `handle.isClosing` 에 의존시키기로 했으므로, 본 리뷰 항목의 수정이 먼저 반영되거나 함께 처리되는 것이 바람직함.
