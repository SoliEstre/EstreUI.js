# 부트 시퀀스와 스크립트 로드 순서

> 영문 버전: [boot-sequence.en.md](boot-sequence.en.md)

## 스크립트 로드 순서

`index.html` 의 `<script>` 태그 순서는 필수적입니다. EstreUI 스크립트들은 의존 체인이 있으며 순서가 어긋나면 조용히 깨집니다.

```
boot.js              ← 환경 감지, viewport meta, PWA insets
    ↓
jQuery               ← DOM 조작 기반
third-party libs     ← crypto-js, ua-parser 등 (순서 무관)
    ↓
modernism.js         ← JS 프로토타입 확장 (.let(), .also(), .it, .string 등)
alienese.js          ← 단축 별칭 (modernism 필요)
    ↓
estreU0EEOZ.js       ← 공통 유틸: doc, cvt, c, cls, eid, eds, 셀렉터 헬퍼
    ↓
estreUi.js           ← 핵심 프레임워크: EstrePageHandle, EstrePageHandler, EstreHandle,
                        EstreUiPageManager, EstreUiCustomPageManager, stedy/go/note 등
    ↓
커스텀 handles       ← EstreHandle 서브클래스 (estreUi.init() 전에 로드 필수)
커스텀 pages         ← PagesProvider + EstrePageHandler 클래스
    ↓
앱 진입점 (main.js)  ← 전부 결선, estreUi.init() 및 checkOnReady() 호출
```

모든 스크립트는 `<script defer>` 를 사용하여 HTML 파싱 후 순서대로 실행됩니다.

## boot.js

가장 먼저 실행(non-deferred, `<head>` 인라인). 역할:

- 기기/브라우저 감지: `isMobile`, `isIPhone`, `isAndroid`, `isSamsungBrowser`, `isAppleMobile`, `isStandalone`(PWA).
- 호스트명 기반 `window.isDebug` / `window.isLogging` / `window.isVerbosely` 설정.
- PWA 여부에 따라 적절한 `<meta name="viewport">` 주입.
- 노치 기기와 PWA viewport-fit 을 위한 safe-area inset 처리.
- `visualViewport` 리사이즈 리스너로 CSS 커스텀 프로퍼티(`--viewport-width`, `--viewport-height`, `--viewport-inset-*`) 설정.

## init 시퀀스

`main.js`(또는 앱 진입점) 하단에서 `$(document).ready()` 안에 부트 시퀀스가 실행됩니다:

```js
$(document).ready(() => setTimeout(() => {
    paramManager.init();

    sessionManager.init(async isTokenExist => {
        // 1. 페이지 매니저에 별칭 맵 + 핸들러 연결
        pageManager.init(
            MyPagesProvider.pages,
            await new MyPagesProvider(pageManager, sessionManager).init(),
            MyPagesProvider.operator
        );

        // 2. rim 초기화
        await estreUi.init(false);

        // 3. 액션 매니저 초기화 (서비스 워커 등)
        actionManager.init(serviceWorkerHandler);

        // 4. 저장된 토큰이 없으면 로그인 표시
        if (!isTokenExist) await pageManager.bringPage("login");

    }, isOnAuth => {
        // 관성 인증이 해결될 때 호출
        if (!isOnAuth) pageManager.bringPage("login");
        else pageManager.beginCheckAuthed();

    }, async isStraight => {
        // estreUi 준비 완료 시 호출
        estreUi.checkOnReady(false, 800);
    });
}, 1));
```

### 순서 제약 핵심

1. **`paramManager.init()`** 먼저 — URL 파라미터를 다른 코드가 읽기 전에 캡처.
2. **`pageManager.init()`** 이 `estreUi.init()` 보다 앞 — rim 이 별칭 맵을 통해 섹션 export 를 해석해야 하므로.
3. **`estreUi.init(false)`** — export 된 모든 섹션(`data-exported="1"`) 마운트, 핸들 결선, 최초 `onShow` 사이클 발사. `false` 인자는 즉시 스플래시 제거를 억제.
4. **`estreUi.checkOnReady(false, timeout)`** — `timeout` ms 전환 후 스플래시 화면 제거, 앱 인터랙티브 신호.

## 스타일시트 로딩: `<meta link="lazy">`

EstreUI 는 큰 스타일시트를 `<link>` 대신 `<meta>` 태그로 로드하는 패턴을 씁니다:

```html
<link rel="stylesheet" type="text/css" href="./styles/estreUiInitialize.css" />
<meta link="lazy" rel="stylesheet" type="text/css" href="./styles/estreUiRoot.css" />
<meta link="lazy" rel="stylesheet" type="text/css" href="./styles/estreUiCore.css" />
```

`*Initialize.css` 파일만 동기적으로 로드(스플래시 화면 스타일링). 나머지는 `meta link="lazy"` 로 지연 로드되며 프레임워크가 최초 페인트 이후 적용.

**이유:** 실제 아이폰에서 웹 폰트 `@font-face` 규칙을 포함한 스타일시트를 너무 많이 동기적으로 로드하면 페이지 로드 자체가 실패할 수 있습니다. lazy 방식은 이 iOS 장애 모드를 피하면서도, `<link rel="preload">` 태그로 사전 로드하여 빠른 가용성을 확보.

## Service Worker 통합

EstreUI 는 앱이 자체 서비스 워커를 관리하되, 라이프사이클 훅을 제공합니다:

```js
actionManager.init(serviceWorkerHandler);
```

`serviceWorkerHandler` 가 노출하는 리스너:

| 리스너 | 시점 |
| --- | --- |
| `setOnInstallingListener(fn)` | 새 SW 버전 설치 중. |
| `setOnWaitingListener(fn)` | 새 SW 가 설치 완료되어 활성화 대기 중. |
| `setOnActivatedNewerListener(fn)` | 새 SW 가 활성화됨. |
| `setOnControllerChangeListener(fn)` | 제어 SW 가 변경됨(리로드 지점). |

일반적 패턴: 대기 중인 워커 감지 → "업데이트 가능" 프롬프트 표시 → 사용자 확인 시 대기 워커에 `skipWaiting()` 지시 → 컨트롤러 변경 리스너가 페이지 리로드 트리거.

## `EstreUiParameterManager`

URL 쿼리 파라미터를 localStorage(LS) 와 sessionStorage(SS) 에 브릿징:

```js
class MyParamManager extends EstreUiParameterManager {
    static get prefix() { return "MyApp_"; }
    static get lsMatch() { return { /* url-param: ls-key */ }; }
    static get ssMatch() { return { get invite() { return "referrerCode"; } }; }

    constructor() {
        super(MyParamManager.prefix, MyParamManager.lsMatch, MyParamManager.ssMatch);
    }
}
```

`init()` 시 `location.search` 를 읽어 각 파라미터를 `lsMatch`(→ localStorage) 또는 `ssMatch`(→ sessionStorage) 를 통해 설정된 prefix 와 함께 저장. 매핑되지 않은 파라미터는 prefix 붙여서 sessionStorage 에 저장.

내장 SS 매핑: `page` → `"requestPage"`, `origin` → `"requestOrigin"`.
