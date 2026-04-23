# 다크 모드

> 영문 버전: [dark-mode.en.md](dark-mode.en.md)

EstreUI 는 단일 body 어트리뷰트(`body[data-dark-mode="1"]`) 와 `estreUi` 싱글턴의 세 메서드(`setDarkMode`, `darkMode` / `isDarkMode` 게터) 만으로 구성된 가벼운 다크 모드 스캐폴드를 제공합니다. CSS 측은 **시맨틱** 색상 토큰만 뒤집고, **베이스라인 그레이스케일 팔레트** 는 라이트 모드에서 그대로 상속합니다.

## CSS 스캐폴드

오버라이드 블록은 [styles/estreUiRoot.css](../../styles/estreUiRoot.css) 의 `:root` 블록 하단, `body[data-dark-mode="1"]` 안에 있습니다. 원칙은 변하지 않는 그레이스케일 축 위에 시맨틱 셋만 대칭적으로 뒤집는 것입니다.

- **상속(오버라이드 안 함)** — 베이스라인 팔레트 `--color-black` / `--color-grayscale-*` / `--color-white` (그리고 `--cblk` / `--cg*` / `--cwht` 별칭). 브랜드 단일색(`--color-focused`, `--color-emphasis*`, holiday/sunday/today 등) 도 정체성 유지를 위해 그대로 둡니다.
- **뒤집힘** — `--color-text-*` (16단계 램프, 역순 hex), `--color-boundary-*` (대칭쌍 뒤집기: `dim ↔ bright`, `dark ↔ light` 등), `--color-boundary-o*` 와 `--color-boundary-foggy-o*` (불투명 램프, 다크 블록에서 전량 재선언 — 아래 참고), `--color-point*`, `--color-point-sub*`, `--color-adaptive-*`. 모든 항목은 풀네임(`--color-boundary-dim`) 과 alienese 별칭(`--cbdm`) 을 짝으로 갖습니다.

경계 항목은 `--color-boundary-*` 패밀리를 그레이스케일 축의 *반대편* 으로 다시 가리켜 뒤집습니다 — `dim` 은 `var(--color-white)`, `bright` 는 `var(--color-black)` 로. 불투명 램프 `--color-boundary-o*` / `--color-boundary-foggy-o*` 는 `rgba(var(--cbdm) / N%)` / `rgba(var(--cbbr) / N%)` 공식으로 선언되는데, CSS 커스텀 프로퍼티의 `var()` 치환은 **선언 스코프에서 즉시 해결** 됩니다. 즉 `:root` 에서 선언된 램프는 `:root` 의 `--cbdm` / `--cbbr` 값으로 computed value 가 굳어지고, 자손은 그 리터럴을 상속할 뿐입니다. body 스코프에서 `--cbdm` / `--cbbr` 만 바꿔봐야 이미 굳은 램프에는 전파되지 않습니다. 그래서 다크 블록은 모든 램프 엔트리(`-o*` 25 단계 + `-foggy-o*` 27 단계) 를 같은 공식으로 다시 선언해, 다크 스코프의 `--cbdm` / `--cbbr` 값으로 재치환되도록 합니다.

## API

```js
// 사용자 환경설정 변경. true/false/null/undefined 와 alienese 별칭(t/f/n/u),
// 저장값 호환을 위한 "1"/"0" / 1/0 도 모두 받습니다.
estreUi.setDarkMode(t);     // 다크 켜기
estreUi.setDarkMode(f);     // 라이트 켜기
estreUi.setDarkMode(n);     // 자동 (OS prefers-color-scheme 추종)
estreUi.setDarkMode();      // setDarkMode(u) 와 동일 → 자동

// 사용자 환경설정 읽기: true (다크) / false (라이트) / null (자동).
estreUi.darkMode;

// 실제 적용된 현재 상태 — body 에 실제로 쓰여 있는 값 기준.
estreUi.isDarkMode;
```

