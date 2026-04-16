# #002 — `showOrBringPage` 변수 스코프 누락 (전역 오염)

- **심각도**: 🔴 버그
- **파일**: `estreUi.js` — `EstreUiCustomPageManager.showOrBringPage()` (L6152-6155)
- **해결 버전**: —

## 현상

```js
showOrBringPage(id, intent, instanceOrigin) {
    pid = "*" + id;                                        // ← const/let 없음 → 전역 변수
    return pageManager.showOrBringPage(id, intent, instanceOrigin);  // ← pid를 안 쓰고 id를 전달
}
```

두 가지 문제가 겹쳐 있다:

1. **`pid` 에 `const`/`let` 선언이 없음** — strict mode 가 아니면 `window.pid` 전역 변수가 생성되거나 덮어씀. strict mode 에서는 `ReferenceError`.
2. **할당한 `pid` 를 사용하지 않음** — `"*" + id` 를 만들어 놓고 정작 `pageManager.showOrBringPage(id, ...)` 에 원본 `id` 를 전달. `*` 접두사 없이 넘기므로 별칭 해석이 동작하지 않을 수 있음.

## 비교

같은 클래스의 다른 메서드들은 올바른 패턴:

```js
bringPage(id, intent, instanceOrigin) {
    return pageManager.bringPage("*" + id, intent, instanceOrigin);  // ✅
}

showPage(id, intent, instanceOrigin) {
    return pageManager.showPage("*" + id, intent, instanceOrigin);   // ✅
}
```

## 영향

- `showOrBringPage()` 호출 시 별칭이 PID 로 해석되지 않아 페이지를 찾지 못할 수 있음.
- 전역 네임스페이스 오염으로 다른 코드에 예기치 않은 영향 가능.

## 제안 수정

```js
showOrBringPage(id, intent, instanceOrigin) {
    return pageManager.showOrBringPage("*" + id, intent, instanceOrigin);
}
```
