# 미구현 마커 모음

> Parallel: [open-implementation-markers.en.md](open-implementation-markers.en.md)

프레임워크 코드 내에 남아 있는 TODO 성격의 마커 (`// <= ...`, `// 추후...`, 의도된 placeholder 가 아닌 `// to do implement`) — **보류된 / 부분 구현된** 동작 자리. 정리 작업의 punch list 로 활용하고, "나중에 다시 손볼 거" 가 누락되지 않도록 가드용으로 둔다.

> 본 문서 범위 외:
> - **추상-스타일 placeholder** — `EstreVoidCalendarStructure` / `EstreSimpleCalendarStructure` (`scripts/estreUi-handles.js` 1240, 1278–1322). 서브클래스가 채울 의도된 빈 메서드라 보류 작업 아님.
> - **호스트 프로젝트 출발용 마커** — `scripts/main.js:398` (`//<= to do implement my own initializing`) 같은 것은 도입 프로젝트가 채울 템플릿 자리.

## 마커

### 1. `estreUi-handles.js:6366` — switch 후행 케이스 자리

```js
// scripts/estreUi-handles.js — stock 핸들의 option-toast 클릭 분기 내부
try {
    const parsed = JSON.parse(options);
    toastOption(this.dataset.toastTitle ?? "", this.dataset.toastMessage ?? "", parsed, (index, value) => this.onselected?.(index, value));
} catch (e) {
    if (window.isLogging) console.error(e);
}
break;

// <= 케이스 추가 구현
```

`switch` 한 arm 의 `break;` 직후 마커. "여기 케이스 더 추가 예정" 의미. 어떤 케이스가 빠진다는 명시적 목록은 없고 슬롯만 예약. toast 바인드 옵션 디스패처에 새 옵션 종류를 추가할 때 이 자리.

### 2. `estreUi-main.js:1102` — 이미 활성인 탭 재선택

```js
// scripts/estreUi-main.js — 루트 탭 클릭 디스패처 내부
if ($target.attr(eds.active) == t1) {
    //do nothing //추후 방향에 따라 섹션 새로고침 등 구현
} else {
    $target.attr(eds.active, t1);
}
```

사용자가 **이미 활성인** 루트 탭을 누르면 현재는 no-op. 보류된 의도: 사용자 제스처 방향 (예: 위에서 아래 탭 → 맨 위로 스크롤, 스크롤된 상태에서 탭 → 새로고침) 에 따라 섹션을 새로 고치는 동작. 활성 탭을 다시 누르면 리스트 맨 위로 가고, 한 번 더 누르면 새로고침되는 iOS 패턴과 비슷한 방향.

기본 no-op 도 baseline 으로 수용 가능. 구현 시 주변 핸들러 형태를 건드리지 않고 이 자리에 끼워 넣으면 됨.

## 유지보수

마커를 해소하면 **같은 커밋에서 본 파일에서 항목을 제거**한다. 새로 보류 마커를 코드에 추가했다면 여기에 항목도 추가해서 미래의 자신 (및 다음 에이전트) 이 grep 없이 찾을 수 있도록. 항목은 간결하게 — 파일:라인 + 의도 한 단락 + 코드 발췌.
