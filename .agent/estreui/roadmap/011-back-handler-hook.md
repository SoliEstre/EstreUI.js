# #011 — 외부 임베드용 Back Handler Hook API

- **우선순위**: 🟡 보통
- **분류**: navigation / 외부 통합
- **상태**: 📋 제안

## 배경

`estreUi.back()` 은 Flutter 래퍼 (`processBackForEstreUi()`) 가 Android back 버튼 / iOS edge swipe 시 호출하여 EstreUI 의 페이지 stack pop 을 담당한다. 내부 흐름:

```
window popstate
  → estreUi.onBack()
    → onBackOverlay() → onBackWhile() → (menu? menu/closeMain) → onBackBlinded() → onBackMain()
```

각 단계는 EstreUI 가 관리하는 자체 section stack (overlay / menu / blinded / main) 에 한정. **호스트 페이지에 light DOM 으로 마운트된 외부 임베드** (예: 외부 채팅 라이브러리, 외부 결제 위젯, 외부 알림 센터 등) 의 자체 navigation 단계 (예: 채팅방 → 목록 → 검색 → 다이얼로그) 는 EstreUI 가 인지하지 못한다.

### 결과

외부 임베드가 자기 fullscreen 상태를 표시 중이어도 Android back / iOS swipe 시 EstreUI 가 호스트 페이지 처리만 수행 → 임베드가 통째로 닫히거나 호스트 페이지가 navigation 됨. 임베드 입장에서는 step 별 pop 흐름 (예: 채팅방 → 채팅 목록 → 임베드 close → 호스트 페이지 close) 이 깨짐.

monkey-patch (`window.estreUi.back` 직접 wrap) 로 우회 가능하지만 EstreUI 업데이트와 충돌 위험이 커 비권장. **공식 hook API** 를 둬서 외부 임베드가 자기 stack 을 등록하고, EstreUI back 시 외부 stack 우선 처리 후 fall-through 하도록 한다.

## 시나리오

외부 임베드가 호스트 페이지에 fullscreen 으로 마운트된 상태에서의 back 흐름:

```
[엔트리] 호스트 페이지에서 임베드 호출 진입점 클릭
   ↓ (back) → 임베드 close
[Step 1] 임베드 fullscreen 패널 — 1차 진입 (예: 채팅 목록)
   ↓ (back) → 임베드 close
[Step 2] 임베드 내 페이지 진입 (예: 채팅방)
   ↓ (back) → 1차 진입으로 돌아감
[Step 3] 임베드 내 모달 / 검색 모드 / 다이얼로그
   ↓ (back) → 모달/모드 종료, 이전 step 복귀
```

각 step 진입 시 임베드가 EstreUI 의 외부 stack 에 push, 나갈 때 pop. EstreUI back 시 외부 stack 의 가장 최근 handler 부터 호출하고, handler 가 처리 선언 (`true` 반환) 하면 거기서 멈춤. 처리 안 하면 (`false`) 다음 (이전) handler, 모두 false 면 EstreUI 자체 onBack 흐름으로 fall-through.

## API 설계

세 옵션 검토 후 **Option A (Stack 기반 push/pop with token) 권장**.

### Option A — Stack 기반 (권장)

```ts
estreUi.pushBackHandler(handler: BackHandler): BackHandlerToken
estreUi.popBackHandler(token: BackHandlerToken): boolean

type BackHandler = () => boolean | Promise<boolean>
type BackHandlerToken = number  // 또는 symbol
```

- LIFO: `estreUi.back()` 호출 시 가장 최근 push 된 handler 부터 호출
- handler `true` 반환 → 처리됨, `estreUi.back()` 즉시 `true` 반환 (호스트 native back 차단)
- handler `false` 반환 → 다음(이전) handler 시도, 모두 `false` 면 EstreUI 자체 onBack 진행
- pop 은 token 으로 안전 제거 — out-of-order pop 도 허용 (외부 step 이 비대칭으로 닫히는 경우 대비)
- 토큰 타입은 EstreUI 의 다른 register 패턴 (`EstreSwipeHandler.register` 의 number index 등) 따라 number 권장

### Option B — Register/unregister with priority

```ts
estreUi.registerBackHandler(handler: BackHandler, options?: { priority?: number }): () => void
```

- priority 로 외부 stack 순서 명시 가능. unregister 함수 반환 — token 관리 불필요.
- 단점: 같은 priority 동시 등록 시 순서 불명확.

### Option C — Hook 배열

```ts
estreUi.onBackHooks.push(handler)
estreUi.onBackHooks = estreUi.onBackHooks.filter(h => h !== handler)
```

