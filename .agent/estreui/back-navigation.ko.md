# Back Navigation — `estreUi.back()` 와 외부 handler stack

> Parallel: [back-navigation.en.md](back-navigation.en.md)

`estreUi.back()` 은 native back input 이 흘러 들어오는 진입점. Flutter 래퍼의 `processBackForEstreUi()` 가 Android back / iOS edge swipe 시 호출하고, in-page `popstate` 리스너도 같은 경로를 사용해 history pop 이 동일한 흐름을 만든다.

본 문서는 그 단일 호출 뒤의 두 레이어를 다룬다:

1. **EstreUI 자체 section stack** — overlay → backWhile (dialog hold) → menu → blinded → main 순으로 traverse, 한 분기가 input 을 흡수하면 멈춤.
2. **외부 handler stack** (roadmap #011 추가) — 호스트에 마운트된 외부 임베드 (채팅 라이브러리, 결제 위젯, 알림 센터 등) 가 자기 navigation step 을 등록해 EstreUI 가 *자체 stack 보다 먼저* input 을 넘긴다.

## 진입점

```js
estreUi.back()         // alias — estreUi.onBack() 과 동일
estreUi.onBack()       // async, Promise<boolean> 반환; true = 흡수됨, false = 호스트가 기본 처리
```

`onBack` 안의 순서는 고정:

```
외부 handler stack (LIFO)
  → onBackOverlay()
  → onBackWhile()           // estreUi-dialog.js 의 dialog hold 가드
  → if isOpenMainMenu: onBackMenu() / closeMainMenu()
  → onBackBlinded()
  → onBackMain()
```

가장 먼저 truthy 반환한 분기가 win; 호출자에게 제어 반환하고 나머지는 건드리지 않음. `popstate` handler 가 boolean 을 읽어서 `true` 면 그대로, `false` 가 application history root 근처에서 두 번 연속이면 "한번 더 누르면 종료" 안내를 띄움.

## 외부 handler stack

Light DOM 으로 마운트된 외부 임베드 (Shadow DOM 도 마찬가지 — 호스트 페이지를 통해 native back 을 받음) 는 자기 다단계 pop 시퀀스가 필요하다 — 예:

```
[Step 1] 임베드 패널이 최상위로 열림
   ↓ back → 임베드 close
[Step 2] 내부 페이지 진입
   ↓ back → 최상위로 복귀
[Step 3] 내부 페이지 안의 모달 / 검색 모드 / 다이얼로그
   ↓ back → 모달 close, 내부 페이지 그대로
```

각 step 진입 시 stack 에 push, 나갈 때 pop. EstreUI 가 LIFO 로 traverse — 가장 최근 handler 부터 묻는다.

### API

```js
const token = estreUi.pushBackHandler(handler)
estreUi.popBackHandler(token)              // 제거 성공 시 true
estreUi.clearAllExternalBackHandlers()     // 임베드 teardown 의 safety-net
```

`handler` 는 `() => boolean | Promise<boolean>`. truthy 반환 시 back input 흡수 (체인 중단, `onBack` 이 `true` 반환). falsy 반환 시 다음 (이전) handler 로, 그 다음 EstreUI 자체 stack 으로 전달. sync 와 async handler 가 같은 stack 에 공존 가능 — 루프가 각각 await 한다.

### Handler 계약

- **Truthy / falsy 만이 시그널.** `onBack` 은 다른 반환 형태를 무시한다.
- **Throw 격리.** handler 가 throw 하면 EstreUI 가 (`window.isLogging` 시) warn 로그 + 이전 entry 로 진행. stack 무결성 유지.
- **같은 handler 두 번 push 가능.** 각 push 가 별도 token + 별도 entry. 각 pop 이 하나씩 제거.
- **Out-of-order pop 허용.** `popBackHandler(token)` 이 stack 위치가 아닌 token 으로 제거. 임베드가 더 깊은 step (예: 모달) 만 dismiss 하고 그 아래 entry 로 되돌아가지 않을 때 유용.
- **Re-entrant handler 는 자체 가드 필수.** `onBack` 은 동시 호출을 serialize 하지 않음 — handler 가 긴 task 를 await 하는 동안 `back()` 이 또 발화하면 같은 handler 가 두 번 실행될 수 있다. 부작용이 비-멱등이면 in-flight 플래그로 가드.

### 패턴: 매 step 의 paired push/pop

```js
class Embed {
    open() {
        this.panelToken = estreUi.pushBackHandler(() => {
            this.close()
            return true
        })
    }
    openInnerPage(id) {
        this.innerToken = estreUi.pushBackHandler(() => {
            this.closeInnerPage()
            return true
        })
    }
    closeInnerPage() { estreUi.popBackHandler(this.innerToken); /* ... */ }
    close()           { estreUi.popBackHandler(this.panelToken); /* ... */ }
    destroy()         { estreUi.clearAllExternalBackHandlers(); /* ... */ }
}
```

`destroy()` 의 `clearAllExternalBackHandlers()` 는 개별 token 이 손실됐을 가능성 (reload, hard error 등) 을 위한 safety net. 정상 정리 흐름은 짝맞은 pop 호출.

### 패턴: 임베드 자체 back 프로토콜에 위임

```js
estreUi.pushBackHandler(async () => {
    const result = await embed.requestBack()
    if (result === 'consumed')    return true                      // 임베드가 처리
    if (result === 'shouldClose') { embed.close(); return true }   // 임베드가 닫혀야 함
    return false                                                   // EstreUI stack 으로 pass
})
```

임베드가 세 가지 결과로 답하는 패턴 — handler 가 각각을 `onBack` 루프에 적합한 truth 값으로 변환. 임베드 자체 stack 이 호스트에게 불투명하고 임베드가 자체 back-프로토콜을 노출할 때 유용.

## 비-목표

- **Forward navigation.** iOS forward swipe (history forward) 는 이 stack 으로 흐르지 않음. 임베드 step 은 본질적으로 비대칭 — pop 만 모델링.
- **무관한 임베드 간 cross-instance 순서.** 두 임베드가 handler 를 push 하면 LIFO 가 임베드 무관하게 적용. 임베드 간 결정론적 우선순위가 필요하면 host 의 분리된 section 위에서 운영 (한 시점에 한 임베드만 live handler) 하거나 host 가 소유하는 coordinator 안에서 wrap.
- **특정 임베드로의 pre-handler 디스패치.** `onBack` 은 어느 임베드가 input 을 받아야 하는지 분류하지 않음 — 가장 최근 pusher 가 win. 임베드 간 조정은 본 API 위 레이어에서.

## 관련

- [navigation-api.ko.md](navigation-api.ko.md) — `bringPage` / `closePage` / intent 흐름 (`onBack` 이 traverse 하는 EstreUI 측 stack).
- [page-handlers.ko.md](page-handlers.ko.md) — 페이지별 `onBack` handler (section stack 분기 중 하나).
- [roadmap/011-back-handler-hook.md](roadmap/011-back-handler-hook.md) — 본 API 를 만들어낸 제안.
- [review/010-onback-precedence-bug.md](review/010-onback-precedence-bug.md) — 외부 stack 이 prepend 될 자리를 정리한 precedence fix.
