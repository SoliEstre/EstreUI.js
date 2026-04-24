# Service Worker & 오프라인 캐싱

> **범위:** `serviceWorker.js` (업스트림 골격, 프로젝트별 자산 목록 커스터마이즈) + `boot.js` `serviceWorkerHandler` (업스트림).

EstreUI는 계층적 캐싱 전략을 갖춘 Service Worker 구성과, 메인 스레드에서 SW 라이프사이클을 관리하는 `serviceWorkerHandler` 객체(`boot.js`)를 제공한다.

---

## 1. 아키텍처 개요

```
┌─────────────────────────────────────────────────────┐
│  메인 스레드 (boot.js)                               │
│                                                     │
│  serviceWorkerHandler                               │
│    ├─ SW 등록                                        │
│    ├─ 라이프사이클 콜백 (install → wait → active)      │
│    ├─ postMessage / sendRequest ↔ response           │
│    └─ 캐시 관리 API (clear*, getVersion)              │
│                                                     │
├────────────── postMessage 채널 ─────────────────────┤
│                                                     │
│  Service Worker 스레드 (serviceWorker.js)             │
│    ├─ install  → 계층별 파일 목록 프리캐시              │
│    ├─ activate → 이전 캐시 제거                       │
│    ├─ fetch    → 알려진 자산에 캐시 우선 응답           │
│    └─ message  → 제어 명령 응답                       │
└─────────────────────────────────────────────────────┘
```

---

## 2. 계층적 캐시 전략

SW는 캐시 자산을 네 계층으로 분류하며, 각각 고유한 캐시 이름과 갱신 주기를 갖는다:

| 계층 | 캐시 이름 패턴 | 내용 | 갱신 빈도 |
| --- | --- | --- | --- |
| **Application** | `<appVer>/<swVer>-r<date>` | 섹션 export HTML, 앱 CSS, 앱 JS | 매 배포 |
| **Common** | `common-files-cache-v<N>-<date>` | index.html, manifest, EstreUI 코어 CSS/JS, 업스트림 라이브러리 | 드물게 |
| **Static** | `static-files-cache-v<N>-<date>` | 문서, 폰트, 서드파티 라이브러리, 이미지, 벡터, 로티 | 매우 드물게 |
| **Stony** | `stony-files-cache-v<N>-<date>` | 대용량/거의 변경 없는 자산 (이모지 폰트, 추가 폰트) | 극히 드물게 |

### Install 동작

```js
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.keys().then(async keyList => {
            // 해당 키가 아직 없는 계층만 캐시
            if (!keyList.includes(CACHE_NAME_COMMON_FILES))
                await cache.addAll(COMMON_FILES_TO_CACHE);
            if (!keyList.includes(CACHE_NAME_STATIC_FILES))
                await cache.addAll(STATIC_FILES_TO_CACHE);
            if (!keyList.includes(CACHE_NAME_BY_VERSION))
                await cache.addAll(FILES_TO_CACHE);
            // Stony 계층은 fire-and-forget (await 안 함)
            if (!keyList.includes(CACHE_NAME_STONY_FILES))
                /* async */ cache.addAll(STONY_FILES_TO_CACHE);
        })
    );
});
```

핵심 포인트:
- Application, Common, Static 계층은 await — 캐시 완료 전까지 SW가 활성화되지 않음.
- Stony 계층은 fire-and-forget — 대용량 폰트 파일이 활성화를 차단하지 않고 백그라운드에서 캐시.
- 캐시 이름에 버전 문자열 포함; 버전 상수 변경 시 다음 install에서 재캐시 트리거.

### Activate 동작

활성화 시, 현재 네 계층의 캐시 이름과 일치하지 않는 모든 캐시를 삭제한다. 구버전 캐시가 자동으로 정리된다.

### Fetch 동작

세 갈래 라우팅:

