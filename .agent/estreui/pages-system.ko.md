# Pages Provider 와 커스텀 페이지 매니저

> 영문 버전: [pages-system.en.md](pages-system.en.md)

이 문서는 **PagesProvider** 패턴과 **EstreUiCustomPageManager** 를 통해 페이지 핸들러를 등록하고 EstreUI 페이지 시스템에 연결하는 방법을 설명한다.

페이지 핸들러 라이프사이클(`onBring`, `onShow` 등) 자체에 대해서는 [page-handlers.ko.md](page-handlers.ko.md) 를 참고.

## 개요

EstreUI 의 페이지 시스템은 세 단계의 추상화 레이어를 가진다:

```
EstreUiPageManager        ← 프레임워크 레벨, 모든 PID 관리, bringPage() 처리
  ↑
EstreUiCustomPageManager  ← 앱을 위한 서브클래스 포인트, 별칭 → PID 브릿지
  ↑
앱 페이지 매니저           ← 인증 게이팅, 로그인 후 큐 네비게이션 등 추가
```

**PagesProvider** 는 세 가지를 묶는 클래스:
1. 별칭 → PID 맵 (`static get pages`)
2. 인증 정책 객체 (`static get operator`)
3. 페이지별 핸들러 클래스 (인스턴스 필드)

## PagesProvider 해부

### Part 1: `static get pages` — 별칭 맵

사람이 읽기 쉬운 페이지 이름을 PID 문자열에 매핑:

```js
class MyPagesProvider {

    static get pages() { return {
        "home":          "&m=home",
        "home_root":     "&m=home#root",

        "profile":       "&m=profile",
        "profile_edit":  "&m=profile#edit@main",

        "settings":      "&m=menu#settings",

        "login":         "&b=login",
        "signup":        "&b=login#sign_up",
        "signup_step0":  "&b=login#sign_up@sign_up%0",
        "signup_step1":  "&b=login#sign_up@sign_up%1",
        "signup_step2":  "&b=login#sign_up@sign_up%2",

        "image_viewer":  "&b=imageViewer^#root@main",

        "search":        "&o=customToast#search^",
        "": "",
    }; }
```

핵심 포인트:
- 각 별칭은 짧고 기억하기 쉬운 이름; 각 값은 전체 PID.
- 맵은 `EstreUiCustomPageManager.init()` 에 전달되어 `pageManager.extPidMap` 에 저장.
- `bringPage("*alias")` 호출 시 `*` 접두사가 `extPidMap` 조회를 트리거.
- `EstreUiCustomPageManager.bringPage(id)` 는 자동으로 `*` 를 앞에 붙임 — 앱에서는 `myPageManager.bringPage("home")` 처럼 호출.

### Part 2: `static get operator` — 인증 정책

인증 없이 접근 가능한(공개) 페이지를 정의:

```js
    static get operator() { return {
        get publicPages() { return [
            "login",
            "signup",
            "signup_step0",
            "signup_step1",
            "signup_step2",
        ]; },

        get nestedOnUnauthed() { return {
            // "restricted_page": "fallback_page",
        }; },

        requiredAuth(pn) {
            if (this.publicPages.indexOf(pn) > -1) return false;
            else if (pn in this.nestedOnUnauthed) return this.nestedOnUnauthed[pn];
            else return true;
        }
    }; }
```

| 필드 | 용도 |
| --- | --- |
| `publicPages` | 인증이 필요 없는 별칭 배열. |
| `nestedOnUnauthed` | 별칭 → 대체 별칭 맵. 미인증 시 차단 대신 대체 페이지로 리다이렉트. |
| `requiredAuth(pn)` | `false` (공개), `true` (인증 필요), 또는 문자열 (리다이렉트 별칭) 반환. |

### Part 3: 인스턴스 필드 — 페이지 핸들러 클래스

각 인스턴스 필드는 페이지 별칭 이름을 갖고, `EstrePageHandler` 서브클래스가 할당:

```js
    // ... constructor, init(), etc.

    "home" = class extends EstrePageHandler {
        onBring(handle) {
            // 최초 설정
        }
        onShow(handle) {
            // 페이지가 보여질 때마다 실행
        }
    }

    "profile" = class extends EstrePageHandler {
        $nameField;

        onBring(handle) {
            this.$nameField = handle.$host.find(".name");
        }
        onOpen(handle, data) {
            if (data?.userName) this.$nameField.text(data.userName);
        }
    }

    "settings" = class extends EstrePageHandler {
        onShow(handle) {
            // 설정 UI 갱신
        }
    }
```

핸들러 클래스는 provider 의 인스턴스 필드로 인라인 정의된다. 필드 이름은 `static get pages` 의 별칭 키와 일치해야 한다. `EstreUiCustomPageManager.init()` 호출 시 각 핸들러 클래스가 별칭에 대응하는 PID 에 등록된다.

### 생성자와 init

provider 는 앱의 매니저 참조를 받는다:

