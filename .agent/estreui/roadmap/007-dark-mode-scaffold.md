# #007 — 다크 모드 스캐폴드

- **우선순위**: 🟡 보통
- **분류**: 테마 / CSS
- **상태**: ✅ 완료 (2026-04-23)

## 배경

EstreUI 의 색 토큰 시스템([styles/estreUiRoot.css](../../../styles/estreUiRoot.css)) 은 베이스라인 그레이스케일 팔레트(`--color-black` / `--color-grayscale-*` / `--color-white`) 위에 시맨틱 셋(`--color-text-*`, `--color-boundary-*`, `--color-point*`, `--color-adaptive-*` 등) 을 얹은 2층 구조로 잘 짜여 있었으나, 다크 모드 토글이 **빈 스캐폴드** 로만 존재했다.

```css
/* 사전 상태 — 5개 CSS 파일에 빈 블록만 존재 */
body[data-dark-mode="1"] { }
```

JS 측에는 토글 API 자체가 없었다. body 어트리뷰트를 수동으로 켜도 시맨틱 토큰이 뒤집히지 않아 효과가 없는 상태.

## 설계

### 원칙: 그레이스케일은 고정, 시맨틱만 뒤집기

베이스라인 팔레트는 의도적으로 **상속(오버라이드 안 함)**. 그레이스케일 축이 고정되어 있어야 시맨틱 토큰의 `var(--cglr)` / `var(--cgdn)` 등 참조가 뒤집힘만으로 자연스럽게 다크 톤으로 정렬된다. 브랜드 단일색(`--color-focused`, `--color-emphasis*`, holiday/sunday/today 등) 도 정체성 유지를 위해 양쪽 모드에서 동일.

**뒤집힘 대상**: `--color-text-*` (16단계 역순 hex), `--color-boundary-*` (대칭쌍: `dim ↔ bright`, `dark ↔ light` 등 그레이스케일 반대편 참조), `--color-point*`, `--color-point-sub*`, `--color-adaptive-*`. 모든 항목은 풀네임 + alienese 별칭 짝.

**암묵 효과**: `--color-boundary-o*` / `--color-boundary-foggy-o*` 는 `var()` 로 `--cbdm` / `--cbbr` 를 참조하므로 별도 오버라이드 없이 자동 추종.

### API: `estreUi.setDarkMode(value)`

alienese 호환성을 위해 `t/f/n/u` (= `true/false/null/undefined`) 와 `"1"/"0"`, `1/0` 까지 받는다.

```js
estreUi.setDarkMode(t);     // 다크 켜기
estreUi.setDarkMode(f);     // 라이트 켜기
estreUi.setDarkMode(n);     // 자동 (OS prefers-color-scheme)
estreUi.setDarkMode();      // setDarkMode(u) → 자동
```

읽기 게터:

- `estreUi.darkMode` — 사용자 환경설정 (`true` / `false` / `null`).
- `estreUi.isDarkMode` — 실제 적용 중인 상태 (자동 모드면 `matchMedia` 결과로 해석).

### 저장소

`localStorage["estreUi.darkMode"]`:

- `"1"` — 다크 잠금
- `"0"` — 라이트 잠금
- 없음 — 자동

### 부트 결선

`setupDarkMode()` 를 `estreUi.init()` 에서 `setReload()` / `setBackNavigation()` / `setMenuSwipeHandler()` 옆에 배치. 매 부팅 시:

1. `matchMedia("(prefers-color-scheme: dark)")` 쿼리를 `darkModeMql` 에 보관.
2. `change` 리스너 — *환경설정이 자동(null) 일 때만* 재적용 (잠금 사용자가 OS 변경에 뒤집히지 않도록).
3. `applyDarkMode()` 로 초기 페인트.

## 구현

### CSS — [styles/estreUiRoot.css](../../../styles/estreUiRoot.css#L488-L560)

`body[data-dark-mode="1"]` 블록 (~70줄):

- `--color-text-darker` ~ `--color-anti-text` (16단계, 역순 hex 램프).
- `--color-boundary-dim` ~ `--color-boundary-bright` (대칭쌍, 그레이스케일 반대편 참조).
- `--color-point*` / `--color-point-sub*` (5단계, 그레이스케일 반대편 참조).
- `--color-adaptive-*` (7단계, 그레이스케일 반대편 참조).

### JS — [scripts/estreUi-main.js](../../../scripts/estreUi-main.js)

- 필드: `darkModeMql: null` (`menuSwipeHandler` 옆).
- 게터: `darkMode`, `isDarkMode` (`isOpenMainMenu` 옆).
- 메서드: `setupDarkMode()`, `setDarkMode(value)`, `applyDarkMode()` (`//dark mode` 섹션, `//mainMenu` 섹션 직전).
- 결선: `init()` 안에서 `this.setupDarkMode()` 호출.

## 단계

### A — CSS 오버라이드 작성 — ✅ 완료

기존 빈 `body[data-dark-mode="1"]` 블록을 시맨틱 셋 전체에 대한 대칭 뒤집기로 채움. 베이스라인 팔레트와 브랜드 단일색은 의도적으로 미오버라이드.

### B — JS API 구현 — ✅ 완료

`setDarkMode` / `darkMode` / `isDarkMode` / `applyDarkMode` / `setupDarkMode` 추가. `t/f/n/u` 별칭, `"1"/"0"`, `1/0` 모두 수용. localStorage 영속화.

### C — 부트 결선 — ✅ 완료

`estreUi.init()` 에서 `setupDarkMode()` 호출. `matchMedia` 리스너는 *자동 모드일 때만* 재적용하도록 가드.

### D — 업스트림 미러링 — ✅ 완료

`estreUiRoot.css` / `estreUi-main.js` 양쪽을 `C:/Dev/javascript/EstreUI/` 로 동기화. diff 0.

### E — 문서화 — ✅ 완료

[.agent/estreui/dark-mode.en.md](../dark-mode.en.md) / [.agent/estreui/dark-mode.ko.md](../dark-mode.ko.md) 작성. README 인덱스에 §8 "Theming / 테마" 섹션 추가.

## 후속

- **Flash of light mode (FOLM)**: `init()` 이 `$(document).ready()` 안에서 실행되므로 다크 잠금 세션이 첫 페인트에 라이트로 잠깐 깜빡일 수 있다. 해결은 `<head>` 에 인라인 사전 스크립트(`localStorage` 읽고 `body.dataset.darkMode` 사전 셋팅) 를 두는 패턴이지만, EstreUI 본체에는 포함하지 않음. 도입 프로젝트가 `index.html` 에 직접 추가.
- **시스템 알림 (notification) 다크 모드 대응**: 본 항목 완료가 후속 noti 배너 / 오버레이 작업의 색 토큰 기반이 됨.
- **테스트**: 토글 API 와 `applyDarkMode` 동작은 jsdom 에서 검증 가능. `prefers-color-scheme` 자동 추종은 jsdom 의 `matchMedia` 모킹 한계상 별도 모킹 필요.

## 의존성

- 다른 로드맵 항목에 의존하지 않음.
- 시맨틱 색 토큰 시스템(이미 존재) 위에 얹는 작업이므로 추가 인프라 불필요.