1. **항상 최신 목록** — `CHECK_ALWAYS_NEWER_FILE_LIST`의 파일(예: SW 스크립트 자체)은 항상 네트워크에서 가져오고, 오류 시 캐시 폴백.
2. **토큰 경로 인터셉트** — URL에 `/|` 또는 `/%7C`(Doctre 토큰 패턴)가 포함되면 빈 200 응답 반환 (불필요한 네트워크 요청 방지).
3. **알려진 자산** — 네 파일 목록에 포함된 URL은 캐시 우선 응답. 캐시 미스 시 네트워크 fetch, 오류 시 캐시 폴백.
4. **미등록 URL** — 네트워크로 통과 (인터셉트 안 함).

---

## 3. `serviceWorkerHandler` (boot.js)

메인 스레드 측 대응부는 `boot.js`에 일반 객체로 존재한다.

### 프로퍼티

| 프로퍼티 | 설명 |
| --- | --- |
| `.registeration` | `ServiceWorkerRegistration` 참조. |
| `.installing` / `.waiting` / `.activating` / `.activated` | 라이프사이클 단계별 워커 참조. |
| `.service` | `navigator.serviceWorker` 바로가기. |
| `.controller` | `navigator.serviceWorker.controller` 바로가기. |
| `.worker` | 가용한 최적 워커: `controller ?? activated ?? activating ?? waiting ?? installing`. |
| `.isInitialSetup` | 첫 SW 설치(이전 active 워커 없음)이면 `true`. |

### 라이프사이클 콜백

setter 메서드로 리스너 등록:

```js
serviceWorkerHandler.setOnWaitingListener(worker => {
    // 새 버전이 활성화 대기 중
});

serviceWorkerHandler.setOnActivatedNewerListener(worker => {
    // 최신 SW가 방금 활성화 — 새로고침 필요할 수 있음
});

serviceWorkerHandler.setOnControllerChangeListener(event => {
    // 컨트롤러 변경 — 앱이 새 SW에 의해 서비스됨
});
```

| setter | 발화 시점 |
| --- | --- |
| `setOnInstallingListener` | 새 SW 설치 시작. |
| `setOnWaitingListener` | 새 SW 설치 완료 후 대기 상태. |
| `setOnUpdatedListener` | `updatefound` 발생 후 새 워커가 `installed` 도달. |
| `setOnActivatingListener` | SW가 `activating` 상태 진입. |
| `setOnActivatingNewerListener` | *최신* SW가 `activating` 진입 (첫 설치 아님). |
| `setOnActivatedListener` | SW가 `activated` 상태 진입. |
| `setOnActivatedNewerListener` | *최신* SW가 `activated` 진입. |
| `setOnControllerChangeListener` | `navigator.serviceWorker.oncontrollerchange` 발화. |

### 요청/응답 메시징

시퀀스 번호 기반 `postMessage` 프로토콜 사용:

```js
// fire-and-forget
serviceWorkerHandler.postMessage(worker, { type: "SKIP_WAITING" });

// 콜백 방식
serviceWorkerHandler.sendRequest("getVersion", {}, version => {
    console.log("SW version:", version);
});

// Promise 방식
const version = await serviceWorkerHandler.sendRequestForWait("getVersion");
```

### 캐시 관리 API

| 메서드 | 설명 |
| --- | --- |
| `clearCache()` | 애플리케이션(버전) 캐시 삭제. |
| `clearCommonCache()` | 공통 캐시 삭제. |
| `clearStaticCache()` | 정적 캐시 삭제. |
| `clearStonyCache()` | stony 캐시 삭제. |
| `clearAllCaches()` | 모든 캐시 삭제. |
| `getVersion()` | 현재 SW 버전 문자열 조회. |
| `getVersionWaiting()` | 대기 중인 워커의 버전 조회. |
| `getApplicationCount()` | 제어 중인 클라이언트 윈도우 수 조회. |

### SW 제어