- 가장 단순. 단점: 순서 / 제거 책임 호출자에 전가, array mutation 직접 노출.

→ Option A 가 navigation stack 시멘틱과 가장 직관 일치 + push/pop pair 가 명시적 + token 매칭으로 out-of-order pop 안전.

## 동작 사양 (Option A)

1. **호출 자리**: `onBack` 의 가장 앞. review #010 fix 후 명시적 `if` 분기 구조라 prepend 한 블록만 추가하면 된다:
   ```js
   async onBack() {
       // 외부 push 된 handler stack 우선 처리 (LIFO)
       for (let i = this.#externalBackStack.length - 1; i >= 0; i--) {
           try {
               if (await this.#externalBackStack[i].handler()) return true;
           } catch (e) {
               if (window.isLogging) console.warn("[estreUi] external back handler error", e);
           }
       }
       // 기존 처리
       if (await this.onBackOverlay()) return true;
       if (onBackWhile()) return true;
       if (this.isOpenMainMenu) return await this.onBackMenu() || await this.closeMainMenu();
       return await this.onBackBlinded() || await this.onBackMain();
   }
   ```
2. **Sync / async 둘 다 지원**: handler `boolean` 또는 `Promise<boolean>` 반환. 호출자는 `await` 로 통일.
3. **에러 격리**: handler throw 시 swallow + warn 로그 + 다음 (이전) handler 진행. stack 무결성 유지.
4. **Token 매칭**: `popBackHandler(token)` — 매칭 실패 시 `false` 반환 + warn 로그, stack 변형 없음.
5. **멱등성**: 같은 handler 두 번 push 가능 — 각각 다른 token 발급, 별개 entry.
6. **Cleanup hook (선택)**: `estreUi.clearAllExternalBackHandlers()` — 임베드 강제 cleanup 용. 임베드 측에서 destroy 시 자체 정리하는 게 우선이지만 fallback 으로 제공.

## 호환성 / 회귀 위험

- **기존 `estreUi.back()` 호출 시그니처 무변** — 외부 stack 비면 기존 동작 그대로.
- **Flutter 래퍼 변경 불필요** — `processBackForEstreUi()` 가 여전히 `estreUi.back()` 만 호출.
- **호스트 페이지 코드 영향 없음** — 외부 임베드만 hook 등록.
- **review #010 fix 와 동시 도입 권장** — onBack 본문 재구조화가 이미 완료된 자리에 한 블록 prepend 만 하면 됨.

## 단계

### Phase A — API 명세 확정 + 구현

- API 시그니처 / token 타입 / async 흐름 / 에러 격리 / cleanup 정책 확정
- `estreUi-main.js` 의 `estreUi` 객체에 `pushBackHandler` / `popBackHandler` 메서드 추가
- `#externalBackStack` private array (`{ token, handler }` 엔트리)
- `onBack` 본문에 외부 stack 처리 prepend
- 기본 단위 테스트 추가 (push → back → handler 호출 / pop 후 back → handler 호출 안 됨 / out-of-order pop / 에러 격리)

### Phase B — 문서화

- `.agent/estreui/back-navigation.{en,ko}.md` 신규 — API + 사용 패턴 + 외부 임베드 통합 예시
- `.agent/estreui/README.md` 인덱스에 신규 행 (영문/한국어 양쪽)
- `.agent/estreui/page-handlers.{en,ko}.md` 의 onBack 설명에 외부 stack 처리 자리 한 줄 추가

### Phase C — 회귀 가드

- review #010 fix 의 회귀 테스트와 합쳐서 onBack 전체 분기 흐름 (외부 stack → overlay → backWhile → menu → blinded → main) 한 번에 검증

## 미고려 / 추가 검토

- **EstreUI 가 미로드된 환경 (직접접속 PWA, 기타)** — `window.estreUi` 가 undefined 면 임베드 측이 hook 등록 안 하는 분기. 임베드 측 책임.
- **Multi-instance 임베드** (한 페이지에 동일 임베드 여러 개) — token 기반이라 각 인스턴스가 독립 token 관리하면 충돌 없음. 자체 검증.
- **Forward navigation (iOS forward gesture)** — 외부 임베드의 step 은 일반적으로 비대칭 — 단방향 back 만 다룸. 별도 hook 미제공.

## 참조

- 의뢰 출처: 외부 임베드 통합 진행 중 한 임베드 측에서 직접 의뢰. EstreUI 호스트의 light DOM 마운트 패턴이 일반화된 사례.
- 관련 이슈: review [#010](../review/010-onback-precedence-bug.md) — onBack 본문 정리. 본 항목 도입 전 선행.
