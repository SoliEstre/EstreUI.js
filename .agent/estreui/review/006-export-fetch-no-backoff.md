# #006 — export fetch 재시도에 백오프 없음

- **심각도**: 🟢 개선
- **파일**: `estreUi.js` — `estreUi.init()` 내 loadExported* 함수들 (L14907-14981)
- **해결 버전**: —

## 현상

섹션 export 파일 fetch 실패 시 즉시 무한 재시도:

```js
let loadExportedStaticDoc;
loadExportedStaticDoc = subTerm => loadExported("staticDoc.html").then(htmlContent => {
    this.$mainArea.prepend(htmlContent);
    return onLoadedStaticDoc(subTerm);
}).catch(error => {
    console.error("There has been a problem with your fetch operation for staticDoc: ", error);
    console.log("Retrying to load staticDoc...");
    return loadExportedStaticDoc(subTerm);  // ← 대기 없이 즉시 재시도
});
```

모든 export 파일(fixedTop, fixedBottom, staticDoc, instantDoc, managedOverlay, mainMenu, stockHandlePrototypes, customHandlePrototypes) 에 동일한 패턴.

## 영향

- 서버가 일시적 과부하 상태이면, 즉시 재시도가 상황을 악화시킴.
- 네트워크 단절 상태에서 CPU 를 소모하며 빠르게 루프 (콜스택은 비동기라 쌓이지 않지만, 콘솔 로그 폭주).
- 사용자에게 피드백 없이 무한 대기.

## 제안

지수 백오프(exponential backoff) 적용:

```js
let loadExportedStaticDoc;
loadExportedStaticDoc = (subTerm, attempt = 0) => loadExported("staticDoc.html").then(htmlContent => {
    this.$mainArea.prepend(htmlContent);
    return onLoadedStaticDoc(subTerm);
}).catch(error => {
    console.error("Fetch failed for staticDoc:", error);
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
    console.log(`Retrying in ${delay}ms...`);
    return postPromise(resolve => setTimeout(resolve, delay))
        .then(() => loadExportedStaticDoc(subTerm, attempt + 1));
});
```

또는 최대 재시도 횟수를 두고 초과 시 에러 화면 표시.
