# #010 — timeline (overwatchPanel 내)

- **우선순위**: 🟡 보통
- **분류**: 컴포넌트
- **상태**: 🕒 대기

## 배경

[overwatchPanel.html](../../../overwatchPanel.html) 의 `#timeline` 블록은 현재 마크업 슬롯만 예약된 상태 (`<!-- Timeline slot: markup reserved in roadmap #008. Implementation scheduled separately. -->`). [#008 퀵패널](008-quick-panel.md) 의 tab 스왑/슬라이딩으로 이미 진입점은 확보되어 있다 — 본 항목은 이 슬롯을 iOS 알림센터 스타일의 타임라인으로 채운다.

[#009 noti() 배너](009-noti-banner.md) 가 본 항목과 데이터 스키마 · 시각 컴포넌트를 공유하는 것이 전제. noti 가 **사라진 뒤 영구 기록**되는 히스토리 뷰가 timeline 의 1차 역할이다.

## 범위

### 데이터 스키마 · 저장

- timeline entry 스키마 = #009 의 noti `options` 스키마와 호환 (title, body, subtitle, icon, largeIcon, data, url, buttons, timestamp, …).
- 저장소: `localStorage` 또는 `NativeStorage` (`scripts/estreUi-notation.js` 의 `NativeStorage` 참고). 선택 근거는 Phase A 에서 결정.
- 보존 정책(개수 상한, TTL) — Phase A.
- noti() 큐에서 `checkOut(intent)` 시 timeline store 에 append (연동 훅을 #009 Phase B 에 넣거나, timeline 이 `EstreNotificationManager` 이벤트를 구독).

### 렌더링 · 컴포넌트 재사용

- 리스트 아이템 시각 = #009 의 배너 컴포넌트 재사용 (`noti-banner.css` / DOM 빌더 공용화).
- 그룹핑: 날짜 헤더(오늘 / 어제 / ...), 또는 앱별/카테고리별 그룹 (iOS 알림센터 패턴). Phase A 에서 결정.
- 빈 상태 (timeline 비어있음) 메시지.

### 인터랙션 — iOS 레퍼런스

- 항목 탭 → `url` / `onTakeInteraction` 트리거.
- 스와이프 좌측(혹은 좌우) → 삭제 / 해제.
- (선택) Pull-to-refresh, Load-older.

### overwatchPanel 통합

- [.dynamic_section_block](../../../styles/estreUiCore.css#L139) 내 `#timeline` block_item 을 스크롤 리스트로 채움.
- 기존 block 의 `overflow-y: auto` 를 그대로 사용 — tab 슬라이딩(가로)와 리스트 스크롤(세로) 분리.
- 다크 모드 자동 대응 (토큰만 사용).

## 단계

### A — 설계

- entry 스키마 확정 (noti 와 공유하는 키 집합 명시).
- 저장소 선택 (localStorage vs NativeStorage) + 보존 정책.
- 리스트 그룹핑/정렬 전략.
- noti → timeline 저장 연동 포인트 (`checkOut()` 훅 또는 manager 이벤트).
- 공용 배너 DOM 빌더의 시그니처.

### B — 구현

- timeline store 클래스 (`EstreTimelineStore`) + noti 연동.
- `#timeline` block_item 내부 리스트 렌더링 + 그룹 헤더.
- 항목 스와이프 삭제, 탭 인터랙션.
- 빈 상태 UI.

### C — 문서화

`.agent/estreui/timeline.en.md` / `.ko.md` 신규. README 인덱스 갱신. `noti-banner.{en,ko}.md` 와 공유 스키마 크로스링크. [#008 퀵패널](008-quick-panel.md) 문서에서 timeline 탭 참조를 "구현됨" 으로 갱신.

## 의존성

- **[#009 noti() 배너](009-noti-banner.md)** — 데이터 스키마 · 시각 컴포넌트의 소스. **선행 필수**.
- **[#008 퀵패널](008-quick-panel.md)** ✅ — overwatchPanel 진입 경로와 tab 구조.
- **`NativeStorage`** — 네이티브 앱에서 실행 시 저장소 경로 후보.
