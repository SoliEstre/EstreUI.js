# EstreUI.js — 개요

> 영문 버전: [overview.en.md](overview.en.md)

## 정체

EstreUI.js 는 통상적인 의미의 프레임워크나 라이브러리가 아니라 **Rimwork**(실행 가능한 테두리)입니다. 페이지 모델·라이프사이클·내비게이션·DOM 바인딩 같은 *테두리*를 제공하고, *내용물*은 개발자가 채우도록 의도적으로 비워둡니다. 채울 도구는 자유 선택(보통 jQuery, 다른 DOM 라이브러리도 가능).

명시적으로 두 부류의 개발자를 겨냥합니다.

- **기존 웹 개발자** — jQuery / ASP / PHP / JSP 로 작성하던 사람이, 무거운 SPA 프레임워크 없이 단일 페이지·앱 같은 셸을 얻고 싶을 때.
- **네이티브 앱 개발자** — `onShow`/`onHide`/`onClose` 같은 라이프사이클과 intent 전달 패턴이 안드로이드 경험과 그대로 매칭됩니다.

하이브리드/네이티브 배포용 Flutter 래퍼(WVCA4EUI)가 함께 제공되지만, JS 측이 거기에 직접 의존하지는 않습니다.

## 페이지의 구성 단위

EstreUI 는 모든 화면을 다음 4단계 트리로 다룹니다(위에서부터 PID 표기 순서대로):

```
Layer    ─ &m | &h | &u | &b | &o | &f
Section  ─ <section data-static="1" 또는 data-static="">의 id
Container─ <div class="container" data-container-id="...">의 id
Article  ─ <article data-article-id="...">의 id
```

이를 합친 **PID** 의 예: `&m=class#classRecords@details`. 전체 문법은 [pid-and-layout.ko.md](pid-and-layout.ko.md).

HTML 은 기동 시 rim 이 마운트하는 *export* 호스트 파일들로 분할됩니다.

| `index.html` 의 슬롯 | export 파일 | 역할 |
| --- | --- | --- |
| `<header id="fixedTop" data-exported="1">` | `fixedTop.html` | 영구 상단 바 / 앱바 호스트 |
| `<footer id="fixedBottom" data-exported="1">` | `fixedBottom.html` | 영구 하단 바 / instant 섹션 호스트 |
| `<nav id="mainMenu" data-exported="1">` | `mainMenu.html` | 슬라이드 인 메뉴 드로어 |
| `<main id="staticDoc" data-exported="1">` | `staticDoc.html` | 정적(닫을 수 없음) 섹션 모음 |
| `<main id="instantDoc" data-exported="1">` | `instantDoc.html` | 즉시(로드/닫기 가능) 섹션 모음 |
| `<nav id="managedOverlay" data-exported="1">` | `managedOverlay.html` | 다이얼로그·토스트·팝업 |

## 라이프사이클

각 페이지 핸들러는 다음 순서로 동작합니다.

```
onBring → onOpen(최초 1회) → onShow → … → onHide → onClose(최초 1회) → onRelease
```

부가 콜백: `onBack`, `onReload`, `onIntentUpdated`(살아있는 동안 새 데이터 수신), `onApplied`(데이터 바인딩 완료 후). 자세한 내용은 [page-handlers.ko.md](page-handlers.ko.md).

## 가장 자주 쓰는 두 확장점

1. **커스텀 Handle** — `EstreHandle` 을 상속하고 CSS 셀렉터로 등록하면, 매칭되는 모든 DOM 요소가 페이지 라이프사이클을 공유하는 컨트롤러 인스턴스를 갖습니다. → [custom-handles.ko.md](custom-handles.ko.md).
2. **페이지 핸들러** — PID 마다 `EstrePageHandler` 를 상속한 클래스를 선언. *Pages Provider* 가 이들을 모아 하나의 맵으로 부트 시 페이지 매니저에 전달합니다.

## 최소 멘탈 모델

```
┌─────────────────────────────────────────────────────────────┐
│                       index.html (Rim)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ fixedTop │ │ mainMenu │ │ overlay  │ │  staticDoc /   │  │
│  │ (header) │ │ (drawer) │ │ (dialog) │ │  instantDoc    │  │
│  └──────────┘ └──────────┘ └──────────┘ │  (sections)    │  │
│                                          └────────────────┘  │
│           ▲ EstreUiPageManager (PID → 페이지 핸들러) ▲        │
│           │                                          │        │
│   사용자 정의 MyPagesProvider          사용자 정의 MyHandle (×N) │
│   (EstreUiCustomPageManager 상속)      (EstreHandle 상속)        │
└─────────────────────────────────────────────────────────────┘
```

## 이 문서가 다루는 것 / 다루지 않는 것

EstreUI 의 공개 표면 — PID 문법, 레이어 모델, 라이프사이클, 핸들 작성, 마크업 컨벤션, 부트 시퀀스, 내비게이션 API — 만 다룹니다. 그 위에 만들어진 특정 애플리케이션은 다루지 **않습니다**.

업스트림 README 의 더 큰 그림은 [SoliEstre/EstreUI.js](https://github.com/SoliEstre/EstreUI.js) 자체를 참고하세요. 본 폴더는 그 README 의 보조판이자 사례 기반 확장판입니다.
