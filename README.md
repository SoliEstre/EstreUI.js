# EstreUI.js
<img src="https://estreui.mpsolutions.kr/images/EstreUI-flatter-144x144.png">

## English

# Estre UI Rimwork (similar to a framework, yet quite distinct)

This project has been provided by [MP Solutions inc.](https://mpsolutions.kr) since 2024

***

Estre UI Rimwork is conceptually similar to a front-end framework, yet it differs in several aspects.
It is developed to function as a rim (a runnable frame) for universal (Mobile & PC) web-based front-end applications.

- Built on jQuery, it facilitates access and efficient usage for existing jQuery users.
- It can coexist with other front-end frameworks (such as Vue.js) and supports binding within Articles.
- It provides a basic UI and lifecycle that mirror those of native mobile applications (following an MVC pattern).
- It enables developers to directly leverage diverse, flexible web-based implementations within their projects.
- It offers fundamental implementations of SPA and PWA for rapid web application development.

<br />

# Preview

Application preview implementations.

- **Example web app 1** - [repo](https://github.com/SoliEstre/EstreUI.js-sample-app1) / [preview](https://estreui.mpsolutions.kr/App1)

Applications for Estre UI demonstration  
- **APT.** - [repo](https://github.com/Esterkxz/APT-EstreUI.js-demo) / [preview](https://estreui.mpsolutions.kr/APT)

<br />

# Flutter Codebase for WebView Container Application for Estre UI

[WVCA4EUI Github](https://github.com/SoliEstre/WebViewContainerApplication-for-EstreUI.js) - https://github.com/SoliEstre/WebViewContainerApplication-for-EstreUI.js

> We have made the referenced Flutter project public.
> It enables a seamlessly integrated, native-like web application for iOS and Android,
> making deployment to app stores both easier and faster.
> Moreover, it is optimized to interoperate organically with the Estre UI Rimwork and its PWA service.

<br />

# Document index

- [Structure](#Structure)
- [Lifecycle](#Lifecycle)

<br />

# Structure

## Rimwork top-level elements (children of document.body)
- `header#fixedTop` – App bar layer (similar to Android)
- `main#splashRoot` – Primary splash layer
- `nav#mainMenu` – Main menu layer
- `div#ptr` – Pull-to-refresh indicator layer (currently not implemented)
- `main#staticDoc` – Main content area (located below fixed top, bottom, and main menu)
- `footer#fixedBottom` – Fixed bottom menu (similar to Windows taskbar)
- `main#instantDoc` – Overlay content layer (covers everything except the splash screen when a page is open)
- `nav#managedOverlay` – Managed overlay layer for essential application UIs

<br />

## Section bounds (root page holder)
- `headerSections` contains the component sections of `header#fixedTop`
- `menuSections` contains the component sections of `nav#mainMenu`
- `mainSections` contains the component sections of `main#staticDoc` corresponding to the footer tab buttons in `footer#fixedBottom`
- `blindSections` contains the component sections of `main#instantDoc`
- `overlaySections` contains the component sections of `nav#managedOverlay`

<br />

## Page
A Page is a managed unit (akin to a component) with a lifecycle, consisting of three levels: **Component > Container > Article**.
Pages are managed (opened and closed) by the pageManager (an EstreUiPageManager object).

Each page is assigned a unique PID (Page ID) upon initializing Estre UI.
The format is: **${statement}&{sectionBound}={component id}#{container id}@{article id}**.
This PID is used to control the opening and closing of pages.
After initialization, pages can be reviewed in **pageManager.pages**.

### Component
A Component is the root element of a Page.
It is specified using the selector `section#{component id}`.
A Component can include multiple Containers.   
The initial Component's ID is `home`; if no home tab exists, all sections with the `home` designation—or, lacking that, all sections except modal tabs—serve as the default tab (exiting the app upon a back action).

### Container
A Container is the full-screen content holder.
It is selected via `div.container[data-container-id="{container id}"]`.
Only the Container with `data-on-top="1"` is displayed within a Component.
A Component can contain multiple Articles.   
The default Container's ID is `root`.

### Article
An Article is the smallest unit of a Page.
It is selected via `article[data-article-id="{article id}"]`.
An Article can be displayed full-screen (within the safe area) or as part of a Container.   
The default Article's ID is `main`.

<br />

## Page Handle
A Page Handle implements the behavior of a Page.
Its associated element is referred to as `host`.
Page Handles are comparable to Activities/Fragments in the Android framework.

### statement
A statement can be either static or instant.
Static pages remain in the DOM after initialization, whereas instant pages are removed when their parent page is released.
Instant pages are extracted from the HTML during Estre UI initialization and appended as elements when a Page is opened.
Once the browser is loaded, the Page's statement should not change; it is determined by the presence (or absence) of the attribute `data-static="1"`.
Even static pages will be removed if their parent Container or Component is instant.
Generally, aside from default screens (such as the home Component or the root Container/main Article), all pages are recommended to be instant.

### intent
Estre UI can pass intent data when opening or displaying a Page.
The intent may include custom data for the Page and specify actions during various lifecycle events.
At present, only a limited set of actions is provided.
It is similar in concept to the intent used in the Android framework.
Furthermore, when an Article is loaded, the contents of `intent.data` can be automatically bound via the element’s `data-bind-*` attributes.

<br />

## Page Handler
> Extends EstrePageHandler or a custom handler class

A Page Handler functions as the controller in the MVC pattern and is invoked at every lifecycle event by the Page Handle.
It provides access to the host DOM and the intent data.

### Basic Elements Accessible in a Handler
- `this.handle` - Accesses the associated page handler.
- `this.intent` - Accesses the intent of the associated page.
- `this.intentData` - Direct access to the data of the page intent.
- `this.provider` - Allows access to common app elements without relying on global JS objects, members, or variables.

<br />

## Handle
> Extends EstreHandle; the class name starts with "Estre" and ends with "Handle"

A Handle is the operational controller for a specified bound.
Estre UI offers built-in Handles and allows the registration of custom Handles prior to initialization.
The associated element is referred to as a `bound`.

<br />

## Handler
> Each implementation’s class name starts with "Estre" and ends with "Handler"

A Handler is an independent, attachable functional controller.
Estre UI will continue to add more built-in Handlers over time.

<br />

# Lifecycle

### onIntentUpdated()*
For instant pages, this is called immediately upon creation or when a bring/show call includes intent data.
It is invoked before `onBring()`, and passes the updated intent (as well as the original unmerged data) to the handler.
In an Article, the Active Struct is called immediately afterward to update data bindings.

> * Though not a lifecycle event per se, this is treated similarly in this Rimwork.

### onBring()
Called when the page host element and Page Handle are created.
This is similar to `onCreate()` in the Android fragment lifecycle.
Since Active Struct processes (such as data binding) run immediately after this function, any changes to the DOM at this point are automatically applied without additional calls.

### onOpen()
Called exactly once when the Page is opened, after the Page Handle and its internal handlers (in the Article) have been initialized.
This mirrors `onViewCreated()` in the Android fragment lifecycle.

### onShow()
Called when a Page is displayed from an initial or hidden state.
This is analogous to `onStart()` in the Android fragment lifecycle.

### onFocus()
Called when a Page gains focus (currently partially implemented).
This is analogous to `onResume()` in the Android fragment lifecycle.

### onReload()*
Triggered by pressing F5; instead of reloading the entire site, only the currently displayed Estre UI Page is reloaded.
Developers may override the onReload event with a custom Page Handler. If the event is handled internally (thus requiring no additional actions), the handler should return true.
(Pressing Ctrl+F5 forces a full browser reload.)

> * While not strictly a lifecycle event, this is treated similarly in this Rimwork.

### onBack()*
Called when a back action is requested (e.g., browser back, Android back button, or iOS swipe back).
Triggered by the window’s popstate event.
If handled internally with no extra or default behavior required, the handler should return true.
> * This event is treated similarly to a lifecycle event in this Rimwork.
> * Note: Forward navigation (pushstate) is not currently implemented.

### onBlur()
Called when a Page loses focus (currently not implemented).
This corresponds to `onPause()` in the Android fragment lifecycle.

### onHide()
Called when a Page is hidden due to a request to hide or close it.
This is analogous to `onStop()` in the Android fragment lifecycle.

### onClose()
Called exactly once when a Page is about to be closed, just before the Page Handle and its internal handlers (in the Article) are released.
This mirrors `onDestroyView()` in the Android fragment lifecycle.

### onRelease()
Called once when the Page Handle is released (destroyed) and its host element is removed.
However, a fully static Page Handle (without an instant statement in its parent) is not removed from the DOM.
This is analogous to `onDestroy()` in the Android fragment lifecycle.

<br />

# Essential methods

It is recommended to use `await` when executing synchronized code.

## Basic dialogs
Basic center popup dialogs  
<br />
### alert(args..) / estreAlert({options..})
Overrides the classic `alert` method by calling `classicAlert()` for standard alerts.

### confirm(args..) / estreConfirm({options..})
Overrides the classic `confirm` method by calling `classicConfirm()` for standard confirmations.
If a second (message) argument is not provided, it falls back to the classic method.

### prompt(args..) / estrePrompt({options..})
Overrides the classic `prompt` method by calling `classicPrompt()` for standard prompts.
If a second (message) argument is missing, it falls back to the classic method.

<br />

## Slide-up Toast dialogs
Similar to Android's Bottom Sheet Dialog.  
It is recommended to use `await` for synchronized execution.

### toastAlert(args..) / estreToastAlert({options..})
Displays a slide-up alert dialog.

### toastConfirm(args..) / estreToastConfirm({options..})
Displays a slide-up confirmation dialog.

### toastPrompt(args..) / estreToastPrompt({options..})
Displays a slide-up prompt dialog.

### toastOption(args..) / estreToastOption({options..})
#### optionToast([selections], ..)
Presents a simple selection list.

### toastSelection(args..) / estreToastSelection({options..})
#### selectionToast([selections], ..)
Displays a checklist dialog and returns the list of selected items upon confirmation.

<br />

## Progress indicators

### wait()
Displays a full-screen infinite loading animation.
It blocks the screen to prevent duplicate requests while notifying the user of ongoing loading.
After calling `wait()`, `go()` must be called to close the animation.

### stedy()
Before displaying a full-screen infinite loading animation, it waits for a specified time (default 0.8 seconds) without showing the animation.
This is used when loading completes within the specified time to avoid unnecessary screen blocking or flicker.
After `stedy()`, `go()` must be called.

### go()
Closes the full-screen infinite loading animation.
If future multi-instance support is added, the instanceOrigin returned by `wait()` or `stedy()` should be passed to `go()`.

### going()
Displays a full-screen gauged loading animation.
The returned object’s current value can be updated to reflect progress.

### arrived()
Closes the full-screen gauged loading animation.
If multi-instance support is added in the future, the instanceOrigin from the object returned by `going()` should be provided.

<br />

## Notification posts

### noti() *not implemented currently
Posts a notification card at the top of the screen.
A slide notification page, similar to those in mobile OS, is planned for future implementation.

### note()
Posts a note card (similar to Android's Toast) at the bottom of the screen.
Notifications are displayed sequentially for the set duration. Excessive durations or rapid requests may delay subsequent notifications, potentially affecting UX.

<br />

## Popup browser

Used to display external web pages within Estre UI via nesting (iframe).
However, due to the iframe-based implementation, cookies are not supported.
If the external page requires cookies, use `window.open()` instead.   

**Note**: `window.open()` is not supported on **PWA** for **iOS** or **Samsung Browser**; use a native app container in those cases.

### popupBrowser(args..) / estrePopupBrowser({options..})
Opens a nested (iframe) popup browser in the overlay section.

### closePopupBrowserWhenOnTop()
Closes the popup browser if it is currently displayed on top.
This method is specifically for use by `WVCA4EUI`.

<br />

*** 

** This project is currently in its initial phase.
More documentation and examples will be added soon. **

***

## Korean

# Estre UI Rimwork (프레임워크와 비슷하나, 하여튼 좀 다름)

이 프로젝트는 [MP Solutions inc.](https://mpsolutions.kr)에서 2024년부터 제공되었습니다.

***

Estre UI Rimwork은 프론트엔드 프레임워크와 유사하지만 여러 면에서 다릅니다.

이 Estre UI Rimwork은 범용(모바일 & PC) 웹 기반 프론트엔드 애플리케이션을 위한 림(러너블 프레임)으로서 작동하도록 개발되었습니다.

- 이 림워크는 jQuery를 기반으로 개발되어 기존 jQuery 사용자의 접근 및 활용에 유리합니다.
- 이 림워크는 다른 프론트엔드 프레임워크(Vue.js 등)와 공존할 수 있습니다. (Article에 bind 가능)
- 이 림워크는 네이티브 모바일 애플리케이션과 유사한 기본 UI 및 라이프사이클(MVC 패턴)을 제공합니다.
- 이 림워크는 앱 프로젝트에 다양한 웹 기반의 자유로운 구현을 그대로 활용하여 개발 수 있게 해 줍니다.
- 이 림워크는 빠른 웹 애플리케이션 개발을 위해 SPA와 PWA의 기본 구현을 제공합니다.

<br />

# 미리보기

본 리포지터리에 포함된 애플리케이션 미리보기 페이지

[예제 웹 앱 1](https://estreui.mpsolutions.kr/App1)


Estre UI 데모를 위한 애플리케이션   
[APT.](https://estreui.mpsolutions.kr/APT)


<br />


# Estre UI를 위한 WebView 컨테이너 애플리케이션용 Flutter 코드베이스

[WVCA4EUI Github](https://github.com/SoliEstre/WebViewContainerApplication-for-EstreUI.js) - https://github.com/SoliEstre/WebViewContainerApplication-for-EstreUI.js

> 저희는 위 레퍼런스 Flutter 프로젝트를 공개했습니다.
> 이는 iOS와 Android에서 통합된 웹 기반 애플리케이션을 네이티브와 유사하게 제공 및 이용 가능하게 하며 각 앱 스토어로의 배포를 용이하고 빠르게 할 수 있도록 제작되었습니다.
> 또한 Estre UI Rimwork의 구현 및 PWA 서비스와의 연동이 구현되어 상호 유기적으로 작동할 수 있도록 최적화되어 있습니다.

<br />


# 문서 인덱스

- [구조](#구조)
- [라이프사이클](#라이프사이클)


<br />


# 구조

## 림워크 최상위 요소 (document.body의 자식들)
- `header#fixedTop` - 앱바 레이어 (안드로이드와 유사)
- `main#splashRoot` - 기본 스플래시 레이어
- `nav#mainMenu` - 메인 메뉴 레이어
- `div#ptr` - 당겨서 새로고침을 표시하는 레이어 (현재 미구현)
- `main#staticDoc` - 고정된 top, bottom 및 메인 메뉴 아래에 위치한 주요 콘텐츠 레이어
- `footer#fixedBottom` - 하단 고정 메뉴 (Windows 작업표시줄과 유사)
- `main#instantDoc` - 페이지 열림 시 스플래시 화면을 제외한 모든 부분을 덮는 오버레이 콘텐츠 레이어
- `nav#managedOverlay` - 필수 애플리케이션 UI를 위한 관리형 오버레이 레이어

<br />


## 섹션 바운드 (루트 페이지 홀더)
- `headerSections`에는 `header#fixedTop`의 컴포넌트 섹션이 들어갑니다.
- `menuSections`에는 `nav#mainMenu`의 컴포넌트 섹션이 들어갑니다.
- `mainSections`에는 `footer#fixedBottom`의 탭 버튼에 매칭되는 `main#staticDoc`의 컴포넌트 섹션이 들어갑니다.
- `blindSections`에는 `main#instantDoc`의 컴포넌트 섹션이 들어갑니다.
- `overlaySections`에는 `nav#managedOverlay`의 컴포넌트 섹션이 들어갑니다.

<br />


## 페이지
페이지는 라이프사이클이 있는 관리 단위(컴포넌트와 유사)이며, `컴포넌트 > 컨테이너 > 아티클`의 세 단계로 구성됩니다.
페이지는 pageManager(EstreUiPageManager 객체)에 의해 관리(열기 및 닫기)됩니다.

각 페이지는 Estre UI 초기화 시 고유한 PID(페이지 ID)를 가집니다.
포맷은 `${statement}&{sectionBound}={컴포넌트 id}#{컨테이너 id}@{아티클 id}`입니다.
PID는 페이지를 열고 닫을 때 사용됩니다.
Estre UI 초기화 후 `pageManager.pages`에서 가져온 페이지들을 확인할 수 있습니다.

### 컴포넌트
컴포넌트는 페이지 구조의 최상위입니다.
셀렉터 `section#{컴포넌트 id}`로 지정됩니다.
하나의 컴포넌트에는 여러 컨테이너를 포함할 수 있습니다.   
초기 컴포넌트의 ID는 `home`이며, 홈 탭이 없는 경우 `home`클래스를 갖는 모든 섹션 혹은 이도 없는 경우 모달 탭을 제외한 모든 섹션이 기본 탭(뒤로 가기 버튼을 누르면 앱 종료)으로 사용됩니다.

### 컨테이너
컨테이너는 전체 화면 콘텐츠를 담는 영역입니다.
셀렉터 `div.container[data-container-id="{컨테이너 id}"]`로 지정됩니다.
`data-on-top="1"`이 지정된 컨테이너만 컴포넌트 내에서 표시됩니다.
하나의 컴포넌트는 여러 아티클을 가질 수 있습니다.   
기본 컨테이너의 ID는 `root`입니다.

### 아티클
아티클은 페이지의 최소 단위입니다.
셀렉터 `article[data-article-id="{아티클 id}"]`로 지정됩니다.
아티클은 안전 영역 내 전체 화면으로 표시되거나 컨테이너의 일부로 표시될 수 있습니다.   
기본 아티클의 ID는 `main`입니다.

<br />


## 페이지 핸들

페이지 핸들은 페이지 동작을 구현합니다.
관련 엘리먼트는 `"host"`라고 부릅니다. (페이지 핸들러에서 `handle.host` 또는 `handle.$host`로 접근)
페이지 핸들은 안드로이드의 액티비티 또는 프래그먼트와 유사합니다.

### statement
statement는 `static`(정적)이거나 `instant`(인스턴트)일 수 있습니다.
Estre UI 초기화 시 정적 페이지는 DOM에서 제거되지 않는 반면, 인스턴트 페이지는 DOM에서 제거됩니다.
인스턴트 페이지는 HTML코드가 Doctre.js의 HFNL로 추출되어 Estre UI 초기화 시 DOM에서 제거된 후 페이지가 열릴 때 엘리먼트로 생성되어 추가됩니다.
페이지의 statement는 브라우저 로드 후 변경되지 않아야 하며, 엘리먼트 속성 `data-static="1"`의 존재 유무에 따라 결정됩니다.
static 페이지이더라도 상위 페이지인 컨테이너나 컴포넌트가 instant인 경우 해당 페이지가 닫힐 경우 같이 DOM에서 제거됩니다.
일반적으로 home 컴포넌트나 컴포넌트나 컨테이너의 root 컨테이너 및 main 아티클 같은 기본 화면에 해당하는 페이지를 제외하고 모든 페이지는 인스턴트로 사용을 권장합니다.

### intent
Estre UI는 페이지를 열거나 표시할 때 intent 데이터를 전달할 수 있습니다.
intent는 열리는 페이지에 대한 커스텀 데이터를 포함할 수 있으며,
다양한 라이프사이클 이벤트에서의 동작을 지정할 수 있습니다.
현재는 일부 동작만 제공됩니다.
intent는 안드로이드 프레임워크의 intent와 유사합니다.
Article 로드 시 엘리먼트의 `data-bind-*` 속성을 통해 `intent.data` 내의 내용을 기반으로 자동 삽입되도록 이용 가능합니다.

<br />


## 페이지 핸들러
> EstrePageHandler을 확장 또는 임의 클래스에 커스텀으로 페이지 핸들러 함수 작성

페이지 핸들러는 MVC 패턴에서의 컨트롤러 역할을 하며, 페이지 핸들에 의해 각 라이프사이클 이벤트 시 호출됩니다.
이를 통해 호스트 DOM 및 intent 데이터에 접근할 수 있습니다.

### 핸들러 내 접근 가능한 기본 요소
- `this.handle` - 연결된 페이지 핸들에 접근합니다.
- `this.intent` - 연결된 페이지의 인텐트에 접근합니다.
- `this.intentData` - 연결된 페이지 인텐트의 데이터에 바로 접근합니다.
- `this.provider` - 핸들러에서 JS 최상위 객체/멤버/변수에 의존하지 않고 앱 공통 요소에 접근할 수있도록 연결해주는 프로바이더에 접근합니다.

<br />


## 핸들
> EstreHandle을 확장하며, 클래스 이름은 `Estre`로 시작하고 `Handle`로 끝남

핸들은 특정 바운드를 위한 운영 컨트롤러입니다.
Estre UI는 기본 핸들을 제공하며, 초기화 전에 커스텀 핸들을 등록할 수 있습니다.
연결된 엘리먼트는 `bound`라고 부릅니다. (핸들 내에서 `this.host` 또는 `this.$host`로 접근)

<br />


## 핸들러
> 정해진 형식이 없으며, 각 구현체의 클래스 이름은 `Estre`로 시작하고 `Handler`로 끝남

핸들러는 독립적이고 부착 가능한 기능 컨트롤러입니다.
Estre UI는 지속적으로 기본 핸들러를 추가해 나갈 예정입니다.

<br />


# 라이프사이클

### onIntentUpdated()*
인스턴트 페이지의 경우 생성 직후, 혹은 bring/show 호출에 intent가 포함된 경우 각각 호출됩니다.
onBring보다 먼저 호출되며, 위와 같은 추가 전달 시 handle에 intent가 업데이트된 상태로 호출되고 병합 전의 추가 전달된 내용 원본도 함수 호출 시 전달됩니다.
Article에서는 직후 Active Struct가 호출되어 데이터 바인드가 업데이트 됩니다.

> * 이는 라이프사이클 이벤트와는 다르지만, 이 림워크에서는 유사하게 취급합니다.

### onBring()
페이지 호스트 요소와 페이지 핸들 생성 시 호출됩니다.
이는 안드로이드 프래그먼트 라이프사이클의 `onCreate()`와 유사합니다.
데이터 바인드 등의 Active Struct 처리가 함수 종료 직후 추가 실행되므로 이 시점에 DOM을 변경/추가 하는 경우 데이터 바인드 등의 Active Struct 적용이 별도 호출 없이 적용됩니다.

### onOpen()
페이지 핸들과 아티클 내의 핸들들이 초기화된 후 페이지가 열린 순간 단 한 번 호출됩니다.
이는 안드로이드 프래그먼트 라이프사이클의 `onViewCreated()`와 유사합니다.

### onShow()
페이지가 초기 또는 숨김 상태에서 표시될 때 호출됩니다.
이는 안드로이드 프래그먼트 라이프사이클의 `onStart()`와 유사합니다.

### onFocus()
페이지가 포커스를 얻을 때 호출됩니다. (현재 미구현 *일부 구현)
이는 안드로이드 프래그먼트 라이프사이클의 `onResume()`과 유사합니다.

### onReload()*
F5 키를 눌러 전체 사이트를 새로고침하는 대신 현재 표시된 Estre UI 페이지를 새로고침합니다.
개발자는 커스텀 페이지 핸들러를 통해 `onReload` 이벤트를 재정의할 수 있으며, Ctrl+F5는 이를 무시하고 브라우저 전체 새로고침을 수행합니다.
해당 핸들러에서 자체 처리하여 별도의 추가/기본 작동이 필요 없는 경우 `true`를 리턴해야 합니다.

> * 이는 라이프사이클 이벤트와는 다르지만, 이 림워크에서는 유사하게 취급합니다.

### onBack()*
뒤로 가기 액션이 요청될 때 호출됩니다 (예: 브라우저 뒤로가기, 안드로이드 뒤로가기 버튼, iOS 스와이프 백).
윈도우의 popstate 이벤트에 의해 트리거됩니다.
해당 핸들러에서 자체 처리하여 별도의 추가/기본 작동이 필요 없는 경우 `true`를 리턴해야 합니다.

> * 이는 라이프사이클 이벤트와는 다르지만, 이 림워크에서는 유사하게 취급합니다.

### onBlur()
페이지가 포커스를 잃을 때 호출됩니다. (현재 미구현)
이는 안드로이드 프래그먼트 라이프사이클의 `onPause()`와 유사합니다.

### onHide()
페이지가 숨겨지거나 닫히는 요청에 의해 화면에서 사라질 때 호출됩니다.
이는 안드로이드 프래그먼트 라이프사이클의 `onStop()`와 유사합니다.

### onClose()
페이지 핸들과 아티클 내의 핸들이 해제(파괴)되기 직전에 페이지가 닫힐 때 단 한 번 호출됩니다.
이는 안드로이드 프래그먼트 라이프사이클의 `onDestroyView()`와 유사합니다.

### onRelease()
페이지 핸들이 해제(파괴)되고 호스트 요소가 제거될 때 단 한 번 호출됩니다.
단, 완전히 정적인 페이지 핸들(상위에 인스턴트 statement가 없는 경우)은 DOM에서 제거되지 않습니다.
이는 안드로이드 프래그먼트 라이프사이클의 `onDestroy()`와 유사합니다.

<br />


# 기본 메서드
공통적으로 동기화된 코드 실행이 필요한 경우를 위해 `await` 사용을 권장합니다.

## 기본 대화상자
기본 중앙 팝업 대화상자  
<br />

### alert(args..) / estreAlert({options..})
기본 `alert`는 `classicAlert()`로 호출할 수 있도록 재정의됩니다.
비동기 함수이나 구분을 위한 판단 요소가 없어 기존 함수의 대체 실행은 되지 않으므로 주의바랍니다.

### confirm(args..) / estreConfirm({options..})
기본 `confirm`는 `classicConfirm()`로 호출할 수 있도록 재정의됩니다.
비동기 함수이므로 호환성을 위해 두 번째(메시지) 인자가 제공되지 않으면 기존 메서드로 대체 실행합니다.

### prompt(args..) / estrePrompt({options..})
기본 `prompt`는 `classicPrompt()`로 호출할 수 있도록 재정의됩니다.
비동기 함수이므로 호환성을 위해 세 번째(메시지) 인자가 제공되지 않으면 기존 메서드로 대체 실행합니다.

<br />


## 슬라이드 업 토스트 대화상자
안드로이드의 바텀 시트 다이얼로그와 유사합니다.  
동기화된 코드 실행을 위해 `await` 사용을 권장합니다.

### toastAlert(args..) / estreToastAlert({options..})
슬라이드 업 알림 대화상자를 표시합니다.

### toastConfirm(args..) / estreToastConfirm({options..})
슬라이드 업 확인 대화상자를 표시합니다.

### toastPrompt(args..) / estreToastPrompt({options..})
슬라이드 업 프롬프트 대화상자를 표시합니다.

### toastOption(args..) / estreToastOption({options..})
#### optionToast([selections], ..)
간단한 선택 목록을 제시합니다.

### toastSelection(args..) / estreToastSelection({options..})
#### selectionToast([selections], ..)
체크리스트 대화상자를 표시하며, 확인 시 선택된 항목들의 목록을 반환합니다.

<br />


## 진행 표시기

### wait()
전체 화면 무한 로딩 애니메이션을 표시합니다.   
화면을 차단하여 중복 요청 호출 등을 방지하고 로딩중임을 사용자에게 알리기 위해 사용합니다.   
`wait()` 호출 후에는 반드시 `go()`를 호출하여야 합니다.

### stedy()
전체 화면 무한 로딩 애니메이션을 표시하기 전에 주어진 시간(기본 0.8초)만큼 표시하지 않고 대기합니다.   
일반적으로 로딩이 해당 지정 시간 내에 이루어져 화면 차단이 불필요한 경우 및 화면 차단 출력으로 인한 화면 깜빡임을 방지하고자 하는 경우 사용합니다.   
`wait()`과 마찬가지로 호출 후에는 반드시 `go()`를 호출하여야 합니다.

### go()
전체 화면 무한 로딩 애니메이션을 종료합니다.   
현재는 페이지의 멀티 인스턴스가 지원되지 않아 문제가 되지 않으나, 추후 지원될 경우 모든 `onRunning` 레이어(페이지)를 닫게 되므로 호출 시 반드시 해당하는 `wait()`이나 `stedy()`의 리턴 값인 `instanceOrigin`을 전달해야 합니다.

### going()
전체 화면 게이지형 로딩 애니메이션을 표시합니다.
리턴받은 객체의 `current`값을 수정하여 진행 게이지를 업데이트 할 수 있습니다.

### arrived()
전체 화면 게이지형 로딩 애니메이션을 종료합니다.
현재는 페이지의 멀티 인스턴스가 지원되지 않아 문제가 되지 않으나, 추후 지원될 경우 모든 `onProgress` 레이어(페이지)를 닫게 되므로 호출 시 반드시 해당하는 `going()`의 리턴 객체의 `instanceOrigin`값을 전달해야 합니다.

<br />


## 알림 게시

### noti() *현재 미구현
화면 상단에 알림 카드를 게시합니다.
향후 모바일 OS와 유사한 상단 슬라이드 알림 페이지가 추가될 예정입니다.

### note()
화면 하단에 안드로이드의 토스트와 유사한 노트 카드를 게시합니다.
요청된 내용들은 각 설정 시간 동안 출력된 후 다음 요청된 내용으로 순차 출력됩니다.
너무 많은 지속시간 설정 또는 요청을 호출하는 경우 이후 호출 내용의 출력이 시점이 밀리게 되어 UX에 문제가 되므로 남발되지 않도록 해야 합니다.

<br />


## 팝업 브라우저

Estre UI 내에서 외부 웹 페이지를 중첩(iframe)하여 표시할 때 사용됩니다.
그러나 iframe 기반 구현으로 인해 쿠키를 지원하지 않습니다.
외부 페이지가 쿠키를 요구하는 경우, `window.open()`을 사용하시기 바랍니다.   

**참고**: `window.open()`은 **iOS** 및 **Samsung Browser**의 **PWA**에서 지원되지 않으므로, 해당 경우 네이티브 앱 컨테이너를 사용하세요.

### popupBrowser(args..) / estrePopupBrowser({options..})
오버레이 섹션에 중첩(iframe) 팝업 브라우저를 엽니다.

### closePopupBrowserWhenOnTop()
현재 팝업 브라우저가 맨 위에 표시되어 있다면 이를 종료합니다.
이 메서드는 **WVCA4EUI**(플러터 웹뷰 컨테이너)에서의 호출 전용입니다.

<br />

***

** 이 프로젝트는 현재 초기 단계입니다.
추가 문서와 예제가 곧 추가될 예정입니다. **

***