# 커스텀 Handle

> 영문 버전: [custom-handles.en.md](custom-handles.en.md)

**Handle** 은 EstreUI 의 요소(element) 단위 컨트롤러입니다. *페이지 핸들러*가 PID 하나를 다룬다면, *핸들*은 DOM 요소 하나를 다루고, 같은 종류의 요소가 여러 개라면 각자 인스턴스를 가집니다. 호스트 페이지가 보여지고/숨겨지고/닫힐 때 그 안의 모든 핸들도 함께 show/hide/release 됩니다 — 라이프사이클 결선을 손으로 할 필요가 없습니다.

## 언제 쓰나

- 같은 동작이 여러 DOM 노드(입력칸, 리스트 아이템, 게시판 카드, 액션 버튼)에서 반복될 때.
- 동작에 라이프사이클이 필요할 때(페이지 닫힘 시 정리, 데이터 변경 시 재초기화).
- 동작이 앱 전체에 안정적인 API 를 노출해야 할 때(예: "모든 `.user-card` 인스턴스, 새로고침").

일회성 DOM 결선이 전부라면 `onApplied` 안의 `$(...).on(...)` 으로 충분합니다. 핸들은 *위젯의 종(種)* 을 다룰 때 씁니다.

## 골격

```js
class UserCardHandle extends EstreHandle {

    constructor(handle, host) {
        super(handle, host);
        this.#init();
    }

    init() {
        // EstreUI 가 일부 진입점에서 .init() 을 외부에서 호출함.
        // 우리는 생성자에서 미리 초기화하고, 외부 init 은 거부.
        return "Already initialised by constructor.";
    }

    release(remove) {
        // 리스너 해제·자원 정리.
        super.release(remove);
    }

    #init() {
        super.init();

        this.$bound.on("click", () => this.#openProfile());
        this.refresh();
    }

    refresh() {
        const user = UserCardHandle.dataSource?.();
        if (!user) return;
        this.$bound.find(".name").text(user.name);
        this.$bound.find(".email").text(user.email);
    }

    #openProfile() { /* … */ }

    // 정적 콜백 주입: 앱 부트가 여기 데이터 소스를 결선.
    static dataSource = null;
    static setDataSource(fn) { this.dataSource = fn; }
}

EstreHandle.registerCustomHandle(
    "userCard",      // 논리 이름 (uis.userCard 로 노출됨)
    ".user_card",    // 새로 마운트된 DOM 에 매칭할 CSS 셀렉터
    UserCardHandle   // 클래스
);
```

핸들이 되는 데 필요한 세 가지:

1. **`EstreHandle` 상속**, 생성자에서 `(handle, host)` 를 받아 `super` 로 위임.
2. **CSS 셀렉터로 등록** — `EstreHandle.registerCustomHandle(name, selector, Class)`. 이후 셀렉터에 매칭되는 모든 새 요소는 `UserCardHandle` 인스턴스를 갖습니다.
3. **`release(remove)` 구현** — 호스트 페이지가 닫힐 때 자원 해제.

## `super(handle, host)` 가 주는 것

클래스 본문에서 즉시 사용 가능한 것:

| 멤버 | 의미 |
| --- | --- |
| `this.bound` | 이 핸들이 제어하는 raw DOM 요소. |
| `this.$bound` | 같은 요소의 jQuery 래퍼. |
| `this.host` | 이 핸들을 소유하는 페이지 핸들(`EstrePageHandle`). `host.intent`, `host.close()` 등을 사용. |
| `this.data` | `bound.dataset` 단축 참조. |

## 라이브 레지스트리: `EstreHandle.activeHandle`

EstreUI 는 등록 시 사용한 *논리 이름*을 키로 한 레지스트리를 유지합니다. `alienese` 의 상수 `uis` 가 논리 이름을 레지스트리 키로 매핑:

```js
// 살아있는 모든 UserCard 새로고침:
EstreHandle.activeHandle[uis.userCard]?.forEach(handle => handle.refresh());
```

특정 종류의 위젯에 직접 참조 없이 업데이트를 일괄 전달하는 정석적인 방법.

## 셀렉터 전략

등록한 셀렉터는 새 DOM 이 문서에 들어올 때마다(페이지 마운트, 리스트 재렌더 등) 매칭됩니다.

- 태그 접두 사용: `"button.user_card"` 처럼 명확히 — `<div class="user_card">` 래퍼와 충돌 방지.
- 충분히 구체적으로: 부모 재렌더 시 중복 초기화되지 않도록(매칭 하나당 인스턴스 하나).
- 너무 일반적인 클래스명(`.button` 등) 회피 — *이 종류*임을 분명히.

## 정적 콜백 주입

핸들은 종종 앱 레벨 데이터(현재 세션, API 클라이언트, 디스패처)가 필요하지만 직접 import 하면 안 됩니다. 관행은 정적 setter 를 노출하고 앱 부트가 그것을 결선하는 방식.

```js
class LoginFormHandle extends EstreHandle {

    static onSubmit = null;
    static setOnSubmit(fn) { this.onSubmit = fn; }

    constructor(h, host) {
        super(h, host);
        this.$bound.find("button.submit").on("click", () => {
            const id = this.$bound.find("input[name=id]").val();
            const pw = this.$bound.find("input[name=pw]").val();
            LoginFormHandle.onSubmit?.(id, pw,
                () => this.#onOk(),
                () => this.#onFail());
        });
    }
    // …
}

// 부트 시:
LoginFormHandle.setOnSubmit((id, pw, ok, fail) => {
    // 인증 서비스 호출 후 ok() / fail()
});
```

핸들 파일에 모듈 간 의존을 두지 않게 해 주고, 결선은 앱 진입점이라는 한 곳에 모입니다.

## 정리(cleanup)

항상 `super.release(remove)` 호출 — `EstreHandle.activeHandle` 에서 인스턴스를 빼고 프레임워크가 관리하는 이벤트를 해제합니다. 자체 정리 코드는 그 위에:

```js
release(remove) {
    this.#abortController?.abort();
    clearInterval(this.#poller);
    super.release(remove);
}
```

`remove` 는 호스트 요소 자체가 DOM 에서 제거될 때 `true`(단순히 숨겨질 땐 `false`). 재표시 시까지 보존할 상태 여부를 결정할 때 활용.

## 피해야 할 안티 패턴

- **핸들보다 오래 사는 DOM 참조를 `this` 에 보관하지 마세요.** 닫히는 페이지가 `bound` 를 분리하면 누수.
- **abort 경로 없이 생성자에서 네트워크 호출을 시작하지 마세요.** 사용자가 도중에 떠날 수 있습니다.
- **인스턴스 간 가변 정적 상태 공유 금지** — 공유한다면 `release` 에서 함께 리셋. 세션 동안 인스턴스가 누적됩니다.
- **페이지의 라이프사이클 훅을 핸들 안에서 재구현하지 마세요.** 페이지 책임이면 페이지 핸들러로.
