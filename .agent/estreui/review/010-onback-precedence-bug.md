# #010 — `onBack` 의 `||` / `?:` 우선순위 버그

- **심각도**: 🔴 버그 (조건 분기 오작동)
- **파일**: `estreUi-main.js` — `estreUi.onBack` (L1772-1776 — fix 전)
- **해결 버전**: live 2026-05-08 (commit ↗ next)

## 현상

`onBack` 의 한 줄 expression 이 **`||` 와 `?:` 의 operator precedence** 때문에 의도와 다른 분기로 평가됨. JavaScript 의 `?:` (precedence 4) 가 `||` (precedence 5) 보다 낮기 때문에, fix 전 코드는 다음과 같이 평가된다:

```js
// fix 전:
async onBack() {
    return await this.onBackOverlay() || onBackWhile() ||
        this.isOpenMainMenu ? await this.onBackMenu() || await this.closeMainMenu() : false ||
        await this.onBackBlinded() || await this.onBackMain();
}

// 실제 평가 (괄호 보강):
async onBack() {
    return (await this.onBackOverlay() || onBackWhile() || this.isOpenMainMenu)
        ? (await this.onBackMenu() || await this.closeMainMenu())
        : (false || await this.onBackBlinded() || await this.onBackMain());
}
```

→ `onBackOverlay()` 가 truthy 이거나 `onBackWhile()` 이 truthy 라도 그 결과 자체가 return 되지 않고 *condition* 으로 사용되어 menu/closeMainMenu branch 로 진입. 의도는 명백히 "overlay 가 처리했으면 그 결과 그대로 return + menu 단계 건드리지 않음" 인데 코드는 그렇게 동작하지 않음.

## 영향

- **overlay 가 떠 있는데 main menu 도 열린 상태** (예: 메뉴 위 dialog 띄움) 에서 back 누르면 overlay 가 닫혔어도 추가로 menu 처리 호출 → 원하지 않는 추가 닫힘 / state 꼬임.
- **`onBackWhile()` 이 backHolds++ 한 dialog 대기 중** 인 상태에서 menu 가 열려 있으면 dialog hold 의도와 무관하게 menu/closeMainMenu 분기로 빠짐.
- 일상적으로 단일 stack (overlay-only / menu-only / main-only) 만 사용하면 표면화 안 되어 그동안 발견 안 된 듯.

## 수정

```js
async onBack() {
    if (await this.onBackOverlay()) return true;
    if (onBackWhile()) return true;
    if (this.isOpenMainMenu) {
        return await this.onBackMenu() || await this.closeMainMenu();
    }
    return await this.onBackBlinded() || await this.onBackMain();
}
```

명시적 `if` 분기로 의도 보존 + 가독성 향상. 외부 임베드용 back hook stack (roadmap #011 — `pushBackHandler` / `popBackHandler`) 추가 시 본문 맨 앞 한 블록만 prepend 하면 되도록 자리 정리.

## 회귀 가드

- 단일 stack 케이스 (overlay only / menu only / main only) 의 기존 동작은 유지.
- 복합 stack (overlay + menu, dialog hold + menu) 에서 fix 전후 동작이 달라짐 — 의도된 변경.
- `onBackOverlay()` 가 sync return (Promise 아님) 인 케이스에서도 `await` 가 안전하게 boolean unwrap.

## 검색 힌트

onBack precedence operator || ?: ternary overlay menu blinded backHolds onBackWhile branch fall-through