```js
    #pageManager = null;
    #sessionManager = null;

    constructor(pageManager, sessionManager) {
        this.#pageManager = pageManager;
        this.#sessionManager = sessionManager;
    }

    async init() {
        // 핸들러가 실행되기 전에 필요한 비동기 설정 로드
        return this;
    }
```

`init()` 메서드는 핸들러 등록 전에 await 되므로, 핸들러가 필요로 할 설정이나 저장된 환경설정을 미리 로드할 수 있다.

## EstreUiCustomPageManager

### 기본 클래스

`EstreUiCustomPageManager` 는 EstreUI 가 제공하는 서브클래스 포인트:

```js
class EstreUiCustomPageManager {

    init(extPidMap, pageHandlers) {
        pageManager.extPidMap = extPidMap;
        EstreUiPage.registerProvider(pageHandlers);
        for (var id in pageHandlers)
            EstreUiPage.registerHandler(extPidMap[id], pageHandlers[id]);
        return this;
    }

    bringPage(id, intent, instanceOrigin) {
        return pageManager.bringPage("*" + id, intent, instanceOrigin);
    }

    closePage(id, closeHost = false, instanceOrigin = null) {
        return pageManager.closePage("*" + id, closeHost, instanceOrigin);
    }

    // showPage, showOrBringPage, hidePage 도 동일 패턴
}
```

`init()` 이 하는 일:
1. 프레임워크의 `pageManager` 에 별칭 맵 설정.
2. provider 인스턴스 등록 (핸들러가 `this.provider` 로 접근할 수 있도록).
3. 모든 핸들러 항목을 순회하며 PID 별로 등록.

### 인증 게이팅을 위한 서브클래싱

서브클래스의 주된 이유는 `bringPage()` 를 인터셉트하여 인증을 강제하는 것:

```js
class MyPageManager extends EstreUiCustomPageManager {

    #pageOperator = null;

    init(extPidMap, pageHandlers, pageOperator) {
        this.#pageOperator = pageOperator;
        return super.init(extPidMap, pageHandlers);
    }

    async bringPage(pid, intent) {
        if (!sessionManager.isAuthed) {
            const isRA = this.#pageOperator.requiredAuth(pid);
            if (isRA === true) {
                // 로그인 후를 위해 요청을 큐에 저장
                sessionManager.requestBringOnAuthed({
                    caller: this, pid, intent
                });
                await this.bringPage("login");
                return true;
            } else if (isRA !== false) {
                // 대체 페이지로 리다이렉트
                pid = isRA;
            }
        }
        return await super.bringPage(pid, intent);
    }

    onAuthed(data) {
        // 로그인 성공 후 호출; 큐에 저장된 네비게이션 재실행
        if (data.pid != null) {
            setTimeout(() => this.bringPage(data.pid, data.intent), 500);
        }
    }
}
```

인증 게이트 흐름:
1. 사용자가 보호된 페이지를 열려고 시도.
2. `bringPage()` 가 `requiredAuth()` 를 확인.
3. 인증이 필요하면 네비게이션 요청을 큐에 저장하고 로그인 표시.
4. 로그인 성공 후 `onAuthed()` 가 큐에 저장된 요청을 재실행.

## 전체 연결

부트 시퀀스에서 (`sessionManager.init()` 콜백 내부):

```js
myPageManager.init(
    MyPagesProvider.pages,
    await new MyPagesProvider(myPageManager, sessionManager).init(),
    MyPagesProvider.operator
);
```

이것은 반드시 `estreUi.init()` **전에** 실행되어야 한다. 프레임워크가 별칭 맵을 통해 섹션 export 를 해석해야 하므로.

### PID 해석 흐름

`myPageManager.bringPage("home")` 호출 시:

```
myPageManager.bringPage("home")
  → super.bringPage("home")
    → pageManager.bringPage("*home")
      → extPidMap["home"] 조회 → "&m=home"
        → pageManager.bringPage("&m=home")
          → 섹션 열기/표시, 핸들러 라이프사이클 발사
```

`*` 접두사는 프레임워크에게 `extPidMap` 에서 별칭을 조회하라는 신호. `!` 접두사는 프레임워크 내장 managed PID 맵(다이얼로그, 알림 등)에서 해석.

## 핸들러 등록 내부 동작

`EstreUiPage.registerProvider(provider)` 는 provider 인스턴스를 저장한다. 이후 핸들러 클래스가 인스턴스화될 때 `this.provider` 를 받게 되어 — 즉 provider 인스턴스 — 핸들러가 공유 서비스에 접근할 수 있다:

```js
"home" = class extends EstrePageHandler {
    onShow(handle) {
        // this.provider 는 MyPagesProvider 인스턴스
        const session = this.provider.sessionManager;
        if (session.isAuthed) {
            // 데이터 로드
        }
    }
}
```

`EstreUiPage.registerHandler(pid, handlerClass)` 는 PID 를 핸들러 클래스에 매핑한다. 해당 PID 의 페이지 핸들이 생성될 때 핸들러가 인스턴스화되어 페이지 핸들의 `.handler` 프로퍼티에 부착된다.

모든 등록이 완료되면 `EstreUiPage.commit()` 이 매핑을 확정하여 추가 변경을 방지한다.