| 메서드 | 설명 |
| --- | --- |
| `skipWaiting(worker?)` | 대기 중인 워커에 즉시 활성화 지시. |
| `clientsClaim(worker?)` | 활성 워커에 모든 클라이언트 접수 지시. |
| `update()` | 수동 SW 업데이트 확인 트리거. 새 워커 또는 `false` 반환. |

---

## 4. 메시지 프로토콜

메인 스레드와 SW 간 메시지는 다음 패턴을 따른다:

**메인 → SW:**
```js
{ type: "commandName", sequence: 42, content: { ... } }
```

**SW → 메인:**
```js
{ type: "worked", request: 원본메시지, response: 결과 }
```

지원하는 SW 메시지 타입:

| 타입 | 동작 | 응답 |
| --- | --- | --- |
| `SKIP_WAITING` | `self.skipWaiting()` | — (응답 없음) |
| `CLIENTS_CLAIM` | `self.clients.claim()` | — (응답 없음) |
| `clearCache` | 버전 캐시 삭제 | `true`/`false` |
| `clearCommonCache` | 공통 캐시 삭제 | `true`/`false` |
| `clearStaticCache` | 정적 캐시 삭제 | `true`/`false` |
| `clearStonyCache` | stony 캐시 삭제 | `true`/`false` |
| `clearAllCaches` | 모든 캐시 삭제 | 결과 배열 |
| `getVersion` | 버전 문자열 반환 | `"x.y.z/a.b.c-rDate"` |
| `getApplicationCount` | 제어 윈도우 수 반환 | 숫자 |

---

## 5. 등록 흐름

`boot.js`에서 `serviceWorkerHandler.init()` 이후:

```
  navigator.serviceWorker.register("./scripts/serviceWorker.js", {
      scope: "/",
      updateViaCache: "none"
  })
        ↓
  registration.installing → onInstalling 콜백
  registration.waiting   → onWaiting 콜백 (+ 자동 skipWaiting)
  registration.active    → onActivated 콜백
        ↓
  registration.addEventListener("updatefound")
        ↓
  newWorker.addEventListener("statechange")
    → "installed" → onUpdated + onWaiting (controller 존재 시)
    → "activating" → onActivating (isNewer=true)
    → "activated" → onActivated (isNewer=true)
```

기본 흐름에서 대기 중인 워커에 자동으로 `skipWaiting()`을 호출하므로, 새 버전이 페이지 새로고침 없이 즉시 활성화된다.

---

## 6. 디버그 플래그

`boot.js`와 `serviceWorker.js` 모두 같은 로깅 패턴 사용:

| 플래그 | 설명 |
| --- | --- |
| `isLog` | 기본 로깅 플래그 (기본값 `true`). |
| `isDebug` | 호스트가 프로덕션과 다르면 자동 `true`. |
| `isLogging` | `isLog \|\| isDebug` — 대부분의 콘솔 출력 게이트. |
| `isVerbosely` | `isDebug && isVerbose` — 상세 객체 덤프 게이트. |

---

## 7. 커스터마이즈 포인트

새 프로젝트에 SW를 적용할 때:

1. **`FILES_TO_CACHE`** — 프로젝트별 HTML export, CSS, JS 파일로 갱신. 캐시 이름에 버전 부여.
2. **`COMMON_FILES_TO_CACHE`** — 업스트림 라이브러리와 EstreUI 코어 자산 추가/제거.
3. **`STATIC_FILES_TO_CACHE`** — 프로젝트 이미지, 벡터, 폰트, 서드파티 라이브러리.
4. **`STONY_FILES_TO_CACHE`** — 대용량, 거의 변경 없는 자산 (이모지 폰트, 추가 폰트 패밀리).
5. **`CHECK_ALWAYS_NEWER_FILE_LIST`** — 항상 네트워크 우선으로 가져올 파일.
6. **`HOST`** — 프로덕션 호스트명 (디버그 플래그 자동 감지용).

---

