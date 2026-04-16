# PID 와 Layer / Section / Container / Article

> 영문 버전: [pid-and-layout.en.md](pid-and-layout.en.md)

## PID 의 정의

**PID** (Page IDentifier) 는 EstreUI 앱 안에서 *내비게이션 가능한 한 단위*를 완전히 가리키는 단일 문자열입니다. `bringPage()` 호출, Pages Provider 등록, 세션 복원 캐시 등 페이지를 식별해야 하는 모든 곳에서 이 한 줄을 씁니다.

```
&<layer>=<sectionId>^<instanceOrigin>#<containerId>@<articleId>%<stepIndex>
└─────┘ └────────┘└──────────────┘ └────────────┘ └──────────┘└──────────┘
 레이어    섹션      멀티 인스턴스      컨테이너        아티클    스택 스텝
```

레이어 prefix 뒤의 모든 세그먼트는 선택적입니다. 가장 짧은 유효 PID 는 `&<layer>=<sectionId>` 만 있는 형태.

### 예시

| PID | 의미 |
| --- | --- |
| `&m=home` | *Main* 레이어의 `home` 섹션. |
| `&m=catalog#detail` | `catalog` 섹션의 `detail` 컨테이너. |
| `&m=catalog#detail@reviews` | 그 컨테이너의 `reviews` 아티클. |
| `&b=login#signup@step%0` | *Blinded* 레이어 `login` 섹션 → `signup` 컨테이너 → 스택 네비게이션 아티클 `step`의 **첫 번째 스텝(%0)**. |
| `&b=editor^abc123#root@main` | 멀티 인스턴스 섹션 `editor`, 인스턴스 오리진 `abc123`. `^` 는 멀티 인스턴스 가능 표시, 오리진이 이 특정 인스턴스를 식별. |

## 6개의 레이어

레이어 prefix 는 z 축으로 쌓인 6개 영역 중 하나에 매핑됩니다. 아래에서 위로:

| Prefix | 통상 명칭 | `index.html` 의 호스트 | 일반 용도 |
| --- | --- | --- | --- |
| `&m=` | **MainSections** | `<main id="staticDoc">`, `<main id="instantDoc">` | 주요 화면(홈, 목록, 상세). |
| `&f=` | **FooterSections** | `<footer id="fixedBottom">` | 하단 고정 UI. |
| `&u=` | **MenuSections** | `<nav id="mainMenu">` | 사이드/드로어 메뉴. |
| `&h=` | **HeaderSections** | `<header id="fixedTop">` | 상단 바·앱바. |
| `&b=` | **BlindedSections** | `<main id="instantDoc">` (모달 블라인드) | 인증, 전체화면 점거, 차단성 플로우. |
| `&o=` | **OverlaySections** | `<nav id="managedOverlay">` | 다이얼로그·토스트·팝업. |

레이어들은 독립적입니다. `&h=` 페이지와 `&m=` 페이지가 동시에 살아있을 수 있고 각자 다른 DOM 호스트를 차지합니다.

## Static vs. Instant 섹션

같은 레이어 안에서도 섹션은 두 종류:

- **Static** — `<section data-static="1">`. 부트 시 export 파일(예: `staticDoc.html`)에서 한 번 마운트. 닫을 수 없고 숨기기만 가능. 원시 표기는 `$s` 접두.
- **Instant** — `<section data-static="">` 또는 속성 없음. 지연 로드, 닫으면 해제. 원시 표기는 `$i` 접두.

`data-static` 속성은 **컨테이너와 아티클에도** 적용됩니다. 컨테이너/아티클이 `data-static="1"` 이지만 상위 섹션이 *instant* 인 경우, 이 static 하위 요소들은 부모 instant 섹션이 열리고 닫힐 때 함께 열리고 닫힙니다 — "부모의 생애 범위 안에서의 static"이지, 전역적으로 영구 존속하는 것이 아닙니다. 섹션 레벨의 static 만이 영구적으로 살아남습니다.

대부분의 코드는 섹션을 ID 로만 부르고(`home`, `login` …) `$s`/`$i` 접두는 저수준 API 에서만 등장합니다.

## Container 와 Article

**Container** 는 한 섹션 안의 주요 표면. 보통 한 컨테이너가 "기본"이고 나머지는 그 위를 덮거나 교체합니다. `data-container-id` 로 식별.

