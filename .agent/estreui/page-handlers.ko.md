# 페이지 핸들러와 라이프사이클

> 영문 버전: [page-handlers.en.md](page-handlers.en.md)

**페이지 핸들러**는 한 PID([pid-and-layout.ko.md](pid-and-layout.ko.md)) 에 대해 EstreUI 가 호출하는 컨트롤러 객체입니다. 가리킬 수 있는 페이지마다 클래스를 하나 선언하고, 페이지 매니저가 PID 를 인스턴스로 풀어 라이프사이클 호출을 라우팅합니다.

## 골격

```js
class CatalogDetailPage extends EstrePageHandler {

    onBring(handle) {
        // 첫 접촉. 페이지가 호출되기 시작하는 시점.
        // 호출자가 넘긴 데이터는 handle.intent.data 에 담깁니다.
        const itemId = handle.intent?.data?.itemId;
        this.#load(handle, itemId);
    }

    onShow(handle) {
        // 페이지가 트랜지션 끝나고 화면에 보이게 된 직후.
        // 1회성 애니메이션, 포커스 이동, 스크롤 복원 등을 여기서.
    }

    onIntentUpdated(handle, intent) {
        // 같은 PID 가 살아있는 채로 새 데이터로 다시 호출된 경우.
        // 재구축 대신 in-place 갱신을 권장.
        this.#load(handle, intent.data.itemId);
    }

    onHide(handle) {
        // 포그라운드를 떠나지만 다시 돌아올 수 있음.
        // 타이머·스크롤 리스너 일시 정지.
    }

    onClose(handle) {
        // 영구 종료 직전(다음에 onRelease).
        // 임시 저장, 분석 이벤트 발사 등.
    }

    onBack(handle) {
        // 하드웨어/백 제스처 내비게이션 오버라이드.
        // true 를 반환하면 이벤트 소비, 그 외는 EstreUI 가 페이지를 닫음.
    }

    onReload(handle) {
        // 풀투리프레시 / 프로그래매틱 리로드 오버라이드.
    }

    onApplied(handle) {
        // 이 페이지에 대한 EstreUI 데이터 바인딩 패스가 끝난 직후.
        // 방금 머티리얼라이즈된 바인드 DOM 을 안전하게 조회 가능.
    }

    #load(handle, itemId) { /* … */ }
}
```

## 전체 라이프사이클

```
              ┌─────────────────────────────────────┐
              │                                     │
bringPage ──► onBring ──► onOpen ──► onShow ──► (살아있음)
                          (1회)                     │
                                                    ▼
                                (같은 PID 재호출)
                                  onIntentUpdated  │
                                                    ▼
                              hide ─► onHide ─► (백그라운드)
                                                    │
                                                    ▼
                              show ─► onShow ◄──────┘
                                                    │
                                                    ▼
                              close ─► onClose ──► onRelease
                                       (1회)
```

`onOpen`, `onClose` 는 인스턴스 생애에 정확히 1번. 그 사이에 백그라운드/포그라운드를 오가며 `onShow`/`onHide` 는 여러 번 짝지어 발생합니다. `onApplied` 는 데이터 바인딩 완료에 묶여 있어 모델이 재적용되면 여러 번 발생할 수 있습니다.

## `handle` 인자

모든 콜백은 `handle`(=`EstrePageHandle`) 을 받습니다. 가장 유용한 멤버:

| 멤버 | 용도 |
| --- | --- |
| `handle.intent` | 호출자가 보낸 intent 객체(`{ data, … }`). |
| `handle.bound` | 이 페이지의 호스트 DOM(article/container/section 루트). |
| `handle.$bound` | 같은 요소의 jQuery 래퍼. |
| `handle.containers`, `handle.articles` | 컨테이너/섹션 호스트일 때의 자식 모음. |
| `handle.close()`, `handle.reload()` | 이 페이지만의 프로그래매틱 종료/리로드. |

## Pages Provider

핸들러를 하나하나 등록하지 않고 *Pages Provider* 에 모아 부트 시 페이지 매니저에 한번에 전달합니다. 일반적인 공급자는 세 부분으로 구성됩니다.

