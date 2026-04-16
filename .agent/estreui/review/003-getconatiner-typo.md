# #003 — `getConatiner` 메서드명 오타

- **심각도**: 🟡 오타
- **파일**: `estreUi.js` — `EstreUiPageManager` (L5785)
- **해결 버전**: —

## 현상

```js
getConatiner(id, componentId, sectionBound, statement) {
//  ^^^^^^^^^^  "Container" 가 아닌 "Conatiner"
```

## 사용처

프레임워크 내부에서 호출하는 곳 (L3121):

```js
const page = pageManager.getConatiner(id, this.id, this.sectionBound);
```

오타가 정의와 호출 양쪽에 동일하게 있으므로 **런타임 오류는 없음**. 다만 외부에서 이 API 를 사용하려 할 때 `getContainer` 로 호출하면 `undefined` 반환.

## 제안 수정

메서드명을 `getContainer` 로 수정하고, 호환성을 위해 한시적으로 별칭 유지:

```js
getContainer(id, componentId, sectionBound, statement) { ... }
// deprecated alias
getConatiner(...args) { return this.getContainer(...args); }
```