## 8. 신규 자산 등록 체크리스트 (릴리스 시)

**원칙**: 프레임워크 또는 앱에 새 HTML 템플릿·JS 모듈·CSS 파일이 추가되면, 같은 커밋(또는 늦어도 다음 릴리스 커밋) 에서 `serviceWorker.js` 의 파일 목록 배열에도 등록한다. 등록이 누락되면 PWA **콜드 오프라인 시 해당 자산이 빠진 채 설치**돼 기능이 조용히 깨진다 — 런타임 에러가 아니라 "특정 경로에서만 재현되는" 성격이라 디버깅이 늦어진다.

### 등록 대상 매트릭스

| 자산 유형 | 추가할 배열 | `index.html` 쪽 짝 |
| --- | --- | --- |
| 새 export HTML 템플릿 (새 섹션 슬롯) | `INSTALLATION_FILE_LIST` | `<link rel="preload" as="fetch" type="text/html" href="./foo.html">` |
| 새 JS 모듈 (`scripts/estreUi-*.js` 등 프레임워크 레이어) | `COMMON_FILES_TO_CACHE` | `<script defer type="text/javascript" src="./scripts/foo.js">` |
| 새 CSS 파일 (`styles/estreUi*.css`) | `COMMON_FILES_TO_CACHE` | `<link rel="stylesheet" href="./styles/foo.css">` |
| 새 이미지·폰트·벡터 | `STATIC_FILES_TO_CACHE` 또는 `STONY_FILES_TO_CACHE` | 크기·변경 빈도로 계층 결정 |
| 앱 전용 export / CSS / JS | `FILES_TO_CACHE` (프로젝트 버전 캐시) | 각 앱의 해당 로드 지점 |

### 빠른 검증

릴리스 직전 `index.html` 의 로드 줄과 SW 목록을 교차 비교:

```bash
# index.html 이 로드하는 로컬 HTML / JS / CSS 추출
grep -oE '\./[a-zA-Z_-]+\.html'          index.html | sort -u
grep -oE '\./scripts/[a-zA-Z0-9_-]+\.js' index.html | sort -u
grep -oE '\./styles/[a-zA-Z0-9_-]+\.css' index.html | sort -u

# serviceWorker.js 의 각 배열 상수와 diff — 차이가 있으면 누락
```

### 지나간 사례

- **v1.3.0** — [roadmap #008 퀵패널](roadmap/008-quick-panel.md) 작업에서 새로 만든 `overwatchPanel.html` 이 `index.html` preload 까지는 반영됐으나 `INSTALLATION_FILE_LIST` 에 빠져 있었음. 허브 릴리스 검토 중 발견돼 릴리스 커밋에 같이 포함해 보정 (`5a2a702`).
- **v1.4.0** — [roadmap #009 noti 배너](roadmap/009-noti-banner.md) 작업에서 새 파일 `scripts/estreUi-notification.js` 가 `index.html` `<script>` 까지는 반영됐으나 `COMMON_FILES_TO_CACHE` 에 빠져 있었음. 동일 패턴. 릴리스 커밋에 포함해 보정.

두 건 모두 동일 구조 — **신규 파일이 `index.html` 로드 지점까지는 들어갔지만 SW 캐시 목록에는 누락**. 기능 구현 커밋에서 SW 는 건드리지 않는 습관이 원인. 릴리스 시 위 "빠른 검증" 한 번으로 재발 방지 가능.

### 릴리스 원자 커밋 구성

표준 릴리스 커밋(`chore: release vX.Y.Z`) 의 최소 구성은 `package.json` + `serviceWorker.js`(버전 마커 + 캐시 이름 날짜 갱신) 두 파일. 위 검증에서 누락이 발견되면 **같은 커밋에 파일 목록 배열 추가**도 포함 — 릴리스 커밋이 해당 버전의 자산 목록과 일관되어야 하므로 별도 follow-up 으로 분리하지 않는다.
