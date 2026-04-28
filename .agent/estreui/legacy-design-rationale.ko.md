# 옛 디자인 근거 — Legacy Design Rationale

> Parallel: [legacy-design-rationale.en.md](legacy-design-rationale.en.md)

소스에 한때 존재했던 **대체된 디자인 스케치** 를 보존하는 문서 — 이전 작성자가 작성했다가 삭제하지 않고 주석 처리하거나 "currently not using" 으로 표시해 둔 코드 경로. 데드 바이트로 프로덕션 파일에 남기는 대신, 그 흔적을 여기로 옮기고 *왜* (그 디자인이 무엇을 시도했고, 프로젝트가 왜 다른 길을 택했는지) 와 함께 보관한다.

본 문서는 **open-items punch list 가 아니다** — 그건 [open-implementation-markers.ko.md](open-implementation-markers.ko.md). 여기 항목들은 시도되었거나 스케치된 후 의도적으로 옆으로 치워진 디자인 흔적이지, 보류된 미완성 작업이 아니다.

항목을 다시 살릴 때는 — 진짜로 그 경로를 부활시킬 때 — 여기 스니펫을 끌어와 소스에 복원하고 본 문서에서는 항목을 제거한다. 영구히 폐기할 때는 항목을 삭제. 본 문서는 살아있는 motivation 만 보관한다.

## 항목

### 1. `./structure/rootmenu` 동적 root tab fetch

**원래 위치**: `scripts/estreUi-main.js`, `initRootbar` 바로 아래. `initRootbar` 끝의 commented-out fetch 호출 + `// === Currently not using` / `// ===========================` sentinel 로 묶인 5개 sibling 메서드 (`renderRootBar`, `buildRootTabItem`, `buildMainSection`, `fetchContent`, `renderContentArea`) 블록. 메서드들은 서로만 참조하고 외부 진입점 없음.

**무엇을 했나**: `./structure/rootmenu<structureSuffix>` (root menu 항목을 기술한 JSON) 을 fetch 해서 root tab bar + main 섹션을 동적으로 빌드 — `<button>` / `<section>` 엘리먼트를 생성해 append. 각 섹션은 다시 자기 콘텐츠 디스크립터 (`esm.direct`) 를 fetch 해서 `<article>` + 핸들별 `.handle_set` placeholder 로 조립.

**왜 옆으로 치워졌나**: EstreUI 의 현 컨벤션은 **선언적 마크업** — root tab 과 섹션을 정적 HTML 로 작성하고 부트 시 `$tabsbar.find(c.c + btn)` 와 `data-tab-id` 속성으로 발견. 동적 fetch 경로는 그 컨벤션 이전의 디자인. 정적 마크업과 JSON 빌드 두 경로를 평행하게 두면 같은 일을 두 가지 방법으로 하게 되고, 하나를 선호할 명확한 이유가 없다 — 프레임워크가 대신 간 방향은 [markup-conventions.ko.md](markup-conventions.ko.md) 참고.

**언제 부활시킬 만한가**: 호스트 프로젝트가 root menu 항목을 서버에서 런타임 결정해야 할 일이 생기면 (테넌트별 메뉴, 권한별 메뉴 가지치기, A/B 테스트 메뉴 구조), 본 스니펫이 출발점 — 기대하는 JSON 형식 (`menu[].id`, `.title`, `.desc`, `.type`, `.home`, `.direct`, `.content.display`) 과 부트 시점의 호출 자리를 알려준다.

**보존된 스니펫**:

```js
// initRootbar 안, 정적 마크업 분기 다음에:
// fetch("./structure/rootmenu" + estreStruct.structureSuffix)
//     .then((response) => {
//         if (response.ok) return response.json();
//         throw Error("[" + response.status + "]" + response.url);
//     })
//     .then((data) => estreUi.renderRootBar(data))
//     .catch((error) => console.log("fetch error: " + error));

// estreUi 객체의 sibling 메서드들:
renderRootBar(esd) {
    this.$rootTabs.empty();
    this.$mainArea.empty();
    var topId = null;
    for (var item of esd.menu) {
        this.$rootTabs.append(this.buildRootTabItem(item));
        this.$mainArea.append(this.buildMainSection(item));
        if (item.type == "static" && item.home) topId = item.id;
    }
    this.$rootTabs = this.$rootbar.find(c.c + btn);

    if (topId != null) {
        this.$rootTabs.filter(aiv(eds.tabId, topId)).attr(eds.active, t1);
    }

    this.$rootTabs.filter(ax(eds.tabId)).click(this.rootTabOnClick);
},

buildRootTabItem(esm) {
    const element = doc.ce(btn);
    element.setAttribute(m.cls, "tp_tiled_btn");
    element.setAttribute("title", esm.desc);
    element.setAttribute(eds.tabId, esm.id);
    element.innerHTML = esm.title;
    return element;
},

buildMainSection(esm) {
    const element = doc.ce(se);
    element.setAttribute(m.cls, "vfv_scroll");
    element.setAttribute("id", esm.id);
    this.fetchContent(esm, element);
    return element;
},

fetchContent(esm, target) {
    return fetch("." + esm.direct + estreStruct.structureSuffix)
        .then((response) => {
            if (response.ok) return response.json();
            throw Error("[" + response.status + "]" + response.url);
        })
        .then((data) => {
            const parts = this.renderContentArea(data);
            for (var part of parts) target.append(part);
        })
        .catch((error) => {
            if (window.isLogging) console.error("fetch error: " + error);
        });
},

renderContentArea(ecm) {
    const set = [];
    const article = doc.ce(ar);
    if (ecm.content.display == "constraint") article.setAttribute(m.cls, "constraint");
    set.push(article);
    for (var handle of handles) {
        const handler = doc.ce(div);
        handler.setAttribute(m.cls, "handle_set " + handle.attach);
        set.push(handler);
    }
    return set;
},
```

**스니펫이 기대했던 외부 의존**: `estreStruct.structureSuffix` (fetch 경로에 붙는 파일명 suffix), 전역 `handles` iterable (`.attach` 셀렉터를 가진 handle 디스크립터들), 그리고 `estreUi-main.js` 의 다른 부분이 이미 쓰고 있는 DOM 헬퍼 (`doc.ce`, `m.cls`, `eds.tabId`, `c.c + btn` 등). 부활 시 각각이 여전히 같은 형태로 존재하는지 확인.