```js
class MyPagesProvider {

    // 1. 별칭 → 정규 PID 맵.
    static get pages() {
        return {
            "home":            "&m=home",
            "catalog":         "&m=catalog#root@main",
            "catalog_detail":  "&m=catalog#detail@overview",
            "login":           "&b=login",
            "confirm_dialog":  "&o=dialog#confirm^",
        };
    }

    // 2. Operator: 페이지 분류 정책(인증 게이트 등).
    static get operator() {
        return {
            get publicPages() { return ["login", "signup"]; },
            requiredAuth(pn) { return this.publicPages.indexOf(pn) < 0; },
        };
    }

    constructor(pageManager, sessionManager) { /* 참조 보관 */ }
    async init() { return this; }   // 아래 핸들러 맵을 가진 자기 자신 반환

    // 3. PID 별 핸들러 클래스. 필드명은 반드시 `pages` 의 키와 일치.
    "home" = class extends EstrePageHandler {
        onShow(handle) { /* … */ }
    };

    "catalog" = class extends EstrePageHandler {
        onBring(handle) { /* … */ }
        onShow(handle)  { /* … */ }
    };

    "login" = class extends EstrePageHandler {
        onBring(handle) { /* … */ }
    };
}
```

`pages` 는 평탄한 사전, `operator` 는 앱 정책 레이어(인증·딥링크 재작성 등), `pages` 키와 같은 이름의 인스턴스 필드가 그 페이지의 핸들러 클래스입니다. `init()` 은 이 인스턴스 자체를 반환하고, 매니저가 별칭으로 인덱싱합니다.

## 커스텀 페이지 매니저

기본 `EstreUiPageManager` 는 PID 해석과 라이프사이클 디스패치를 담당. 대부분의 앱은 `EstreUiCustomPageManager` 를 상속해 정책을 추가합니다.

```js
class MyPageManager extends EstreUiCustomPageManager {

    init(extPidMap, pageHandlers, operator) {
        this.operator = operator;
        return super.init(extPidMap, pageHandlers);
    }

    async bringPage(pn, intent) {
        // 인증 게이트 예시
        if (!this.session.isAuthed && this.operator.requiredAuth(pn)) {
            this.session.queueAfterAuth({ pn, intent });
            return super.bringPage("login");
        }
        return super.bringPage(pn, intent);
    }
}
```

## 부트 결선

```js
const sessionManager = new MySessionManager(/* … */);
const pageManager    = new MyPageManager(sessionManager);

$(document).ready(async () => {
    const provider = await new MyPagesProvider(pageManager, sessionManager).init();
    pageManager.init(MyPagesProvider.pages, provider, MyPagesProvider.operator);

    await estreUi.init(false);
    estreUi.checkOnReady(false, 800);
});
```

순서가 중요합니다.
1. 페이지 매니저가 별칭 맵과 핸들러를 가진 상태가 **`estreUi.init()` 보다 먼저** 와야 합니다.
2. `estreUi.init()` 이 rim 을 마운트하고 첫 `onShow` 사이클을 발사.
3. `checkOnReady()` 로 스플래시를 종료, "앱이 인터랙티브" 신호를 냅니다.

## 자주 쓰는 패턴

- **데이터 패치는 `onBring`, 렌더 후 마무리는 `onApplied`**: 바인딩이 끝날 때까지 DOM 을 건드리지 않게 합니다.
- **재진입은 `onIntentUpdated`**: 같은 페이지를 다른 데이터로 다시 호출할 때 close+bring 보다 효율적.
- **`onBack` 는 필요할 때만 오버라이드**: 반환 없으면 EstreUI 가 정상 처리. 인라인 에디터를 먼저 닫고 싶을 때 등 명시적으로 소비할 때만 true 반환.
- **핸들러 클래스는 얇게**: 실제 도메인 로직은 별도 서비스로 빼고, 핸들러는 intent/DOM/데이터 레이어를 잇는 풀(glue) 역할만.
