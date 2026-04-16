# #004 — `EstreDedicatedCalanderHandle` 클래스명 오타

- **심각도**: 🟡 오타
- **파일**: `estreUi.js` — L6177 (등록), L9613 (클래스 정의)
- **해결 버전**: —

## 현상

```js
// L6177 - handles 레지스트리
get [uis.dedicatedCalendar]() { return EstreDedicatedCalanderHandle; },
//                                     ^^^^^^^^^^^^^^^^^^^^^^^^^ "Calander" → "Calendar"

// L9613 - 클래스 정의
class EstreDedicatedCalanderHandle extends EstreHandle {
```

`Calendar` 가 `Calander` 로 오타. 정의와 참조가 일치하므로 **런타임 오류는 없음**.

## 영향

- 외부에서 클래스명으로 직접 참조할 때 혼란.
- `EstreUnifiedCalendarHandle` (올바른 철자) 과 불일치.

## 제안 수정

```js
class EstreDedicatedCalendarHandle extends EstreHandle { ... }
```
