# #001 — `closePage` resolve 후 실행 계속 (missing return)

- **심각도**: 🔴 버그
- **파일**: `estreUi.js` — `EstreUiPageManager.closePage()` (L6052-6105)
- **해결 버전**: —

## 현상

`closePage` 내부에서 null 체크 후 `resolve(null)` 을 호출하지만 `return` 이 없어서, resolve 이후에도 코드 실행이 계속된다:

```js
closePage(pid, closeHost = false, instanceOrigin) {
    return postPromise(resolve => {
        postQueue(async _ => {
            if (pid.indexOf("!") > -1) pid = this.#managedPidMap[pid.replace(/^\!/, "")];
            if (pid == null) resolve(null);   // ← return 없음
            if (pid.indexOf("*") > -1) pid = this.extPidMap[pid.replace(/^\*/, "")];
            if (pid == null) resolve(null);   // ← return 없음
            if (pid.indexOf("$") < 0) pid = this.findPid(pid);
            const page = this.get(pid);
            if (page == null) resolve(null);  // ← return 없음
            page.setInstanceOrigin(instanceOrigin);  // ← page가 null이면 여기서 TypeError
            const sections = page.sections;
            if (sections == null) resolve(null);  // ← return 없음
            // ... 이하 실행 계속
```

## 영향

- `pid` 가 매핑되지 않는 경우 `page` 가 `null` 이 되고, `page.setInstanceOrigin()` 에서 `TypeError` 발생.
- Promise 가 이미 resolve 된 후 reject 되어, 호출 측에서 에러를 놓칠 수 있음.
- `resolve()` 가 여러 번 호출될 수 있으나 (첫 번째 이후는 무시됨), 의도와 다른 사이드이펙트 실행 가능.

## 비교

같은 클래스의 `hidePage()` (L6005-6049) 와 `bringPage()` (L6806-5929) 는 `return null` 패턴을 올바르게 사용:

```js
hidePage(pid, ...) {
    // ...
    if (pid == null) return null;   // ✅ 즉시 종료
    // ...
    if (page == null) return null;  // ✅ 즉시 종료
```

## 제안 수정

각 `resolve(null)` 뒤에 `return` 추가:

```js
if (pid == null) return resolve(null);
// 또는
if (pid == null) { resolve(null); return; }
```
