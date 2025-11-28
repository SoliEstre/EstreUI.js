# EstreUI.js

EstreUI is a "Rimwork" (Runnable Frame) designed to bridge the gap between classic web development and modern native-like web applications. It provides a structured, mobile-first environment for developers familiar with jQuery, ASP, PHP, or JSP, as well as native app developers looking to transition to the web.

[한국어 문서 (Korean Documentation)](#estre-ui-rimwork-korean)

---

## Introduction

### Concept: Rimwork
EstreUI is not just a library, nor a full-blown framework in the traditional sense. It is a **Rimwork**—a "Runnable Frame" that provides the essential rim (structure) and lifecycle management for your application, allowing you to fill in the content with your preferred tools (like jQuery).

### Target Audience
*   **Classic Web Developers**: If you are comfortable with jQuery, ASP, PHP, or JSP but want to build modern, single-page applications (SPA) with mobile-app-like experiences, EstreUI is for you.
*   **Native App Developers**: If you are moving from Android or iOS development to the web, you will find EstreUI's lifecycle events (`onCreate`, `onShow`, `onPause` equivalent) and intent system very familiar.

### Key Features
*   **MVC Pattern**: Structured separation of concerns.
*   **Lifecycle Management**: Native-like page lifecycle (`onBring`, `onShow`, `onHide`, etc.).
*   **Native-like UI**: Smooth transitions, semi-stack-based navigation, and mobile-optimized touch interactions.
*   **jQuery 4.0 Support**: Fully compatible with the latest jQuery. Can also be used with lighter alternatives like Cash (experimental).
*   **Hybrid App Ready**: Designed to work seamlessly with **WVCA4EUI** (Flutter-based wrapper) for deploying to Google Play and App Store.
*   **PWA Support**: Ready for Progressive Web App deployment, including Windows Store support (requires SSL).

### System Requirements
*   **Browsers**: Chromium 92+, Safari 15+ (iOS 15+).
*   **Recommendation**: **iOS 16+** is strongly recommended due to severe CSS limitations in iOS 15.

---

## Getting Started

### Installation & Update
EstreUI is typically installed by cloning the repository or forking it.
To update, you can pull from the upstream repository.

You can also start with an example web app that includes a basic implementation:

[Example Web App 1 (preview)](https://estreui.mpsolutions.kr/App1)
/ [(Github)](https://github.com/SoliEstre/EstreUI.js-sample-app1)

Estre UI Demo Application

[APT. (preview)](https://estreui.mpsolutions.kr/APT)
/ [(Github)](https://github.com/Esterkxz/APT-EstreUI.js-demo)

#### File Structure
*   `serviceLoader.html`: Service Worker Loader (handles updates before app launch).
*   `scripts/`: Core libraries and logic.
    *   `estreUi.js`: Main framework code.
    *   `estreU0EE0Z.js`: Estre Common library.
    *   `main.js`: Application entry point and configuration.
*   `styles/`: CSS files for the framework and your app.
*   `index.html`: The main entry point (The "Rim").
*   `fixedTop.html`, `fixedBottom.html`, `mainMenu.html`, `staticDoc.html`, `instantDoc.html`, `managedOverlay.html`: Exported sections for layout.

### Core Libraries
*   **JCODD**: A JSON-alternative format and utility library for robust data handling.
*   **Doctre.js**: DOM manipulation and document management helper.
*   **Modernism.js**: Polyfills and support for modern JavaScript features.
*   **Alienise.js**: Bridge for communication between heterogeneous systems (e.g., Web <-> Native).
*   **estreU0EE0Z.js**: Common utilities and base classes for EstreUI.

### Initial Customization Guide
When starting a new project, you should customize the following:
1.  **Metadata**: Update `<title>`, `<meta name="description">`, and Open Graph (OG) tags in `index.html`.
2.  **Icons & Manifest**: Replace `favicon.ico`, app icons in `images/` and `/vectors/`, and update `webmanifest.json`.
3.  **Layout**: Modify `fixedTop.html` for your header and `mainMenu.html` for navigation.
4.  **Theme**: Update `styles/main.css` to match your brand colors.
5.  **Main Script**: Update `scripts/main.js`.
6.  **PWA**: Configure the service worker loader in `serviceLoader.html` (update messages and colors). Update `serviceWorker.js` to include your app's files and version.

---

## Core Concepts

### Page System

#### Section Blocks (Layers)
EstreUI divides content layer areas as follows.
Items below cover items above:

*   **MainSections(StaticDoc)**: UI area paired with top/bottom fixed UI. PID starts with `&m`.
*   **FooterSections(FixedBottom)**: Bottom fixed rootbar UI area. PID starts with `&f`. (Currently unused)
*   **MenuSections(MainMenu)**: Left/Right sliding drawer menu area. PID starts with `&u`.
*   **HeaderSections(FixedTop)**: Top fixed appbar UI area. PID starts with `&h`.
*   **BlindedSections(InstantDoc)**: UI page area covering fixed UI. PID starts with `&b`.
*   **OverlaySections(ManagedOverlay)**: Topmost overlay area. PID starts with `&o`.

#### Page Composition
EstreUI organizes content hierarchically:
*   **Component(section)**: Top-level page. A functional grouping of pages in the application configuration. In staticDoc, it matches the tabs in fixedBottom. The default component for staticDoc has the id `home`. PID starts with the `=` prefix.
*   **Container**: Container page. Represents a major feature area of the screen. The default container has the id `root`. PID starts with the `#` prefix.
*   **Article**: Actual page content. Represents content at the screen or element level. The default article has the id `main`. PID starts with the `@` prefix.
    *   **Multi-Article Support**: You can display multiple articles simultaneously (e.g., split-screen for tablets), though this has some layout limitations.

#### Page Types
EstreUI classifies pages as follows:
*   **Static**: Static page. Elements are not deleted and remain after registration during Estre UI initialization. Cannot be closed with closePage(). PID starts with `$s`. (Can be omitted when calling)
*   **Instant**: Instant page. Elements are deleted after registration during Estre UI initialization and loaded when bringPage() is called separately. Can be closed with closePage(). PID starts with `$i`. (Can be omitted when calling)
    *   **Multi instance**: Can display the same page implementation with different content simultaneously. PID includes an instance origin id prefixed with `^` at the end. (** Currently unimplemented.)

### PID (Page ID)
Navigation is handled via PIDs, similar to deep links or routes.
*   Format: `$s&m=component#container#article` or defined aliases.
*   Example: `customPageManager.bringPage("dashboard")` or `pageManager.bringPage("*dashboard")` or `pageManager.bringPage("&b=main#dashboard")`.
*   You can check the list of registered PIDs via `pageManager.pages`.

### Lifecycle
EstreUI pages have a distinct lifecycle, similar to Android Activities:
1.  **onBring**: Page is being prepared. Since the Active Struct hasn't been called yet, this is a good place for element creation tasks involving handles.
2.  **onOpen**: Page is opening (transition start). Called only once.
3.  **onShow**: Page is fully visible.
4.  **onHide**: Page is hidden (covered by another page or closed).
5.  **onClose**: Page is closed. Called only once.
6.  **onRelease**: Page resources are released.

*   **onBack**: Called when back navigation is triggered. Return `true` to cancel the default action.
*   **onReload**: Called when page reload is triggered. Return `true` to cancel the default action (which is closing and reopening the page).

*   **onIntentUpdated**: Called when the page receives new data (Intent) while already active.
*   **onApplied**: Executed after `apply()` is called for data binding.

### Page Handle & Page Handler
*   **Handle**: The DOM element or UI controller. In `handler`, use `handle` for lifecycle methods, otherwise `this.handle`.
*   **Handler**: The logic class (`EstrePageHandler`) managing the page. Accessed via `handle.handler`.
*   Use `handle.component`, `handle.container` to access parent handles.
*   Use `component.containers`, `container.articles` to access child handles.
*   For other access, use `estreUi.mainSections`, `blindedSections` to access handles in other sections. Refer to the source code for details.
*   You can access the page handle from any element object via `element.pageHandle`.
*   **Tip**: In browser developer tools, select a component/container/article element and type `$0.pageHandle` in the console to access it.

### Data Binding & Intent
*   **Intent**: A data object passed between pages. Accessed via `handle.intent` or `handler.intent`.
*   **Intent Data**: Accessed via `handle.intent.data` or `handler.intentData`.
*   **Intent Action**: You can define actions to be performed at specific lifecycle points. Refer to the source code for details.
    *   *Timing*: For `onBring`, `onOpen`, `onShow`, actions are performed *after* the callback. For `onHide`, `onClose`, `onRelease`, they are performed *before* the callback.
*   **Active Struct**: A comprehensive system for binding intent data and initializing dynamic elements. It handles `data-bind-*` attributes, `local-style`, `solid-point`, `handles`, and `passive-links`. It is executed during initialization (specifically around `onBring`) and automatically whenever `intentData` is modified. **It can also be executed manually if needed.**
*   **Apply**: When applying multiple changes at once, use `handle.apply(data)` to prevent `applyActiveStruce()` from running for each change. It executes once after all changes are complete, preventing overhead.

### Handle (Extending EstreHandle Class)
*   Handles are for reusable components within an Article page.
*   Handles matching the UIS (UI specifier) in the HTML structure are initialized after onBring.

#### Built-in Handles
*   Includes `EstreUnifiedCalendarHandle`, `EstreDedicatedCalanderHandle`, etc. Refer to the default registered classes in the `EstreHandle` class in `estreUi.js`.

#### Custom Handles
*   You can register and use your own handles before Estre UI initialization. Refer to the implementation of the `EstreHandle` class in `estreUi.js`.

### Handler (Direct Class Implementation)
*   Reusable implementations that perform specific actions as needed are called handlers.
*   Mainly initialized and used during page start callbacks.

#### Built-in Handlers
*   Includes `EstreSwipeHandler`, `EstreDraggableHandler`, etc. Refer to the default registered classes under the `// handlers` comment in `estreUi.js`.

#### Custom Handlers
*   There is no specific format for handler implementation, so feel free to implement them as needed.

### Exported Sections
Parts of the layout like the header (`fixedTop`) or static content (`staticDoc`) are loaded from separate HTML files to keep `index.html` clean.

Content written directly in `index.html` will be placed after the content of each file.

If needed (e.g., for local execution), you can remove `data-exported="1"` or the attribute entirely to write directly in `index.html` without AJAX loading.

---

## UI/UX & Utilities

### UI Modes
*   **Scroll Modes**:
    *   `vfv_scroll`: Scroll with inset added for `fixedTop` and `fixedBottom`.
    *   `sv_scroll`: Standard scroll without inset.
    *   `txv_scroll`, `bxv_scroll`: Scroll with only top or bottom inset added.
*   **Article Modes**:
    *   `fwvs`: Full Width Vertical Scroll.
    *   `limit_on_screen`: Limits page width to mobile levels.
        *   `fixed_height`, `full_height`, `max_height`: Height limit modes. Refer to `estreUiCore2.css`.

### Layout Utilities
*   **Flex Presets**: `line_block` (row), `inline_block`, `lines_block` (column).
*   **Inset Utilities**: `inset_on_margin`, `inset_on_padding`, `inset_on_gap` for consistent spacing.

### Dialog Replacements
Native browser alerts are blocking and ugly. EstreUI provides non-blocking alternatives:
*   `estreAlert(message)`: Replaces default `alert`.
*   `estreConfirm(message, callback)`: Replaces default `confirm`.
*   `estrePrompt(message, callback)`: Replaces default `prompt`.
*   *Legacy calls*: You can still use `classicAlert` if absolutely necessary.
*   `estreToast*`: Bottom-sheet style dialogs. Provides the same interface as alert/confirm/prompt and supports custom dialogs. Refer to source code.
*   `note(message)`: Android Toast-like message output.
*   `wait()`, `go()`, `stedy()`: Show/hide global loading indicators.

### Storage System
*   **Async Storage**: Prototype implementation for asynchronous storage matching Local/Session Storage.
*   **Native Storage**: Uses native app storage when running in **WVCA4EUI**.
*   **Account/Device Storage**: Backend-synced data (account/device specific). Requires custom API implementation to link with async storage.
*   **Codded Storage**: Storage implementation that automatically handles JCODD serialization/deserialization.

### Global Alias Objects
*   `uis`: Collection of UI specifier aliases.
*   `eds`: Collection of Element dataset name aliases.

### Local Style
EstreUI supports scoped styling within **Article** page elements using the `<local-style>` tag. This feature is processed as part of the Active Struct system.
*   **Usage**: Place a `<local-style>` tag inside a page element.
*   **Path Replacement**: Use `##` within the style content to represent the path to the current element. This allows you to write styles that are scoped to that specific element hierarchy.
*   **Mechanism**: The framework automatically converts `<local-style>` into a standard `<style>` tag, replacing `##` with the actual CSS selector path to the element.

---

## Development Cautions

### iOS Memory Limits
*   **Issue**: iOS 15+ (especially 15) has strict memory limits for web apps. Large CSS files can cause the app to crash or fail to load.
*   **Solution**:
    *   Separate critical CSS for the splash screen.
    *   Load the rest of the CSS (including heavy fonts) using **Lazy Loading** (`<meta link="lazy" ...>`).
    *   Use `defer` for script loading.
    *   Implement HTML in exported section files (like `staticDoc.html`).

---

## Usage Examples

### Mango Class (App developed with Estre UI as live code)
Demonstrates a full-featured education app with complex data binding, multiple page containers, and dynamic content.
*   **Key Pattern**: Extensive use of `AppPagesProvider` to map PIDs to specific handlers.
*   Application link: [Mango Class](https://class.mangoedu.co.kr)

### GMDG (Utility App)
A Braille viewer utility.
*   **Key Pattern**: File processing and simple UI structure. Shows how to handle file inputs and process data locally.
*   Application link: [GMDG](https://gmdg.nm3.kr)
*   Github repository: [https://github.com/Esterkxz/GMDG](https://github.com/Esterkxz/GMDG)

### Common Patterns
*   **index.html**: The skeleton.
*   **AppPagesProvider**: The router configuration.
*   **EstrePageHandler**: The controller for each page.

---

## Migration Guide

### Classic Web (ASP/PHP/JSP) -> EstreUI
*   **SSR Hybrid**: You can still use Server-Side Rendering for the initial load (`staticDoc`), but since it loads only once at first run, you must handle page content and navigation via AJAX/Fetch to maintain the SPA experience.
*   **AJAX**: Replace form submissions and page reloads with `fetch` calls and EstreUI's page transitions.

### Native App -> EstreUI
*   **WVCA4EUI**: Use this Flutter-based wrapper to package your EstreUI app for app stores.
    *   **Features**: Provides a bridge for native features, handles PWA caching, and manages the webview lifecycle.
    *   **Bridge Handler**: Allows JavaScript to call Flutter code and vice-versa.

---

# Estre UI Rimwork (Korean)

EstreUI는 클래식 웹 개발과 현대적인 네이티브 스타일 웹 애플리케이션 간의 격차를 해소하기 위해 설계된 "Rimwork" (Runnable Frame)입니다. jQuery, ASP, PHP, JSP에 익숙한 개발자뿐만 아니라 웹으로 전환하려는 네이티브 앱 개발자에게 구조화된 모바일 우선 환경을 제공합니다.

---

## 소개 (Introduction)

### 개념: Rimwork
EstreUI는 단순한 라이브러리도, 전통적인 의미의 완전한 프레임워크도 아닙니다. 이는 애플리케이션의 필수적인 **Rim**(구조)과 라이프사이클 관리를 제공하는 **Rimwork**(실행 가능한 프레임)로, 그 안의 내용은 여러분이 선호하는 도구(예: jQuery)로 채울 수 있습니다.

### 타겟 독자
*   **클래식 웹 개발자**: jQuery, ASP, PHP, JSP에 익숙하지만 모바일 앱과 같은 경험을 제공하는 현대적인 SPA(Single Page Application)를 구축하고 싶은 분.
*   **네이티브 앱 개발자**: Android나 iOS 개발에서 웹으로 전환하려는 분들에게 EstreUI의 라이프사이클 이벤트(`onCreate`, `onShow`, `onPause` 등과 유사)와 인텐트 시스템은 매우 친숙할 것입니다.

### 주요 특징
*   **MVC 패턴**: 관심사의 구조적 분리.
*   **라이프사이클 관리**: 네이티브 앱과 유사한 페이지 라이프사이클 (`onBring`, `onShow`, `onHide` 등).
*   **네이티브 스타일 UI**: 부드러운 전환, 세미 스택(Semi-Stack) 기반 네비게이션, 모바일에 최적화된 터치 인터랙션.
*   **jQuery 4.0 지원**: 최신 jQuery와 완벽 호환됩니다. 더 가벼운 대안인 Cash와도 함께 사용할 수 있습니다(실험적).
*   **하이브리드 앱 지원**: Flutter 기반의 **WVCA4EUI** 래퍼와 연동하여 Google Play 및 App Store에 배포할 수 있도록 설계되었습니다.
*   **PWA 지원**: Windows Store 등록을 포함한 프로그레시브 웹 앱 배포를 지원합니다(SSL 필수).

### 시스템 요구사항
*   **브라우저**: Chromium 92+, Safari 15+ (iOS 15+).
*   **권장 사항**: iOS 15의 CSS 제한으로 인해 **iOS 16 이상**을 강력히 권장합니다.

---

## 시작하기 (Getting Started)

### 설치 및 업데이트
EstreUI는 일반적으로 리포지토리를 복제(clone)하거나 포크(fork)하여 설치합니다.
업데이트를 위해서는 업스트림(upstream) 리포지토리에서 풀(pull)을 수행할 수 있습니다.

아래 기초 구현이 포함된 예제를 기반으로 사용할 수도 있습니다.

[예제 웹 앱 1 (preview)](https://estreui.mpsolutions.kr/App1)
/ [(Github)](https://github.com/SoliEstre/EstreUI.js-sample-app1)

Estre UI 데모 애플리케이션

[APT. (preview)](https://estreui.mpsolutions.kr/APT)
/ [(Github)](https://github.com/Esterkxz/APT-EstreUI.js-demo)

#### 파일 구조
*   `serviceLoader.html`: 서비스 워커 로더 (앱 실행 전 업데이트 진행).
*   `scripts/`: 핵심 라이브러리 및 로직.
    *   `estreUi.js`: 메인 프레임워크 코드.
    *   `estreU0EE0Z.js`: Estre Common 라이브러리.
    *   `main.js`: 애플리케이션 진입점 및 설정.
*   `styles/`: 프레임워크 및 앱을 위한 CSS 파일.
*   `index.html`: 메인 진입점 ("Rim").
*   `fixedTop.html`, `fixedBottom.html`, `mainMenu.html`, `staticDoc.html`, `instantDoc.html`, `managedOverlay.html`: 레이아웃을 위한 내보내진 섹션들.

### 핵심 라이브러리
*   **JCODD**: 강력한 데이터 처리를 위한 JSON 대체 포맷 및 유틸리티 라이브러리.
*   **Doctre.js**: DOM 조작 및 문서 관리 헬퍼.
*   **Modernism.js**: 최신 자바스크립트 기능 폴리필 및 지원.
*   **Alienise.js**: 이질적인 시스템 간(예: Web <-> Native)의 통신을 위한 브릿지.
*   **estreU0EE0Z.js**: EstreUI를 위한 공통 유틸리티 및 기본 클래스.

### 초기 커스텀 가이드
새 프로젝트를 시작할 때 다음 사항들을 커스터마이징해야 합니다:
1.  **메타데이터**: `index.html`의 `<title>`, `<meta name="description">`, Open Graph (OG) 태그 업데이트.
2.  **아이콘 및 매니페스트**: `favicon.ico`, `images/` 및 `/vectors/` 폴더의 앱 아이콘 교체 및 `webmanifest.json` 업데이트.
3.  **레이아웃**: 헤더를 위한 `fixedTop.html`과 네비게이션을 위한 `mainMenu.html` 수정.
4.  **테마**: 브랜드 컬러에 맞춰 `styles/main.css` 수정.
5.  **메인 스크립트**: `scripts/main.js` 수정.
6.  **PWA**: `serviceLoader.html`에서 서비스 워커 로더 설정(메시지 및 색상) 업데이트 및 `serviceWorker.js`의 구성 파일 목록 및 버전 수정.

---

## 핵심 개념 (Core Concepts)

### 페이지 시스템

#### 섹션 블록(레이어) 구성
EstreUI는 콘텐츠 레이어 영역이 다음과 같이 나뉩니다.
아래에 있는 항목이 위에 있는 항목을 덮습니다:

*   **MainSections(StaticDoc)**: 상/하단 고정 UI와 세트되는 UI 영역. PID가 `&m`으로 시작됩니다.
*   **FooterSections(FixedBottom)**: 하단 고정 rootbar UI 영역. PID가 `&f`으로 시작됩니다. (현재는 사용되지 않음)
*   **MenuSections(MainMenu)**: 좌/우측 슬라이딩 드로어 메뉴 영역. PID가 `&u`으로 시작됩니다.
*   **HeaderSections(FixedTop)**: 상단 고정 appbar UI 영역. PID가 `&h`으로 시작됩니다.
*   **BlindedSections(InstantDoc)**: 고정 UI를 덮는 UI 페이지 영역. PID가 `&b`으로 시작됩니다.
*   **OverlaySections(ManagedOverlay)**: 최상단 오버레이 영역. PID가 `&o`으로 시작됩니다.

#### 페이지 구성
EstreUI는 콘텐츠를 계층적으로 구성합니다:
*   **Component(section)**: 최상위 페이지. 애플리케이션 구성 상 기능적으로 분리된 페이지 묶음 단위. staticDoc의 경우 fixedBottom의 탭과 매칭. staticDoc의 기본 컴포넌트는 `home` id를 가짐. PID에서 `=`프리픽스로 시작합니다.
*   **Container**: 컨테이너 페이지. 주로 화면 단위의 주요 기능 영역을 나타내며, 기본 컨테이너는 `root` id를 가짐. PID에서 `#`프리픽스로 시작합니다.
*   **Article**: 실제 페이지 콘텐츠. 주로 화면 또는 요소 단위의 컨텐츠를 나타내며, 기본 아티클은 `main` id를 가짐. PID에서 `@`프리픽스로 시작합니다.
    *   **다중 아티클 지원**: 태블릿의 분할 화면처럼 여러 아티클을 동시에 표시할 수 있으나, 레이아웃에 일부 제한이 있습니다. 

#### 페이지 유형
EstreUI는 페이지를 다음과 같이 구분합니다:
*   **Static**: 정적 페이지. Estre UI 초기화 중 페이지 등록 시 요소가 삭제되지 않고 유지되며, closePage()로 닫을 수 없습니다. PID가 `$s`로 시작합니다. (호출 시 생략 가능)
*   **Instant**: 인스턴트 페이지. Estre UI 초기화 중 페이지 등록 후 요소가 삭제되며, 별도로 bringPage()호출을 할 때 로드됩니다. closePage()로 닫을 수 있습니다. PID가 `$i`로 시작합니다. (호출 시 생략 가능)
    *   **Multi instance**: 같은 페이지 구현을 다른 내용으로 동시에 표시할 수 있습니다. PID 끝에 `^`를 프리픽스로 하는 instance origin id가 포함됩니다. (** 현재 미구현입니다.)

### PID (Page ID)
네비게이션은 딥링크나 라우트와 유사한 PID를 통해 처리됩니다.
*   형식: `$s&m=component#container#article` 또는 정의된 별칭(alias).
*   예시: `customPageManager.bringPage("dashboard")` 또는 `pageManager.bringPage("*dashboard")` 또는 `pageManager.bringPage("&b=main#dashboard")`.
*   등록된 PID 목록은 `pageManager.pages`를 통해 확인 할 수 있습니다.

### 라이프사이클
EstreUI 페이지는 Android Activity와 유사한 뚜렷한 라이프사이클을 가집니다:
1.  **onBring**: 페이지가 준비되는 중입니다. Active struct가 호출되기 이전이므로 각종 handle 등을 포함하는 element 생성 작업을 할 수 있습니다.
2.  **onOpen**: 페이지가 열리는 중입니다 (전환 시작). 1회만 호출됩니다.
3.  **onShow**: 페이지가 완전히 보입니다.
4.  **onHide**: 페이지가 숨겨졌습니다 (다른 페이지에 가려지거나 닫힘).
5.  **onClose**: 페이지가 닫혔습니다. 1회만 호출됩니다.
6.  **onRelease**: 페이지 리소스가 해제됩니다.

*   **onBack**: Back navigation이 호출될 때 실행되며, true를 반환할 경우 기본 작동이 취소됩니다.
*   **onReload**: 페이지를 새로고침하려고 할 때 호출됩니다. true를 반환할 경우 기본 작동이 취소됩니다. 기본 작동은 해당 페이지를 닫은 후 다시 열어주는 것입니다.

*   **onIntentUpdated**: 이미 활성화된 페이지가 새로운 데이터(Intent)를 받을 때 호출됩니다.
*   **onApplied**: 데이터 바인딩을 위해 `apply()`가 호출될 때 작업 후 실행됩니다.

### 페이지 핸들(Page handle) & 페이지 핸들러(Page handler)
*   **Handle**: DOM 요소 또는 UI 컨트롤러입니다. `handler`애서는 라이프싸이클의 `handle` 그 외에는 `this.handle`로 접근합니다.
*   **Handler**: 페이지를 관리하는 로직 클래스(`EstrePageHandler`)입니다. `handle.handler`로 접근합니다.
*   `handle.component`, `handle.container`를 사용하여 상위 항목의 핸들에 접근할 수 있습니다.
*   `component.containers`, `container.articles`를 사용하여 하위 항목의 핸들에 접근할 수 있습니다.
*   그 외 접근이 필요한 경우 `estreUi`의 `mainSections`, `blindedSections`등을 통하여 다른 섹션의 핸들에 접근할 수 있습니다. 자세한 항목은 소스 구현을 참고하세요.
*   각 페이지의 엘리먼트 객체에서 접근이 필요한 경우 `element.pageHandle`로 접근할 수 있습니다.
*   특히 브라우저의 developer tools의 console로 접근하려는 경우 요소 탭에서 component/container/article 요소를 선택한 후 `$0.pageHandle`를 입력하여 접근할 수 있습니다. 

### 데이터 바인딩 & Intent
*   **Intent**: 페이지 간에 전달되는 데이터 객체입니다. `handle.intent`나 `handler.intent`로 접근할 수 있습니다.
*   **Intent Data**: `handle.intent.data`나 `handler.intentData`로 접근할 수 있습니다.
*   **Intent Action**: 각 라이프싸이클에 해당하는 시점에 수행되는 동작을 지정할 수 있습니다. 자세한 사항은 소스 구현을 참고하세요.
    *   *실행 시점*: onBring, onOpen, onShow의 경우 라이프싸이클의 콜백이 실행 된 이후에 수행되며, onHide, onClose, onRelease의 경우 라이프싸이클의 콜백이 실행 되기 이전에 수행됩니다.
*   **Active Struct**: `data-bind-*` 속성을 통한 데이터 바인딩뿐만 아니라 `local-style`, `solid-point`, `handles`, `passive-links` 등 동적 요소를 초기화하는 포괄적인 시스템입니다. 초기화 시점(주로 `onBring` 전후)과 `intentData`가 수정될 때 자동으로 실행되어 UI를 업데이트합니다. **필요에 따라 수동으로 실행할 수도 있습니다.**
*   **Apply**: 다수의 변경사항이 한번에 적용되는 경우 `handle.apply(data)`를 사용하면 각 변경이 발생할 때 마다 `applyActiveStruce()`가 실행 되는것을 방지하고 변경이 완료 된 후에 한번만 실행되도록 하여 오버헤드를 방지할 수 있습니다.

### 핸들(handle) (EstreHandle 클래스 확장)
*   Article 페이지 내 재사용 가능한 구성 요소를 위한 것이 핸들입니다.
*   HTML 스트럭처 내 UIS(UI spceifier)에 따라 매칭되는 핸들이 onBring 이후 시점에 초기화됩니다.

#### 기본 제공 핸들
*   `EstreUnifiedCalendarHandle`, `EstreDedicatedCalanderHandle` 등의 기본 제공 핸들이 있습니다. 자세한 항목은 `estreUi.js`의 `EstreHandle` 클래스에 기본 등록된 클래스들을 참조하세요.

#### 사용자 정의 핸들
*   Estre UI의 초기화 전에 직접 구현한 핸들을 등록하여 사용할 수 있습니다. 자세한 사항은 `estreUi.js`의 `EstreHandle` 클래스의 구현을 참고하세요.

### 핸들러(handler) (직접 클래스 구현)
*   필요에 따라 특정 작동을 수행하는 재사용 가능한 구현을 핸들러라고 칭합니다.
*   주로 페이지 시작 콜백 중에 초기화하여 사용합니다.

#### 기본 제공 핸들러
*   `EstreSwipeHandler`, `EstreDraggableHandler` 등의 기본 제공 핸들러가 있습니다. 자세한 항목은 `estreUi.js`의 `// handlers` 주석 아래에 기본 등록된 클래스들을 참조하세요.

#### 사용자 정의 핸들러
*   핸들러의 구현은 형식이 따로 없으므로 자유롭게 구현하여 사용하시기 바랍니다.

### Exported Sections
헤더(`fixedTop`)나 정적 콘텐츠(`staticDoc`)와 같은 레이아웃 부분은 `index.html`을 깔끔하게 유지하기 위해 별도의 HTML 파일에서 로드됩니다.

`index.html`에 직접 작성한 사항은 각 파일의 내용의 뒤에 위치하게 됩니다.

필요에 따라(로컬 실행이 필요한 경우 등) `data-exported="1"`의 `1`을 지우거나 속성을 제거하여 별도 파일의 AJAX 로드를 하지 않고 `index.html`에 직접 작성하는 방식을 사용할 수 있습니다.

---

## UI/UX 및 유틸리티

### UI 모드
*   **스크롤 방식**:
    *   `vfv_scroll`: fixedTop 및 fixedBottom의 크기만큼 inset이 추가되는 스크롤.
    *   `sv_scroll`: inset이 없는 표준 스크롤.
    *   `txv_scroll`, `bxv_scroll`: 상단 또는 하단 inset 만 추가되는 스크롤.
*   **아티클 모드**:
    *   `fwvs`: Full Width Vertical Scroll (전체 너비 세로 스크롤).
    *   `limit_on_screen`: 페이지 폭을 모바일 수준으로 제한.
        *   `fixed_height`, `full_height`, `max_height`: 높이 제한 모드 설정. `estreUiCore2.css` 구현 참조.

### 레이아웃 유틸리티
*   **Flex 프리셋**: `line_block` (행), `inline_block`, `lines_block` (열).
*   **Inset 유틸리티**: 일관된 간격을 위한 `inset_on_margin`, `inset_on_padding`, `inset_on_gap`.

### 대화상자 대체
기본 브라우저 경고창은 차단적이고 미려하지 않습니다. EstreUI는 비차단 대안을 제공합니다:
*   `estreAlert(message)`: 기본 `alert` 호출은 이 함수로 대체됩니다.
*   `estreConfirm(message, callback)`: 기본 `confirm` 호출은 이 함수로 대체됩니다.
*   `estrePrompt(message, callback)`: 기본 `prompt` 호출은 이 함수로 대체됩니다.
*   *레거시 호출*: 꼭 필요한 경우 `classicAlert`를 사용할 수 있습니다.
*   `estreToast*`: 화면 하단에 부착된 형태의 다이얼로그 형식 또한 제공됩니다. alert, confirm, prompt와 동일한 인터페이스를 제공하며 커스텀 다이얼로그 또한 지원합니다.
    자세한 사항은 소스 구현을 참고하세요.
*   `note(message)`: 안드로이드의 Toast와 비슷한 형식의 메시지 출력을 제공합니다.
*   `wait()`, `go()`, `stedy()`: 전역 로딩 인디케이터를 표시하거나 숨깁니다.

### 스토리지 시스템
*   **Async Storage**: Local/Session Storage구현과 일치하는 비동기 스토리지용 prototype 구현입니다.
*   **Native Storage**: **WVCA4EUI**에서 실행 시 네이티브 앱 저장소를 사용합니다.
*   **Account/Device Storage**: 백엔드와 연동된 데이터 (계정별/기기별 저장소). 이 부분은 자체 API와 연동하여 async storage를 직접 구현해야 합니다.
*   **Codded Storage**: JCODD 직렬화/역직렬화를 자동으로 처리하는 스토리지 구현입니다.

### 전역 alias 객체
*   `uis`: UI specifier alias 모음.
*   `eds`: Element dataset name alias 모음.

### 로컬 스타일 (Local Style)
EstreUI는 **Article** 페이지 요소 내에서 `<local-style>` 태그를 사용하여 스코프된 스타일링을 지원합니다. 이 기능은 Active Struct 시스템의 일부로 처리됩니다.
*   **사용법**: 페이지 요소 내부에 `<local-style>` 태그를 배치합니다.
*   **경로 치환**: 스타일 내용 내에서 `##`을 사용하면 해당 지점까지의 경로로 치환됩니다. 이를 통해 특정 요소 계층에 한정된 스타일을 작성할 수 있습니다.
*   **작동 원리**: 프레임워크는 자동으로 `<local-style>`을 표준 `<style>` 태그로 변환하며, `##`을 해당 요소의 실제 CSS 선택자 경로로 치환합니다.

---

## 개발 시 주의사항 (Development Cautions)

### iOS 메모리 제한
*   **이슈**: iOS 15+(특히 15)는 웹 앱에 대한 엄격한 메모리 제한이 있습니다. 큰 CSS 파일은 앱 충돌이나 로드 실패를 유발할 수 있습니다.
*   **해결책**:
    *   스플래시 화면에 필요한 CSS만 분리하세요.
    *   나머지 CSS(무거운 폰트 포함)는 **Lazy Loading** (`<meta link="lazy" ...>`)을 사용하세요.
    *   스크립트 로딩 시 `defer` 속성을 사용하세요.
    *   exported section html (`staticDoc.html` 등) 파일에 html을 구현하여 사용하세요.

---

## 사용 예제 (Usage Examples)

### 망고클래스 (Estre UI가 라이브 코드로 개발되는 앱)
복잡한 데이터 바인딩, 다중 페이지 컨테이너, 동적 콘텐츠를 갖춘 교육용 앱 예시입니다.
*   **핵심 패턴**: `AppPagesProvider`를 사용하여 PID를 특정 핸들러에 매핑하는 광범위한 사용.
*   Application link: [망고클래스](https://class.mangoedu.co.kr)

### 관맹동감 (유틸리티 앱)
점자 뷰어 유틸리티입니다.
*   **핵심 패턴**: 파일 처리 및 간단한 UI 구조. 로컬에서 파일 입력을 처리하고 데이터를 가공하는 방법을 보여줍니다.
*   Application link: [관맹동감](https://gmdg.nm3.kr)
*   Github repository: [https://github.com/Esterkxz/GMDG](https://github.com/Esterkxz/GMDG)

### 공통 패턴
*   **index.html**: 뼈대(Skeleton).
*   **AppPagesProvider**: 라우터 설정.
*   **EstrePageHandler**: 각 페이지의 컨트롤러.

---

## 마이그레이션 가이드 (Migration Guide)

### Classic Web (ASP/PHP/JSP) -> EstreUI
*   **SSR 하이브리드**: 초기 로드(`staticDoc`)에는 여전히 서버 사이드 렌더링을 사용할 수 있지만, 처음 실행 시 최초 1회만 로드되므로 SPA 경험을 유지하려면 각 페이지의 컨텐츠 및 네비게이션은 AJAX/Fetch로 처리해야 합니다.
*   **AJAX**: 폼 제출과 페이지 새로고침을 `fetch` 호출과 EstreUI의 페이지 전환으로 대체하세요.

### Native App -> EstreUI
*   **WVCA4EUI**: 이 Flutter 기반 래퍼를 사용하여 EstreUI 앱을 앱 스토어용으로 패키징하세요.
    *   **기능**: 네이티브 기능을 위한 브릿지를 제공하고, PWA 캐싱을 처리하며, 웹뷰 라이프사이클을 관리합니다.
    *   **Bridge Handler**: 자바스크립트가 Flutter 코드를 호출하거나 그 반대로 호출할 수 있게 해줍니다.