**Article** 은 컨테이너 안의 컨텐츠 슬롯. 컨테이너를 언마운트하지 않고도 여러 뷰(탭, 스텝, 슬라이드)를 번갈아 보여주려 할 때 씁니다.

```html
<section id="catalog" data-static="1">
    <div class="container" data-container-id="root">
        <article data-article-id="main">…</article>
        <article data-article-id="empty">…</article>
    </div>
    <div class="container" data-container-id="detail">
        <article data-article-id="overview">…</article>
        <article data-article-id="reviews">…</article>
    </div>
</section>
```

이 마크업이면 다음 4개 모두 유효한 PID:

```
&m=catalog#root@main
&m=catalog#root@empty
&m=catalog#detail@overview
&m=catalog#detail@reviews
```

## 멀티 인스턴스 (`^` + instanceOrigin)

섹션(또는 다른 세그먼트) 뒤의 `^` 접미사는 **멀티 인스턴스 가능** 표시입니다. 같은 섹션의 여러 사본이 동시에 존재할 수 있으며, `^` 뒤에 붙는 **instanceOrigin** 으로 각 인스턴스를 구분합니다.

```
&b=editor^abc123#root@main   ← 인스턴스 "abc123"
&b=editor^xyz789#root@main   ← 인스턴스 "xyz789" (abc123 과 동시 생존)
```

`^` 가 없으면 같은 섹션을 다시 bring 해도 기존 것을 재활용합니다. `^` 가 있으면 다른 instanceOrigin 을 줄 때마다 새 인스턴스가 생성됩니다. 이미지 뷰어, 콘텐츠 편집기, 여러 항목을 동시에 열 수 있는 상세 페이지 등에 활용합니다.

instanceOrigin 을 생략하면(`^` 만 붙이면) 프레임워크가 자동으로 배정합니다:

```
&b=viewer^#root@main   ← 인스턴스 오리진 자동 배정
```

## 스택 네비게이션 스텝 (`%n`)

`%<n>` 접미사는 **아티클 그룹이 스택 네비게이션(`v_stack` / `h_stack`)으로 구성된 컨테이너 안에서** 쓰입니다. 일반적인 멀티 인스턴스가 아니라, 스택 내의 **고정 순서 스텝 인덱스**(0부터)를 나타냅니다.

```
&b=login#signup@step%0   ← 스텝 0 (예: 본인 확인)
&b=login#signup@step%1   ← 스텝 1 (예: 정보 입력)
&b=login#signup@step%2   ← 스텝 2 (예: 계정 생성)
&b=login#signup@step%3   ← 스텝 3 (예: 이용 약관 동의)
```

스택이 스텝 간 앞/뒤 전환을 관리합니다. 각 `%n` 은 같은 아티클 템플릿을 공유하되 플로우 내의 별개 위치를 의미합니다. 스택 내 네비게이션은 보통 페이지 핸들러가 주도하며, 개별 `%n` PID 를 직접 `bringPage` 로 호출하는 방식은 아닙니다.

## PID 한눈에 읽기

```
&b=editor^abc123#detail@form%2
│  │      │       │     │    └─ 스택 스텝 인덱스 (3번째 스텝)
│  │      │       │     └───── article id
│  │      │       └──────────── container id
│  │      └──────────────────── 인스턴스 오리진 (멀티 인스턴스)
│  └─────────────────────────── section id + ^ (멀티 인스턴스 표시)
└────────────────────────────── 레이어 = Blinded
```

`#` 가 빠지면 그 섹션의 기본 컨테이너(보통 `root`)가, `@` 가 빠지면 그 컨테이너의 기본 아티클이 암묵적으로 적용됩니다.

## 구현 포인트

- 앱이 받아들이는 모든 PID 는 보통 Pages Provider 의 `static get pages` 맵에 친숙한 별칭(alias)으로 한 번 선언합니다 (참고: [page-handlers.ko.md](page-handlers.ko.md)).
- `pageManager.bringPage(alias, intent)` 는 별칭을 정규 PID 로 풀고, 내부에서 layer/section/container/article 의 4-tuple 로 분해합니다.
- export 섹션 파일은 올바른 ID 와 `data-static` 값을 가진 `<section>` 골격만 선언하면 충분합니다. 그 안의 마크업은 전부 개발자 책임.