| 멤버 | 형태 | 의미 |
| --- | --- | --- |
| `setDarkMode(value)` | 메서드 | 사용자 설정을 저장 후 재적용. 결과 `isDarkMode` 를 반환. |
| `darkMode` | 게터 | 저장된 사용자 설정 (`true` / `false` / `null`). `null` 은 "자동". |
| `isDarkMode` | 게터 | 실제 적용 중인 상태. 자동 모드면 `matchMedia` 로 해석된 결과. |
| `applyDarkMode()` | 메서드 | 재평가하여 `body[data-dark-mode]` 에 기록. 내부 호출용 — 외부에서 거의 부를 일 없음. |
| `setupDarkMode()` | 메서드 | 부트 시 결선(`estreUi.init()` 에서 호출). `prefers-color-scheme` 리스너 등록 + 초기 적용. |

> 이 API 에 대한 프레임워크 자체 토글 UI 는 퀵패널에서만 제공합니다 — [로드맵 #008](roadmap/008-quick-panel.md) 참조. 도입 프로젝트가 자체 토글을 별도로 둘 수는 있으나, body 어트리뷰트를 직접 조작하지 말고 `setDarkMode` 를 호출해야 합니다.

## 저장소

환경설정은 `localStorage["estreUi.darkMode"]` 에 저장됩니다.

| 저장값 | 의미 |
| --- | --- |
| `"1"` | 사용자가 다크 선택. |
| `"0"` | 사용자가 라이트 선택. |
| 없음 | 자동 — OS `prefers-color-scheme` 추종. |

`setDarkMode(null)` / `setDarkMode(undefined)` 는 키를 제거하여 자동 모드로 전환합니다.

## 부트 결선

`setupDarkMode()` 는 `estreUi.init()` 에서 `setReload()` / `setBackNavigation()` / `setMenuSwipeHandler()` 와 나란히 호출됩니다. 다음을 수행합니다.

1. `matchMedia("(prefers-color-scheme: dark)")` 쿼리를 만들어 `estreUi.darkModeMql` 에 보관.
2. *환경설정이 자동(null)일 때만* 재적용하는 `change` 리스너 부착(다크/라이트로 잠근 사용자가 OS 테마 변경에 의해 뒤집히지 않도록).
3. `applyDarkMode()` 호출로 초기 페인트.

## 첫 페인트 결합

두 레이어는 첫 페인트에 *의도적으로 다른 강도로* 결합됩니다.

- **CSS 레이어 (결정론적)** — `body[data-dark-mode="1"]` 만 박혀 있으면 *지연 로드되는* 시맨틱 토큰은 모두 다크 형태로 정렬됩니다. 즉시 로드되는 초기화 스타일시트는 별개 이슈로, 토큰 팔레트가 도착하기 전에 실행되므로 스플래시 핵심 색상은 리터럴로 선언해야 합니다 (아래 [스플래시 색](#스플래시-색-즉시-init-오버라이드) 참고).
- **JS 레이어 (옵트인 토글)** — `setupDarkMode()` 가 `$(document).ready()` 안에서 실행되므로 body 어트리뷰트는 첫 페인트 *이후* 에 쓰입니다. 다크 잠금 세션은 라이트로 잠깐 깜빡인 뒤 다크로 자리잡습니다 (FOLM — flash of light mode).

FOLM 을 제거하려면 `<body>` 여는 태그 직후, 렌더 자식이 등장하기 전에 소형 인라인 사전 스크립트가 실행돼야 합니다. 프레임워크는 이 스크립트를 [index.html](../../index.html) 안에 주석 처리된 채로 함께 제공합니다 — 바로 붙여쓸 수 있는 스타터.

```html
<body>
  <!--
  <script>
    (function () {
      const stored = localStorage.getItem("estreUi.darkMode");
      const dark = stored === "1"
        || (stored == null && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
      if (dark) document.body.dataset.darkMode = "1";
    })();
  </script>
  -->
  ...
</body>
```

기본이 주석인 이유: 사전 페인트 결합은 모듈 로드가 아니라 호스트 HTML 인라인이어야 작동하고, 저장 키(`"estreUi.darkMode"`) 와 자동 모드 정책은 도입 프로젝트가 결정할 몫이기 때문입니다. 옵트인하려면 주석만 해제하고, 프로젝트에서 다른 키를 쓴다면 그 부분만 맞추면 됩니다. 셀렉터가 `<body>` 를 겨냥하므로 `<head>` 단계 주입은 무효라는 점은 변함없습니다.

## 스플래시 색 (즉시 init 오버라이드)

프레임워크의 즉시 로드 스타일시트 [estreUiInitialize.css](../../styles/estreUiInitialize.css) 는 `<meta link="lazy">` 로 비동기 도착하는 [estreUiRoot.css](../../styles/estreUiRoot.css) 보다 먼저 로드됩니다. 그 사전-지연로드 구간에는 `--color-*` 토큰 팔레트가 아직 정의되지 않았으므로, `estreUiInitialize.css` 안에서 `var(--color-white)` / `var(--color-black)` 등을 참조하는 규칙은 guaranteed-invalid 로 떨어지고, 소비 속성은 fallback (예: `background-color` → `transparent`) 으로 내려갑니다. 그러면 스플래시가 뒤쪽의 반쯤 초기화된 UI 를 그대로 비춰버립니다.

견고성을 위해 `estreUiInitialize.css` 는 `--common-bg-color` 기본값을 라이트(`#CCC`) / 다크(`#222`) 양쪽 모두 리터럴 hex 로 선언합니다. 다크 기본값은 FOLM 사전 스크립트가 실행된 세션에서만 실제로 보입니다 — 사전 스크립트가 없으면 첫 페인트 시점에 `body[data-dark-mode="1"]` 가 아직 없어 라이트 값이 적용되기 때문.

프로젝트 전용 스플래시 톤(브랜드 컬러, 로고 톤) 이 필요한 도입 프로젝트는 `--common-bg-color` 를 자체 비-lazy 초기화 스타일시트에서 오버라이드합니다.

1. FOLM 사전 스크립트의 주석을 해제해 첫 페인트 시점에 `body[data-dark-mode="1"]` 가 존재하도록 합니다.
2. 프로젝트 전용 *비-lazy* 초기화 스타일시트를 추가하고, `estreUiInitialize.css` 와 같은 `<head>` 패스에서 즉시 로드(`<meta link="lazy">` 가 아닌 일반 `<link rel="stylesheet">`) 합니다.
3. 해당 스타일시트 안에서 라이트와 다크 스플래시 색을 hex 리터럴로 선언합니다.

   ```css
   body                        { --common-bg-color: #FFF; }
   body[data-dark-mode="1"]    { --common-bg-color: #111; }
   ```

리터럴(`var(--color-white)` 가 아닌)이 필수인 이유: 이 즉시 스타일시트는 토큰 팔레트가 로드되기 전에 실행됩니다. 지연 팔레트가 도착한 뒤의 지연 스타일시트들은 토큰 시스템을 평소대로 써도 됩니다.

## 새 다크 모드 대응 색 추가하기

그레이스케일과 브랜드 단일색을 제외한 새 시맨틱 색셋을 도입할 때는 기존 패턴을 따릅니다.

1. 라이트 모드 값을 `:root` 에 풀네임 + alienese 별칭으로 함께 선언 (`--my-color: ...; --myc: ...;`).
2. `body[data-dark-mode="1"]` 안에 대칭쌍 뒤집기를 추가. hex 리터럴보다 `var(--cwht)` / `var(--cglr)` 등 그레이스케일 축 참조를 우선 — 뒤집힘이 (변하지 않는) 그레이스케일 축에 정박된 채 유지됩니다.
3. 색이 브랜드 정체성에 속한다면(포커스/강조/요일 마커 등) 오버라이드 자체를 생략 — 양쪽 모드에서 동일하게 보여야 합니다.
