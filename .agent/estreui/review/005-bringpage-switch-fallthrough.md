# #005 — `bringPage` switch fall-through 의도성 불명확

- **심각도**: 🟢 가독성
- **파일**: `estreUi.js` — `EstreUiPageManager.bringPage()` (L5893-5927)
- **해결 버전**: —

## 현상

```js
switch (page.hostType) {
    case "article":
        // ... article 처리
        success = targetProcessed.article;
    case "container":                        // ← break 없이 fall-through
        if (success) {
            // ... container 처리
            success = targetProcessed.container;
        }
    case "component":                        // ← break 없이 fall-through
        if (success) {
            // ... component 처리
            success = targetProcessed.component;
        }
}
```

이 fall-through 는 **의도적인 설계**: hostType 이 `"article"` 이면 article → container → component 순으로 전부 처리하고, `"container"` 이면 container → component 만 처리하는 구조.

## 문제점

- JavaScript linter(ESLint) 가 기본적으로 fall-through 를 경고함.
- 코드를 처음 읽는 개발자가 `break` 누락 버그로 오해할 가능성 높음.
- `showPage`, `hidePage` 에도 동일한 패턴이 반복.

## 제안

의도적 fall-through 임을 명시하는 주석 추가:

```js
case "article":
    // ...
    success = targetProcessed.article;
    // falls through
case "container":
```

또는 if-else 체인으로 리팩터링:

```js
if (page.hostType === "article" || page.hostType === "container" || page.hostType === "component") {
    if (page.hostType === "article") { /* article 처리 */ }
    if (page.hostType === "article" || page.hostType === "container") { /* container 처리 */ }
    /* component 처리 */
}
```
