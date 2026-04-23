# 다크 모드

> 영문 버전: [dark-mode.en.md](dark-mode.en.md)

EstreUI 는 단일 body 어트리뷰트(`body[data-dark-mode="1"]`) 와 `estreUi` 싱글턴의 세 메서드(`setDarkMode`, `darkMode` / `isDarkMode` 게터) 만으로 구성된 가벼운 다크 모드 스캐폴드를 제공합니다. CSS 측은 **시맨틱** 색상 토큰만 뒤집고, **베이스라인 그레이스케일 팔레트** 는 라이트 모드에서 그대로 상속합니다.

## CSS 스캐폴드

오버라이드 블록은 [styles/estreUiRoot.css](../../styles/estreUiRoot.css) 의 `:root` 블록 하단, `body[data-dark-mode="1"]` 안에 있습니다. 원칙은 변하지 않는 그레이스케일 축 위에 시맨틱 셋만 대칭적으로 뒤집는 것입니다.

- **상속(오버라이드 안 함)** — 베이스라인 팔레트 `--color-black` / `--color-grayscale-*` / `--color-white` (그리고 `--cblk` / `--cg*` / `--cwht` 별칭). 브랜드 단일색(`--color-focused`, `--color-emphasis*`, holiday/sunday/today 등) 도 정체성 유지를 위해 그대로 둡니다. 경계 불투명 램프(`--color-boundary-o*`, `--color-boundary-foggy-o*`) 는 `var()` 로 `--cbdm` / `--cbbr` 를 자동 추종하므로 별도 오버라이드가 불필요합니다.
- **뒤집힘** — `--color-text-*` (16단계 램프, 역순 hex), `--color-boundary-*` (대칭쌍 뒤집기: `dim ↔ bright`, `dark ↔ light` 등), `--color-point*`, `--color-point-sub*`, `--color-adaptive-*`. 모든 항목은 풀네임(`--color-boundary-dim`) 과 alienese 별칭(`--cbdm`) 을 짝으로 갖습니다.

경계 항목은 `--color-boundary-*` 패밀리를 그레이스케일 축의 *반대편* 으로 다시 가리켜 뒤집습니다 — `dim` 은 `var(--color-white)`, `bright` 는 `var(--color-black)` 로. `--cbdm` / `--cbbr` 가 불투명 램프의 앵커이므로 나머지 경계 램프는 자동으로 따라옵니다.

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

- **CSS 레이어 (결정론적)** — `body[data-dark-mode="1"]` 만 박혀 있으면 모든 시맨틱 토큰이 자동으로 다크 형태로 정렬됩니다. 도입 프로젝트가 스플래시 배경을 뒤집힘 가능한 토큰(예: `--common-bg-color`) 으로 라우팅해 두면, 스플래시도 추가 작업 없이 즉시 다크로 뜹니다.
- **JS 레이어 (옵트인 토글)** — `setupDarkMode()` 가 `$(document).ready()` 안에서 실행되므로 body 어트리뷰트는 첫 페인트 *이후* 에 쓰입니다. 다크 잠금 세션은 라이트로 잠깐 깜빡인 뒤 다크로 자리잡습니다 (FOLM — flash of light mode).

FOLM 을 제거하려면 도입 프로젝트가 `<body>` 여는 태그 직후, 렌더 자식이 등장하기 전에 소형 인라인 사전 스크립트를 둡니다.

```html
<body>
  <script>
    const stored = localStorage.getItem("estreUi.darkMode");
    const dark = stored === "1" ||
      (stored == null && matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.body.dataset.darkMode = "1";
  </script>
  ...
</body>
```

EstreUI 본체는 이 사전 스크립트를 포함하지 않습니다. 셀렉터가 `<body>` 를 겨냥하므로 `<head>` 단계 주입은 무효이고, 저장 키(`"estreUi.darkMode"`) 와 자동 모드 정책은 도입 프로젝트의 결정 사안이며, 사전 페인트 결합은 모듈 로드가 아니라 호스트 HTML 인라인이어야 작동합니다. 스플래시 결합은 따라서 프레임워크 책임이 아니라 **도입 프로젝트의 옵트인** 입니다.

## 새 다크 모드 대응 색 추가하기

그레이스케일과 브랜드 단일색을 제외한 새 시맨틱 색셋을 도입할 때는 기존 패턴을 따릅니다.

1. 라이트 모드 값을 `:root` 에 풀네임 + alienese 별칭으로 함께 선언 (`--my-color: ...; --myc: ...;`).
2. `body[data-dark-mode="1"]` 안에 대칭쌍 뒤집기를 추가. hex 리터럴보다 `var(--cwht)` / `var(--cglr)` 등 그레이스케일 축 참조를 우선 — 뒤집힘이 (변하지 않는) 그레이스케일 축에 정박된 채 유지됩니다.
3. 색이 브랜드 정체성에 속한다면(포커스/강조/요일 마커 등) 오버라이드 자체를 생략 — 양쪽 모드에서 동일하게 보여야 합니다.
