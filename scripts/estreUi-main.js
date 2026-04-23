/*
    EstreUI rimwork — estreStruct, estreUi singleton, DOM init
    Part of the split from estreUi.js (roadmap #002 phase 2).

    This file is loaded as a plain <script> tag and shares the global scope
    with the other estreUi-*.js files. Load order matters: see index.html.
*/

// MODULE: Main -- estreStruct, estreUi singleton, DOM initialization
// ======================================================================



const estreStruct = {
    structureSuffix: ".json",
}

const estreUi = {

    //constant
    overlaySections: {},
    overlaySectionList: [],

    blindSections: {},
    blindSectionList: [],

    mainSections: {},
    mainSectionList: [],

    menuSections: {},
    menuSectionList: [],
    get menuArea() { return this.menuSections["menuArea"]; },

    panelSections: {},
    panelSectionList: [],
    get quickPanel() { return this.panelSections["quickPanel"]; },
    get timeline() { return this.panelSections["timeline"]; },

    headerSections: {},
    headerSectionList: [],
    get appbar() { return this.headerSections["appbar"]; },


    //static property
    overlayCurrentOnTop: null,
    blindedCurrentOnTop: null,
    mainCurrentOnTop: null,
    menuCurrentOnTop: null,
    panelCurrentOnTop: null,
    headerCurrentOnTop: null,

    //static getter
    get currentTopComponent() {
        return this.blindedCurrentOnTop ?? (this.isOpenMainMenu ? this.menuCurrentOnTop : null) ?? this.mainCurrentOnTop;
    },
    get currentTopPage() {
        return this.currentTopComponent?.currentTop?.currentTop;
    },
    get currentTopPid() {
        return EstreUiPage.from(this.currentTopPage)?.pid;
    },


    get showingOverlayTopArticle() {
        const currentTopArticle = this.overlayCurrentOnTop?.currentTop?.currentTop;
        if (currentTopArticle != null && currentTopArticle.isShowing) return currentTopArticle;
    },

    get showingBlindedTopArticle() {
        const currentTopArticle = this.blindedCurrentOnTop?.currentTop?.currentTop;
        if (currentTopArticle != null && currentTopArticle.isShowing) return currentTopArticle;
    },

    get showingMenuTopArticle() {
        if (this.isOpenMainMenu) {
            const currentTopArticle = this.menuCurrentOnTop?.currentTop?.currentTop;
            if (currentTopArticle != null && currentTopArticle.isShowing) return currentTopArticle;
        }
    },

    get showingMainTopArticle() {
        const currentTopArticle = this.mainCurrentOnTop?.currentTop?.currentTop;
        if (currentTopArticle != null && currentTopArticle.isShowing) return currentTopArticle;
    },

    get showingTopArticle() {
        return this.showingOverlayTopArticle ?? this.showingBlindedTopArticle ?? this.showingMenuTopArticle ?? this.showingMainTopArticle;
    },


    //elements
    $fixedBottom: null,
    $tabsbar: null,
    $rootbar: null,
    $rootTabs: null,

    $overlayArea: null,
    get $overlaySections() { return this.$overlayArea.find(c.c + se); },
    
    $blindArea: null,
    get $blindSections() { return this.$blindArea.find(c.c + se); },

    $mainArea: null,
    get $mainSections() { return this.$mainArea.find(c.c + se); },
    
    $mainMenu: null,
    get $menuSections() { return this.$mainMenu.find(c.c + se); },
    $menuArea: null,
    $grabArea: null,

    $overwatchPanel: null,
    get $panelSections() { return this.$panelBlock?.find(c.c + se + uis.blockItem) ?? $(); },
    $panelHeader: null,
    $panelHost: null,
    $panelBlock: null,
    $panelClock: null,
    $panelDate: null,
    $panelGrabArea: null,
    $panelTrigger: null,

    $fixedTop: null,
    get $headerSections() { return this.$fixedTop.find(c.c + se); },
    $appbar: null,
    $homeBtn: null,
    $mainMenuBtn: null,
    $mainMenuBtnLottie: null,

    $more: null,
    $sessionManager: null,
    $sessionGroupHolder: null,
    $fixedPages: null,
    $fixedPageList: null,
    $openedPages: null,
    $openedPageList: null,

    $handlePrototypes: null,

    //handles
    menuSwipeHandler: null,
    panelOpenSwipeHandler: null,
    panelCloseSwipeHandler: null,
    panelClockTimeoutId: null,
    panelClockIntervalId: null,
    darkModeMql: null,

    //properties
    euiState: "exit",
    initialHistoryOffset: null,
    isBackwardFlow: false,


    prevRootTabIds: new Set(),
    get latestRootTabId() { return [...this.prevRootTabIds].pop(); },
    get prevRootTabId() {
        const rootTabIds = this.mainSections.ways;
        let latestRootTabId = null;
        while (latestRootTabId = this.latestRootTabId) {
            this.prevRootTabIds.delete(latestRootTabId);
            if (rootTabIds.includes(latestRootTabId)) return latestRootTabId;
        }
        return null;
    },
    set prevRootTabId(id) {
        if (id == null) return;
        if (this.prevRootTabIds.has(id)) this.prevRootTabIds.delete(id);
        this.prevRootTabIds.add(id);
    },

    prevBlindedIds: new Set(),
    get latestBlindedId() { return [...this.prevBlindedIds].pop(); },
    get prevBlindedId() {
        const blindedIds = this.blindSections.ways;
        let latestBlindedId = null;
        while (latestBlindedId = this.latestBlindedId) {
            this.prevBlindedIds.delete(latestBlindedId);
            if (blindedIds.includes(latestBlindedId)) return latestBlindedId;
        }
        return null;
    },
    set prevBlindedId(id) {
        if (id == null) return;
        if (this.prevBlindedIds.has(id)) this.prevBlindedIds.delete(id);
        this.prevBlindedIds.add(id);
    },


    //getter and setter
    get isOpenMainMenu() { return this.$mainMenu.attr(eds.opened) == t1; },

    get isOpenOverwatchPanel() { return this.$overwatchPanel.attr(eds.opened) == t1; },

    get darkMode() {
        const stored = localStorage.getItem("estreUi.darkMode");
        if (stored == "1") return true;
        if (stored == "0") return false;
        return null;
    },
    get isDarkMode() { return document.body.dataset.darkMode == t1; },



    //links (object redirection)
    get unifiedCalendar() { return this.mainSections.calendar.containers.root.articles.main.handles[uis.unifiedCalendar][0]; },
    get stockCalendar() { return this.unifiedCalendar.calendar; },
    get stockScheduler() { return this.unifiedCalendar.scheduler; },

    //inits
    init(setOnReady = true) {
        EstreHandle.commit();
        EstreUiPage.commit();
        scheduleDataSet.commit();

        this.$blindArea = $("main#instantDoc");
        
        this.$mainArea = $("main#staticDoc");
        
        this.$overlayArea = $("nav#managedOverlay");

        this.$mainMenu = $("nav#mainMenu");

        this.$overwatchPanel = $("nav#overwatchPanel");
        this.$panelTrigger = $("section#panelTrigger");

        this.$fixedTop = $("header#fixedTop");

        this.$fixedBottom = $("#fixedBottom");

        this.$handlePrototypes = $("section#handlePrototypes");

        
        // events
        this.setReload();
        this.setBackNavigation();
        this.setMenuSwipeHandler();
        this.setupDarkMode();


        const onLoadedFixedBottom = async _ => {
            this.$tabsbar = this.$fixedBottom.find(".tabsbar");
            this.$rootbar = this.$fixedBottom.find("nav#rootbar");
            this.initRootbar();
        }

        const onLoadedFixedTop = subTerm => {
            this.$appbar = this.$fixedTop.find("section#appbar");
            this.$homeBtn = this.$appbar.find("button#home");
            this.$mainMenuBtn = this.$appbar.find("button#mainMenuBtn");
            this.$mainMenuBtnLottie = this.$mainMenuBtn.find(uis.dotlottiePlayer);

            this.$mainMenuBtn.click(this.mainMenuBtnOnClick);
            return this.initHeaderBars(subTerm);
        }

        const onLoadedStaticDoc = subTerm => {
            return this.initStaticContents(subTerm);
        }

        const onLoadedInstantDoc = subTerm => {
            return this.initInstantContents(subTerm);
        }

        const onLoadedManagedOverlay = subTerm => {
            return this.initOverlayContents(subTerm);
        }

        const onLoadedMainMenu = subTerm => {
            this.$menuArea = this.$mainMenu.find("section#menuArea");
            this.$grabArea = this.$mainMenu.find("section#grabArea");

            this.$grabArea.click(this.mainMenuGrabAreaOnclick);
            return this.initStaticMenus(subTerm);
        }

        const onLoadedOverwatchPanel = subTerm => {
            this.$panelHeader = this.$overwatchPanel.find("header#panelHeader");
            this.$panelHost = this.$overwatchPanel.find(uis.dynamicSectionHost);
            this.$panelBlock = this.$overwatchPanel.find(uis.dynamicSectionBlock);
            this.$panelClock = this.$panelHeader.find("#panelClock");
            this.$panelDate = this.$panelHeader.find("#panelDate");
            this.$panelGrabArea = this.$overwatchPanel.find("section#panelGrabArea");

            this.$panelGrabArea.click(this.overwatchPanelGrabAreaOnclick);
            this.setPanelSwipeHandler();
            this.scheduleOverwatchPanelClock();
            return this.initStaticPanels(subTerm);
        }


        const loadExported = url => fetch(url).then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        });


        let loadExportedFixedBottom;
        loadExportedFixedBottom = (_, attempt = 0) => loadExported("fixedBottom.html").then(htmlContent => {
            this.$fixedBottom.prepend(htmlContent);
            return onLoadedFixedBottom();
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for fixedBottom: ", error);
            console.log(`Retrying to load fixedBottom in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedFixedBottom(_, attempt + 1));
        });

        let loadExportedFixedTop;
        loadExportedFixedTop = (subTerm, attempt = 0) => loadExported("fixedTop.html").then(htmlContent => {
            this.$fixedTop.prepend(htmlContent);
            return onLoadedFixedTop(subTerm);
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for fixedTop: ", error);
            console.log(`Retrying to load fixedTop in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedFixedTop(subTerm, attempt + 1));
        });

        let loadExportedStaticDoc;
        loadExportedStaticDoc = (subTerm, attempt = 0) => loadExported("staticDoc.html").then(htmlContent => {
            this.$mainArea.prepend(htmlContent);
            return onLoadedStaticDoc(subTerm);
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for staticDoc: ", error);
            console.log(`Retrying to load staticDoc in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedStaticDoc(subTerm, attempt + 1));
        });

        let loadExportedInstantDoc;
        loadExportedInstantDoc = (subTerm, attempt = 0) => loadExported("instantDoc.html").then(htmlContent => {
            this.$blindArea.prepend(htmlContent);
            return onLoadedInstantDoc(subTerm);
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for instantDoc: ", error);
            console.log(`Retrying to load instantDoc in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedInstantDoc(subTerm, attempt + 1));
        });

        let loadExportedManagedOverlay;
        loadExportedManagedOverlay = (subTerm, attempt = 0) => loadExported("managedOverlay.html").then(htmlContent => {
            this.$overlayArea.prepend(htmlContent);
            return onLoadedManagedOverlay(subTerm);
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for managedOverlay: ", error);
            console.log(`Retrying to load managedOverlay in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedManagedOverlay(subTerm, attempt + 1));
        });

        let loadExportedMainMenu;
        loadExportedMainMenu = (subTerm, attempt = 0) => loadExported("mainMenu.html").then(htmlContent => {
            this.$mainMenu.prepend(htmlContent);
            return onLoadedMainMenu(subTerm);
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for mainMenu: ", error);
            console.log(`Retrying to load mainMenu in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedMainMenu(subTerm, attempt + 1));
        });

        let loadExportedOverwatchPanel;
        loadExportedOverwatchPanel = (subTerm, attempt = 0) => loadExported("overwatchPanel.html").then(htmlContent => {
            this.$overwatchPanel.prepend(htmlContent);
            return onLoadedOverwatchPanel(subTerm);
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for overwatchPanel: ", error);
            console.log(`Retrying to load overwatchPanel in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedOverwatchPanel(subTerm, attempt + 1));
        });

        let loadExportedStockHandlePrototypes;
        loadExportedStockHandlePrototypes = (_, attempt = 0) => loadExported("stockHandlePrototypes.html").then(htmlContent => {
            this.$handlePrototypes.prepend(htmlContent);
            return true;
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for stockHandlePrototypes: ", error);
            console.log(`Retrying to load stockHandlePrototypes in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedStockHandlePrototypes(_, attempt + 1));
        });

        let loadExportedCustomHandlePrototypes;
        loadExportedCustomHandlePrototypes = (_, attempt = 0) => loadExported("customHandlePrototypes.html").then(htmlContent => {
            this.$handlePrototypes.append(htmlContent);
            return true;
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for customHandlePrototypes: ", error);
            console.log(`Retrying to load customHandlePrototypes in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedCustomHandlePrototypes(_, attempt + 1));
        });


        //common element initializing
        const term = 1;//isIPhone ? 1000 : 1;
        const subTerm = 0;//isIPhone ? 200 : 0;
        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        return postAsyncQueue(async _ => {
            // await delayer();
            const handlePrototypesLoader = [];
            if (this.$handlePrototypes.attr(eds.exported) == t1) {
                handlePrototypesLoader.push(loadExportedStockHandlePrototypes());
                handlePrototypesLoader.push(loadExportedCustomHandlePrototypes());
            }
            await Promise.all(handlePrototypesLoader);

            pageManager.init();

            const topBottomLoader = [
                this.$fixedBottom.attr(eds.exported) == t1 ? loadExportedFixedBottom() : onLoadedFixedBottom(),
                this.$fixedTop.attr(eds.exported) == t1 ? loadExportedFixedTop(subTerm) : onLoadedFixedTop(subTerm),
            ];

            const mainLoader = [
                this.$overlayArea.attr(eds.exported) == t1 ? loadExportedManagedOverlay(subTerm) : onLoadedManagedOverlay(subTerm),
                postAsyncQueue(async _ => {
                    await Promise.all(topBottomLoader);
                    return await (this.$mainArea.attr(eds.exported) == t1 ? loadExportedStaticDoc(subTerm) : onLoadedStaticDoc(subTerm));
                }),
                this.$blindArea.attr(eds.exported) == t1 ? loadExportedInstantDoc(subTerm) : onLoadedInstantDoc(subTerm),
            ];

            await Promise.all(mainLoader);

            await (this.$mainMenu.attr(eds.exported) == t1 ? loadExportedMainMenu(subTerm) : onLoadedMainMenu(subTerm));
            await (this.$overwatchPanel.attr(eds.exported) == t1 ? loadExportedOverwatchPanel(subTerm) : onLoadedOverwatchPanel(subTerm));

            this.initSessionManager();

            
            // $("#splashRoot").css("z-index", null);

            window.addEventListener("focus", (e) => {
                // note("onFocus");
                this.onFocus();
            });
            window.addEventListener("blur", (e) => {
                // note("onBlur");
                this.onBlur();
            });

            // C (roadmap #006) — visibilitychange routes to onFocus/onBlur.
            // More reliable on mobile browsers than window focus/blur, especially
            // on Android WebView where native focus changes may not surface as JS events.
            // Idempotent via the pageHandle.isFocused guard, so duplication with
            // window focus/blur is harmless.
            document.addEventListener("visibilitychange", () => {
                if (window.isDebug) console.log(`[visibilitychange] state=${document.visibilityState} hasFocus=${document.hasFocus()}`);
                if (document.visibilityState === "visible") this.onFocus();
                else this.onBlur();
            });

            // A (roadmap #006) — track lastFocusedElement on the topmost showing handle.
            // focusin bubbles (unlike blur), so a single document-level capture covers
            // every page. Used by phase B's autoFocus to restore the prior focus point.
            document.addEventListener("focusin", (e) => {
                const topHandle = this.showingTopArticle ?? this.mainCurrentOnTop;
                if (topHandle != null && topHandle.host?.contains(e.target)) {
                    topHandle.lastFocusedElement = e.target;
                }
            }, true);

            if (setOnReady) this.checkOnReady();
        });
    },

    setReload() {
        const inst = this;
        $(window).on("keydown", function (e) {
            if ((e.which || e.keyCode) == 116) {
                if (!e.ctrlKey) {
                    e.preventDefault();
                    inst.onReload();
                    return false;
                }
            }
        });
    },

    setBackNavigation() {
        const inst = this;
        window.addEventListener("popstate", async function (e) {
            const state = e.state;

            if (state?.offset != null && state?.offset <= history.length) {
                inst.isBackwardFlow = true;

                if (await inst.onBack()) {
                    // note("[" + history.length + "] poped - " + history.state?.euiState + " / [" + history.state?.offset + "] " + history.state?.currentTopPid);

                } else {
                    if (history.length < inst.initialHistoryOffset + 1 || state?.euiState == "initializing") {
                        note(EsLocale.get("exitApplicationWhenPressBackAgain"));
                        // inst.pushCurrentState(inst.currentTopPage, state);
                    }
                }

                inst.isBackwardFlow = false;
            }
        }, false);

        // window.addEventListener("pageshow", async function (e) {
        //     if (await inst.onBack()) {
        //         e.preventDefault();
        //         note("prevented");
        //         return false;
        //     }
        // });

        // $(window).on("beforeunload", async function(e) {
        //     if (await inst.onBack()) {
        //         e.preventDefault();
        //         e.returnValue = "";
        //         return false;
        //     } else {
        //         alert(e.type);
        //     }
        // });
    },

    pushCurrentState(pageHandle = this.currentTopPage, currentState = history.state) {
        if (this.isBackwardFlow) return false;
        let currentTopPid = currentState?.currentTopPid;

        if (pageHandle != null && currentTopPid == null) {
            const sectionBound = pageHandle.sectionBound;
            if (sectionBound != "main" && sectionBound != "blind" && sectionBound != "menu") return false;

            currentTopPid = pageHandle != null ? EstreUiPage.from(pageHandle)?.pid : null;
        }
        // if (currentTopPid == null) currentTopPid = this.currentTopPid;
        if (currentTopPid == null) return false;

        const euiState = currentState?.euiState ?? this.euiState;
        const offset = currentState?.offset ?? history.length;
        history.pushState({ euiState, currentTopPid, offset }, null);
        // note("[" + history.length + "] pushed - " + euiState + " / [" + offset + "] " + currentTopPid);

        return true;
    },

    replaceCurrentState(pageHandle = this.currentTopPage) {
        if (pageHandle != null) {
            const sectionBound = pageHandle.sectionBound;
            if (sectionBound != "main" && sectionBound != "blind" && sectionBound != "menu") return false;

        }

        let currentTopPid = pageHandle != null ? EstreUiPage.from(pageHandle)?.pid : null;
        // if (currentTopPid == null) currentTopPid = this.currentTopPid;

        if (currentTopPid != null) {
            if (currentTopPid == history.state?.currentTopPid) return false;

            if (history.state != null) this.pushCurrentState();
        }

        const euiState = this.euiState;
        const offset = history.length;
        history.replaceState({ euiState, currentTopPid, offset }, null);
        // note("[" + history.length + "] replaced - " + euiState + " / [" + offset + "] "  + currentTopPid);

        return true;
    },


    //dark mode
    setupDarkMode() {
        if (window.matchMedia) {
            this.darkModeMql = window.matchMedia("(prefers-color-scheme: dark)");
            const onChange = _ => { if (this.darkMode == null) this.applyDarkMode(); };
            if (this.darkModeMql.addEventListener) this.darkModeMql.addEventListener("change", onChange);
            else this.darkModeMql.addListener(onChange);
        }
        this.applyDarkMode();
    },

    setDarkMode(value) {
        let pref;
        if (value == null) pref = null;
        else if (value === false || value === 0 || value === "0") pref = false;
        else pref = true;

        if (pref == null) localStorage.removeItem("estreUi.darkMode");
        else localStorage.setItem("estreUi.darkMode", pref ? "1" : "0");

        this.applyDarkMode();
        return this.isDarkMode;
    },

    applyDarkMode() {
        const pref = this.darkMode;
        const active = (pref == null) ? (this.darkModeMql?.matches ?? false) : pref;
        if (active) document.body.dataset.darkMode = "1";
        else delete document.body.dataset.darkMode;
        this.updateDarkModeToggleWidgets();
    },

    // Cycle auto -> light -> dark -> auto (single-button 3-state control)
    cycleDarkMode() {
        const pref = this.darkMode;
        if (pref == null) this.setDarkMode(false);
        else if (pref === false) this.setDarkMode(true);
        else this.setDarkMode(null);
        return this.darkMode;
    },

    updateDarkModeToggleWidgets() {
        const $widgets = $("#darkModeToggle");
        if ($widgets.length < 1) return;
        const pref = this.darkMode;
        const state = (pref == null) ? "auto" : (pref ? "dark" : "light");
        const icon = state == "light" ? "\u2600\uFE0F" : (state == "dark" ? "\u263D" : "\u{1F313}");
        const label = state.charAt(0).toUpperCase() + state.slice(1);
        $widgets.each(function() {
            const $w = $(this);
            $w.attr("data-dark-mode-state", state);
            $w.find(".tile_icon").text(icon);
            $w.find(".tile_label").text(label);
        });
    },


    //mainMenu
    setMenuSwipeHandler() {
        if (this.$mainMenu.length > 0) {
            this.releaseMenuSwipeHandler();
            const ui = this;
            this.menuSwipeHandler = new EstreSwipeHandler(this.$mainMenu).unuseY().setOnUp(function(grabX, grabY, handled, canceled, directed) {
                if (window.isVerbosely) console.log("grabX: " + grabX + ", grabY: " + grabY + ", lastX: " + this.lastX + ", startX: " + this.startX);
                if (handled) {
                    const isOpen = ui.$mainMenu.hasClass("right") ? grabX < 0 : grabX > 0;
                    setTimeout(_ => {
                        if (isOpen) ui.openMainMenu();
                        else ui.closeMainMenu();
                    }, 0);
                }
            });
        }
    },

    releaseMenuSwipeHandler() {
        if (this.menuSwipeHandler != null) this.menuSwipeHandler.release();
    },


    //overwatchPanel
    setPanelSwipeHandler() {
        if (this.$overwatchPanel.length < 1) return;
        this.releasePanelSwipeHandler();
        const ui = this;
        if (this.$panelTrigger.length > 0) {
            this.panelOpenSwipeHandler = new EstreSwipeHandler(this.$panelTrigger[0]).unuseX()
                .setResponseBound(this.$overwatchPanel)
                .setOnUp(function(grabX, grabY, handled, canceled, directed) {
                    if (handled && grabY > 0 && !ui.isOpenOverwatchPanel) {
                        setTimeout(_ => ui.openOverwatchPanel(), 0);
                    }
                });
        }
        if (this.$panelGrabArea.length > 0) {
            this.panelCloseSwipeHandler = new EstreSwipeHandler(this.$panelGrabArea[0]).unuseX()
                .setResponseBound(this.$overwatchPanel)
                .setOnUp(function(grabX, grabY, handled, canceled, directed) {
                    if (handled && grabY < 0 && ui.isOpenOverwatchPanel) {
                        setTimeout(_ => ui.closeOverwatchPanel(), 0);
                    }
                });
        }
    },

    releasePanelSwipeHandler() {
        if (this.panelOpenSwipeHandler != null) { this.panelOpenSwipeHandler.release(); this.panelOpenSwipeHandler = null; }
        if (this.panelCloseSwipeHandler != null) { this.panelCloseSwipeHandler.release(); this.panelCloseSwipeHandler = null; }
    },

    setOverwatchPanelClock() {
        if (this.$panelClock == null) return;
        const now = new Date();
        if (this.$panelClock.length > 0) {
            const hh = String(now.getHours()).padStart(2, "0");
            const mm = String(now.getMinutes()).padStart(2, "0");
            this.$panelClock.text(hh + ":" + mm);
        }
        if (this.$panelDate.length > 0) {
            const fmt = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
            this.$panelDate.text(fmt.format(now));
        }
    },

    scheduleOverwatchPanelClock() {
        this.releaseOverwatchPanelClock();
        this.setOverwatchPanelClock();
        const now = new Date();
        const msToNext = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
        this.panelClockTimeoutId = setTimeout(_ => {
            this.setOverwatchPanelClock();
            this.panelClockIntervalId = setInterval(_ => this.setOverwatchPanelClock(), 60000);
        }, msToNext);
    },

    releaseOverwatchPanelClock() {
        if (this.panelClockTimeoutId != null) { clearTimeout(this.panelClockTimeoutId); this.panelClockTimeoutId = null; }
        if (this.panelClockIntervalId != null) { clearInterval(this.panelClockIntervalId); this.panelClockIntervalId = null; }
    },

    mainMenuBtnOnClick(e) {
        estreUi.toggleMainMenuButton();
    },

    mainMenuGrabAreaOnclick(e) {
        estreUi.closeMainMenu();
    },

    overwatchPanelGrabAreaOnclick(e) {
        estreUi.closeOverwatchPanel();
    },

    toggleMainMenuButton() {
        if (this.isOpenMainMenu) return this.closeMainMenu();
        else return this.openMainMenu();
    },

    openMainMenu() {
        if (!this.isOpenMainMenu) {
            this.$mainMenu.attr(eds.opened, t1);
            const $top = this.$menuSections.filter(asv(eds.onTop, t1));
            const menuCurrentTop = $top[$top.length - 1]?.pageHandle;//?.focus();
            if (menuCurrentTop != null) {
                this.menuCurrentOnTop = menuCurrentTop;
                menuCurrentTop.show();
            }

            const lottie = this.getMainMenuLottie();
            if (lottie != null) {
                lottie.pause();
                lottie.setDirection(1);
                lottie.setSegment(0, 30);
                lottie.goToAndPlay(0, true);
            }
            return true;
        } else return false;
    },

    closeMainMenu() {
        if (this.isOpenMainMenu) {
            this.$mainMenu.attr(eds.opened, "");
            // const $top = this.$menuSections.filter(asv(eds.onTop, t1));
            // $top[$top.length - 1]?.pageHandle?.blur();
            this.menuCurrentOnTop?.onHide();

            const lottie = this.getMainMenuLottie();
            if (lottie != null) {
                lottie.pause();
                lottie.setDirection(-1);
                lottie.goToAndPlay(30, true);
            }
            return true;
        } else return false;
    },

    getMainMenuLottie() {
        return this.$mainMenuBtnLottie[0]?.getLottie?.();
    },


    //overwatchPanel
    toggleOverwatchPanel(sectionId) {
        if (this.isOpenOverwatchPanel) return this.closeOverwatchPanel();
        else return this.openOverwatchPanel(sectionId);
    },

    openOverwatchPanel(sectionId) {
        if (!this.isOpenOverwatchPanel) {
            this.$overwatchPanel.attr(eds.opened, t1);
            if (sectionId != null) this.showOverwatchPanelSection(sectionId);
            else {
                const $top = this.$panelSections.filter(asv(eds.onTop, t1));
                const panelCurrentTop = $top[$top.length - 1]?.pageHandle;
                if (panelCurrentTop != null) {
                    this.panelCurrentOnTop = panelCurrentTop;
                    panelCurrentTop.show(false);
                }
            }
            return true;
        } else if (sectionId != null) {
            this.showOverwatchPanelSection(sectionId);
            return true;
        } else return false;
    },

    closeOverwatchPanel() {
        if (this.isOpenOverwatchPanel) {
            this.$overwatchPanel.attr(eds.opened, "");
            this.panelCurrentOnTop?.onHide();
            return true;
        } else return false;
    },

    showOverwatchPanelSection(id) {
        const $target = this.$panelSections.filter(eid + id);
        if ($target.length < 1) return false;
        const targetEl = $target[$target.length - 1];
        targetEl.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
        const targetComponent = targetEl.pageHandle;
        if (targetComponent != null) {
            targetComponent.show(false);
            this.panelCurrentOnTop = targetComponent;
        }
        return true;
    },


    //rootbar
    initRootbar() {
        this.$rootTabs = this.$tabsbar.find(c.c + btn);
        this.$rootTabs.attr(eds.active, "");

        var topId = null;
        const topSection = this.$mainSections.filter(asv(eds.onTop, t1));
        if (topSection.length > 0) topId = topSection.attr("id");

        if (topId != null) {
            this.$rootTabs.filter(aiv(eds.tabId, topId)).attr(eds.active, t1);
        }

        this.$rootTabs.filter(ax(eds.tabId)).click(this.rootTabOnClick);


        // * Currently not using
        // fetch("./structure/rootmenu" + estreStruct.structureSuffix)
        //     .then((response) => {
        //         if (response.ok) return response.json();
        //         throw Error("[" + response.status + "]" + response.url);
        //     })
        //     .then((data) => estreUi.renderRootBar(data))
        //     .catch((error) => console.log("fetch error: " + error));
    },

// === Currently not using
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
// ===========================

    showExactAppbar(component, container, article) {
        const appbar = this.appbar;
        if (appbar == null) return;
        const currentExactComponent = this.isOpenMainMenu ? this.menuCurrentOnTop : this.mainCurrentOnTop;
        if (component == null) component = currentExactComponent;
        if (component == null) return;
        if (container != null && component != currentExactComponent) return null;
        const currentExactContainer = currentExactComponent.currentOnTop;
        if (article != null && container != currentExactContainer) return null;

        const isHomeComponent = component.isHome;
        const topContainer = component.currentTop;
        const isRootContainer = topContainer != null ? topContainer?.isRoot ?? false : true;
        const isSingleContainer = component.isSingleContainer;
        const isRootOrSingle = isRootContainer || isSingleContainer;

        const topArticle = topContainer?.currentTop;
        const isMainArticle = topArticle != null ? topArticle?.isMain ?? false : true;
        const isSingleArticle = container?.isSingleArticle ?? topContainer?.isSingleArticle ?? true;
        const isMainOrSingle = isMainArticle || isSingleArticle;

        let success = false;
        if (!success && topArticle != null) success = appbar.showContainer("article_" + topArticle.id);
        if (!success && topContainer != null) success = appbar.showContainer("container_" + topContainer.id);
        if (!success && isRootContainer) success = appbar.showContainer(component.id);
        if (!success && isHomeComponent && isRootOrSingle && isMainOrSingle) success = appbar.showContainer("home");
        if (!success && isMainArticle) success = appbar.showContainer("main");
        if (!success && isRootContainer) success = appbar.showContainer("root");
        if (!success && (!isHomeComponent || !isRootContainer)) success = appbar.showContainer("sub");
        estreUi.releaseAppbarPageTitle();
        estreUi.releaseAppbarLeftToolSet();
        estreUi.releaseAppbarRightToolSet();

        return success;
    },

    setAppbarPageTitle(text) {
        this.appbar?.handler?.setPageTitle(text);
    },

    releaseAppbarPageTitle() {
        this.setAppbarPageTitle(this.isOpenMainMenu ? this.menuCurrentOnTop?.title ?? "" : this.mainCurrentOnTop?.title ?? "");
    },

    setAppbarLeftToolSet(frostOrCold, matchReplacer, dataName = "frozen") {
        if (typeFunction(frostOrCold)) return frostOrCold(feed => this.appbar?.handler?.setAppbarLeftToolSet(feed, matchReplacer, dataName));
        else return $(this.appbar?.handler?.setAppbarLeftToolSet(frostOrCold, matchReplacer, dataName));
    },

    releaseAppbarLeftToolSet() {
        const appbarFeed = this.isOpenMainMenu ? this.menuCurrentOnTop?.appbarLeftFeed : this.mainCurrentOnTop?.appbarLeftFeed;
        return this.setAppbarLeftToolSet(appbarFeed);
    },

    setAppbarRightToolSet(frostOrCold, matchReplacer, dataName = "frozen") {
        if (typeFunction(frostOrCold)) return frostOrCold(feed => this.appbar?.handler?.setAppbarRightToolSet(feed, matchReplacer, dataName));
        else return $(this.appbar?.handler?.setAppbarRightToolSet(frostOrCold, matchReplacer, dataName));
    },

    releaseAppbarRightToolSet() {
        const appbarFeed = this.isOpenMainMenu ? this.menuCurrentOnTop?.appbarRightFeed : this.mainCurrentOnTop?.appbarRightFeed;
        return this.setAppbarRightToolSet(appbarFeed);
    },

    rootTabOnClick(e) {
        const target = this.tagName == BTN ? this : (e.target.tagName == BTN ? e.target : e.target.parentElement);
        estreUi.switchRootTab(target);
    },

    switchRootTab($target, intent) {
        switch (typeof $target) {
            case "number":
                if ($target < this.$rootTabs.length) return this.switchRootTab(this.$rootTabs[$target], intent);
                break;

            case "string":
                const targets = this.$rootTabs.filter(aiv(eds.tabId, $target));
                if ($target.length < 1) $target = this.$fixedPageList.find(btn + aiv(eds.contained, "root") + aiv(eds.containerId, id));
                if (targets.length > 0) return this.switchRootTab(targets[0], intent);
                break;

            case "object":
                if ($target instanceof jQuery) ;//do nothing
                else $target = $($target);

                const id = $target.attr(eds.tabId);
                const $targetSection = this.$mainSections.filter(eid + id);
                const isModal = $targetSection.hasClass("modal");

                var unhandled = false;
                if (isModal) {
                    if ($targetSection[0]?.pageHandle?.isOnTop) {
                        return this.closeModalTab(id, $targetSection);
                    } else return this.openModalTab(id, $targetSection, intent);
                }

                //단일 탭 사용 기준 구현
                const $elseSections = this.$mainSections.filter(asv(eds.onTop, t1) + nti(id));
                if ($elseSections.length > 0) {
                    for (var section of $elseSections) section.pageHandle?.hide();

                    const currentTopHandle = this.mainCurrentOnTop;
                    const currentTopHandleId = currentTopHandle?.id;
                    if (id != currentTopHandleId && currentTopHandleId != this.latestRootTabId) {
                        this.prevRootTabId = currentTopHandleId;
    
                        // if (estreUi.euiState == "onReady" && currentTopHandle != null) {
                        //     estreUi.pushCurrentState(currentTopHandle);
                        // }
                    }
                }
                this.$rootTabs.filter(aiv(eds.active, t1) + naiv(eds.tabId, id)).attr(eds.active, "");

                const targetComponent = this.mainSections[id];
                if (targetComponent.isOnTop) {
                    unhandled = true;
                    
                    //현재 선택된 탭을 다시 선택했을 때
                    targetComponent.back();
                    // history.back();
                } else {
                    targetComponent.pushIntent(intent);
                    targetComponent.show(false);
                    this.mainCurrentOnTop = targetComponent;

                    this.showExactAppbar(targetComponent);
                }

                this.$rootTabs.blur();

                if ($target.attr(eds.active) == t1) {
                    //do nothing //추후 방향에 따라 섹션 새로고침 등 구현
                } else {
                    $target.attr(eds.active, t1);
                }

                return !unhandled;
                //break;
        }
    },

    switchRootTabPrev() {
        const prev = this.prevRootTabId;
        if (prev != null) {
            const processed = this.switchRootTab(prev);
            return processed;
        } else return false;
    },

    openInstantBlinded(id, intent, instanceOrigin) {
        const page = pageManager.getComponent(id);
        if (page == null) return null;
        if (page.statement == "static") return null;
        this.$blindArea.append(page.live);
        const $section = this.$blindSections.filter(eid + id);
        if ($section == null || $section.length < 1) return null;
        const component = this.initInstantContent($section[$section.length - 1], intent, instanceOrigin);
        if (component.isOnTop) component.show(false);
        return component;
    },

    showInstantBlinded(id, intent, instanceOrigin) {
        let $targetSection = this.$blindSections.filter(eid + id + (instanceOrigin?.let(it => aiv(eds.instanceOrigin, it)) ?? ""));

        if ($targetSection.length < 1) {
            if (instanceOrigin != null) return false;
            $targetSection = this.$blindSections.filter(eid + id);
            if ($targetSection.length < 1) return false;
            $targetSection = $($targetSection[$targetSection.length - 1]);
        }

        const isModal = $targetSection.hasClass("modal");

        var unhandled = false;
        if (isModal) {
            const onTop = $targetSection.attr(eds.onTop);
            if (onTop == t1 || onTop == "1*") {
                //do nothing
            } else return this.openModalSection(id, this.$blindSections, $targetSection, intent);
        }

        const $elseSections = this.$blindSections.filter(asv(eds.onTop, t1) + nti(id));
        if ($elseSections.length > 0) {
            for (var section of $elseSections) section.pageHandle?.hide(false);

            const currentTopHandle = this.blindedCurrentOnTop;
            const currentTopHandleId = currentTopHandle?.id;
            if (id != currentTopHandleId && currentTopHandleId != this.latestBlindedId) {
                this.prevBlindedId = currentTopHandleId;

                // if (estreUi.euiState == "onReady" && currentTopHandle != null) {
                //     estreUi.pushCurrentState(currentTopHandle);
                // }
            }
        }

        let targetComponent = this.blindSections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (targetComponent == null) {
            if (instanceOrigin != null) return false;
            const componentIds = this.blindSections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return false;
            targetComponent = this.blindSections[componentIds[componentIds.length - 1]];
        }
        targetComponent.pushIntent(intent);
        if (targetComponent.isOnTop) {
            unhandled = true;
        } else {
            targetComponent.show(false);
            this.blindedCurrentOnTop = targetComponent;
        }

        return !unhandled;
    },

    async closeInstantBlinded(id, instanceOrigin, isTermination) {
        let component = this.blindSections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (component == null) {
            if (instanceOrigin != null) return null;
            const componentIds = this.blindSections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return null;
            component = this.blindSections[componentIds[componentIds.length - 1]];
        }
        const $targetSection = component.$host;
        const isModal = $targetSection.hasClass("modal");

        if (isModal) {
            if (component.isOnTop) {
                const closed = await this.closeModalSection(id, this.$blindSections, $targetSection);
                if (!component.isStatic) await this.releaseInstantContent(component);
                return closed;
            } else return null;
        } else {
            if (!component.$host.hasClass("home")) {
                isTermination ??= !component.isStatic;
                const closed = await component.close(false, isTermination);
                setTimeout(async _ => {
                    const $components = this.$blindSections.filter(naiv(m.id, id));
                    if ($components.length > 0) {
                        const prevComponent = this.prevBlindedId?.let(it => this.blindSections[it]);
                        if (prevComponent != null) await prevComponent.show();
                        else await $components[$components.length - 1]?.pageHandle?.show();
                    }
                }, 0);
                if (isTermination) await this.releaseInstantContent(component);
                return closed;
            } else return false;
        }
    },

    openMenuArea(id, intent, instanceOrigin) {
        const page = pageManager.getComponent(id);
        if (page == null) return null;
        if (page.statement == "static") return null;
        this.$mainMenu.append(page.live);
        const $section = this.$menuSections.filter(eid + id);
        if ($section == null || $section.length < 1) return null;
        const component = this.initStaticMenu($section[$section.length - 1], intent, instanceOrigin);
        if (component.isOnTop) component.show(false);
        return component;
    },

    showMenuArea(id, intent, instanceOrigin) {
        let $targetSection = this.$menuSections.filter(eid + id + (instanceOrigin?.let(it => aiv(eds.instanceOrigin, it)) ?? ""));

        if ($targetSection.length < 1) {
            if (instanceOrigin != null) return false;
            $targetSection = this.$menuSections.filter(eid + id);
            if ($targetSection.length < 1) return false;
            $targetSection = $($targetSection[$targetSection.length - 1]);
        }
        
        const isModal = $targetSection.hasClass("modal");

        var unhandled = false;
        if (isModal) {
            const onTop = $targetSection.attr(eds.onTop);
            if (onTop == t1 || onTop == "1*") {
                //do nothing
            } else return this.openModalSection(id, this.$menuSections, $targetSection, intent);
        }

        const $elseSections = this.$menuSections.filter(asv(eds.onTop, t1) + nti(id));
        if ($elseSections.length > 0) {
            for (var section of $elseSections) section.pageHandle?.hide(false);
        }

        let targetComponent = this.menuSections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (targetComponent == null) {
            if (instanceOrigin != null) return false;
            const componentIds = this.menuSections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return false;
            targetComponent = this.menuSections[componentIds[componentIds.length - 1]];
        }
        targetComponent.pushIntent(intent);
        if (targetComponent.isOnTop) {
            unhandled = true;
        } else {
            targetComponent.show(false);
            this.menuCurrentOnTop = targetComponent;

            this.showExactAppbar(targetComponent);
        }

        return !unhandled;
    },

    async closeMenuArea(id, instanceOrigin, isTermination) {
        let component = this.menuSections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (component == null) {
            if (instanceOrigin != null) return null;
            const componentIds = this.menuSections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return null;
            component = this.menuSections[componentIds[componentIds.length - 1]];
        }
        const $targetSection = component.$host;
        const isModal = $targetSection.hasClass("modal");

        if (isModal) {
            if (component.isOnTop) {
                const closed = await this.closeModalSection(id, this.$menuSections, $targetSection);
                if (!component.isStatic) await this.releaseInstantContent(component);
                return closed;
            } else return null;
        } else {
            isTermination ??= !component.isStatic;
            const closed = await component.close(false, isTermination);
            if (isTermination) await this.releaseInstantContent(component);
            return closed;
        }
    },

    openHeaderBar(id, intent, instanceOrigin) {
        const page = pageManager.getComponent(id);
        if (page == null) return null;
        if (page.statement == "static") return null;
        this.$headerArea.append(page.live);
        const $section = this.$headerSections.filter(eid + id);
        if ($section == null || $section.length < 1) return null;
        const component = this.initHeaderBar($section[$section.length - 1], intent, instanceOrigin);
        // if (component.isOnTop) component.show(false);
        return component;
    },

    showHeaderBar(id, intent, instanceOrigin) {
        let $targetSection = this.$headerSections.filter(eid + id + (instanceOrigin?.let(it => aiv(eds.instanceOrigin, it)) ?? ""));

        if ($targetSection.length < 1) {
            if (instanceOrigin != null) return false;
            $targetSection = this.$headerSections.filter(eid + id);
            if ($targetSection.length < 1) return false;
            $targetSection = $($targetSection[$targetSection.length - 1]);
        }

        const isModal = $targetSection.hasClass("modal");

        var unhandled = false;
        if (isModal) {
            const onTop = $targetSection.attr(eds.onTop);
            if (onTop == t1 || onTop == "1*") {
                //do nothing
            } else return this.openModalSection(id, this.$headerSections, $targetSection, intent);
        }

        const $elseSections = this.$headerSections.filter(asv(eds.onTop, t1) + nti(id));
        if ($elseSections.length > 0) {
            for (var section of $elseSections) section.pageHandle?.hide(false);
        }

        let targetComponent = this.headerSections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (targetComponent == null) {
            if (instanceOrigin != null) return false;
            const componentIds = this.headerSections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return false;
            targetComponent = this.headerSections[componentIds[componentIds.length - 1]];
        }
        targetComponent.pushIntent(intent);
        if (targetComponent.isOnTop) {
            unhandled = true;
        } else {
            targetComponent.show(false);
            this.headerCurrentOnTop = targetComponent;
        }

        return !unhandled;
    },

    async closeHeaderBar(id, instanceOrigin, isTermination) {
        let component = this.headerSections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (component == null) {
            if (instanceOrigin != null) return null;
            const componentIds = this.headerSections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return null;
            component = this.headerSections[componentIds[componentIds.length - 1]];
        }
        const $targetSection = component.$host;
        const isModal = $targetSection.hasClass("modal");

        if (isModal) {
            if (component.isOnTop) {
                const closed = await this.closeModalSection(id, this.$headerSections, $targetSection);
                if (!component.isStatic) await this.releaseInstantContent(component);
                return closed;
            } else return null;
        } else {
            isTermination ??= !component.isStatic;
            const closed = await component.close(false, isTermination);
            if (isTermination) await this.releaseInstantContent(component);
            return closed;
        }
    },

    openManagedOverlay(id, intent, instanceOrigin) {
        const page = pageManager.getComponent(id, "overlay");
        if (page == null) return null;
        if (page.statement == "static") return null;
        this.$overlayArea.append(page.live);
        const $section = this.$overlaySections.filter(eid + id);
        if ($section == null || $section.length < 1) return null;
        const component = this.initOverlayContent($section[$section.length - 1], intent, instanceOrigin);
        // if (component.isOnTop) component.show(false);
        return component;
    },

    showManagedOverlay(id, intent, instanceOrigin) {
        let $targetSection = this.$overlaySections.filter(eid + id + (instanceOrigin?.let(it => aiv(eds.instanceOrigin, it)) ?? ""));

        if ($targetSection.length < 1) {
            if (instanceOrigin != null) return false;
            $targetSection = this.$overlaySections.filter(eid + id);
            if ($targetSection.length < 1) return false;
            $targetSection = $($targetSection[$targetSection.length - 1]);
        }

        const isModal = $targetSection.hasClass("modal");

        var unhandled = false;
        if (isModal) {
            const onTop = $targetSection.attr(eds.onTop);
            if (onTop == t1 || onTop == "1*") {
                //do nothing
            } else return this.openModalSection(id, this.$overlaySections, $targetSection, intent);
        }

        const $elseSections = this.$overlaySections.filter(asv(eds.onTop, t1) + nti(id));
        if ($elseSections.length > 0) {
            for (var section of $elseSections) section.pageHandle?.hide(false);
        }

        let targetComponent = this.overlaySections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (targetComponent == null) {
            if (instanceOrigin != null) return false;
            const componentIds = this.overlaySections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return false;
            targetComponent = this.overlaySections[componentIds[componentIds.length - 1]];
        }
        targetComponent.pushIntent(intent);
        if (targetComponent.isOnTop) {
            unhandled = true;
        } else {
            targetComponent.show(false);
            this.overlayCurrentOnTop = targetComponent;
        }

        return !unhandled;
    },

    async closeManagedOverlay(id, instanceOrigin, isTermination) {
        let component = this.overlaySections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (component == null) {
            if (instanceOrigin != null) return null;
            const componentIds = this.overlaySections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return null;
            component = this.overlaySections[componentIds[componentIds.length - 1]];
        }
        const $targetSection = component.$host;
        const isModal = $targetSection.hasClass("modal");

        if (isModal) {
            if (component.isOnTop) {
                const closed = await this.closeModalSection(id, this.$overlaySections, $targetSection);
                if (!component.isStatic) await this.releaseInstantContent(component);
                return closed;
            } else return null;
        } else {
            isTermination ??= !component.isStatic;
            const closed = await component.close(false, isTermination);
            if (isTermination) await this.releaseInstantContent(component);
            return closed;
        }
    },

    openModalTab(id, $targetSection, intent = null, $sectionSet = this.$mainSections) {
        var $target = this.$fixedBottom.find(btn + aiv(eds.tabId, id));
        if ($target.length < 1) $target = this.$sessionGroupHolder.find(btn + aiv(eds.contained, "root") + aiv(eds.containerId, id));

        $target.attr(eds.active, t1);

        return this.openModalSection(id, $sectionSet, $targetSection, intent);
    },

    openModalSection(id, $sectionSet = this.$mainSections, $targetSection, intent = null) {
        var $target = this.$fixedBottom.find(btn + aiv(eds.tabId, id));
        if ($target.length < 1) $target = this.$sessionGroupHolder.find(btn + aiv(eds.contained, "root") + aiv(eds.containerId, id));

        if ($targetSection == null) $targetSection = $sectionSet.filter(eid + id);

        const isMainSection = $sectionSet == this.$mainSections;
        const isBlildSection = $sectionSet == this.$blindSections;
        const isMenuSection = $sectionSet == this.$menuSections;
        const isOverlaySection = $sectionSet == this.$overlaySections;
        const isHeaderSection = $sectionSet == this.$headerSections;
        const component = isMainSection ? this.mainSections[id] : (isBlildSection ? this.blindSections[id] : (isMenuSection ? this.menuSections[id] : (isOverlaySection ? this.overlaySections[id] : (isHeaderSection ? this.headerSections[id] : null))));

        // if (isMainSection && this.mainCurrentOnTop != null) this.prevRootTabId = this.mainCurrentOnTop.id;

        component?.pushIntent(intent);
        
        $targetSection.off("click");
        $targetSection.click(function(e) {
            e.preventDefault();

            estreUi.closeModalTab(this.id, $targetSection, $sectionSet);

            return false;
        });
        const $container = $targetSection.find(c.c + div + uis.container);
        $container.off("click");
        $container.click(function(e) {
            e.preventDefault();

            return false;
        });

        return $targetSection[0]?.pageHandle?.show(false);
    },

    closeModalTab(id, $targetSection, $sectionSet = this.$mainSections) {
        var $target = this.$fixedBottom.find(btn + aiv(eds.tabId, id));
        if ($target.length < 1) $target = this.$sessionGroupHolder.find(btn + aiv(eds.contained, "root") + aiv(eds.containerId, id));

        $target.attr(eds.active, "");

        return this.closeModalSection(id, $sectionSet, $targetSection);
    },

    closeModalSection(id, $sectionSet = this.$mainSections, $targetSection) {
        if ($targetSection == null) $targetSection = $sectionSet.filter(eid + id);

        // if ($sectionSet == this.$mainSections) this.prevRootTabId = $targetSection.attr("id");

        $targetSection.off("click");
        $targetSection.find(c.c + div + uis.container).off("click");
        
        return $targetSection[0]?.pageHandle?.close(false);
    },

    async initOverlayContents(term = 0) {
        const $oss = this.$overlaySections;

        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        for (var i=0; i<$oss.length; i++) {
            this.initOverlayContent($oss[i], null, u, true);
            await delayer();
        }

        // let $top = this.$overlaySections.filter(asv(eds.onTop, t1));
        // if ($top.length < 1) $top = this.$overlaySections;
        // $top[$top.length - 1]?.pageHandle?.show(false);
    },

    releaseOverlayContent(component) {
        if (component == null) return;
        const instanceId = component.instanceId;
        component.release(component.isStatic ? null : true);
        if (this.blindSections[instanceId] != null) delete this.overlaySections[instanceId];
        const index = this.overlaySectionList.indexOf(component);
        if (index > -1) this.overlaySectionList.splice(index, 1);
    },

    initOverlayContent(bound, intent = null, instanceOrigin, init = false) {
        this.releaseOverlayContent(bound.pageHandle);
        const component = new EstreOverlayComponent(bound, instanceOrigin);
        if (!init || component.isStatic) {
            this.overlaySections[component.instanceId] = component;
            this.overlaySectionList.push(component);
        }
        component.init(intent);
        // if (component.isOnTop && component.isStatic) component.show(false);
        return component;
    },

    async initInstantContents(term = 0) {
        const $bss = this.$blindSections;

        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        for (var i=0; i<$bss.length; i++) {
            this.initInstantContent($bss[i], null, u, true);
            await delayer();
        }

        const $top = this.$blindSections.filter(asv(eds.onTop, t1));
        // if ($top.length < 1) $top = this.$blindSections;
        if ($top.length > 0) {
            const targetComponent = $top[$top.length - 1].pageHandle;
            targetComponent?.show(false);
            this.blindedCurrentOnTop = targetComponent;
        }
    },

    releaseInstantContent(component) {
        if (component == null) return;
        const instanceId = component.instanceId;
        component.release(component.isStatic ? null : true);
        if (this.blindSections[instanceId] != null) delete this.blindSections[instanceId];
        const index = this.blindSectionList.indexOf(component);
        if (index > -1) this.blindSectionList.splice(index, 1);
    },

    initInstantContent(bound, intent = null, instanceOrigin, init = false) {
        this.releaseInstantContent(bound.pageHandle);
        const component = new EstreInstantComponent(bound, instanceOrigin);
        if (!init || component.isStatic) {
            this.blindSections[component.instanceId] = component;
            this.blindSectionList.push(component);
        }
        component.init(intent);
        // if (component.isOnTop && component.isStatic) component.show(false);
        return component;
    },

    async initStaticContents(term = 0) {
        const $mss = this.$mainSections;

        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        for (var i=0; i<$mss.length; i++) {
            this.initStaticContent($mss[i], null, u, true);
            await delayer();
        }

        let $top = this.$mainSections.filter(asv(eds.onTop, t1));
        if ($top.length < 1) $top = this.$mainSections.filter(eid + "home");
        if ($top.length < 1) $top = this.$mainSections.filter(cls + "home");
        if ($top.length < 1) $top = this.$mainSections;
        if ($top.length > 0) {
            const targetComponent = $top[0].pageHandle;
            targetComponent?.show(false);
            this.mainCurrentOnTop = targetComponent;
        }
    },

    releaseStaticContent(component) {
        if (component == null) return;
        const instanceId = component.instanceId;
        component.release(component.isStatic ? null : true);
        if (this.mainSections[instanceId] != null) delete this.mainSections[instanceId];
        const index = this.mainSectionList.indexOf(component);
        if (index > -1) this.mainSectionList.splice(index, 1);
    },

    initStaticContent(bound, intent = null, instanceOrigin, init = false) {
        this.releaseStaticContent(bound.pageHandle);
        const component = new EstreComponent(bound, instanceOrigin);
        if (!init || component.isStatic) {
            this.mainSections[component.instanceId] = component;
            this.mainSectionList.push(component);
        }
        component.init(intent);
        // var $sections = this.$mainSections.filter(asv(eds.onTop, t1));
        // if ($sections.length < 1) $sections = this.$mainSections;
        // if (component.isOnTop && component.isStatic && (!init || bound == $sections[$sections.length - 1])) component.show(false);
        return component;
    },

    async initStaticMenus(term = 0) {
        const $mss = this.$menuSections;

        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        for (var i=0; i<$mss.length; i++) {
            this.initStaticMenu($mss[i], null, u, true);
            await delayer();
        }

        let $top = this.$menuSections.filter(asv(eds.onTop, t1));
        if ($top.length < 1) $top = this.$menuSections.filter(eid + "menuArea");
        if ($top.length > 0) {
            const targetComponent = $top[$top.length - 1].pageHandle;
            targetComponent?.show(false);
            this.menuCurrentOnTop = targetComponent;
        }
    },

    releaseStaticMenu(component) {
        if (component == null) return;
        const instanceId = component.instanceId;
        component.release(component.isStatic ? null : true);
        if (this.menuSections[instanceId] != null) delete this.menuSections[instanceId];
        const index = this.menuSectionList.indexOf(component);
        if (index > -1) this.menuSectionList.splice(index, 1);
    },

    initStaticMenu(bound, intent = null, instanceOrigin, init = false) {
        this.releaseStaticMenu(bound.pageHandle);
        const component = new EstreMenuComponent(bound, instanceOrigin);
        if (!init || component.isStatic) {
            this.menuSections[component.instanceId] = component;
            this.menuSectionList.push(component);
        }
        component.init(intent);
        // if (component.isOnTop) component.show(false);
        return component;
    },

    async initStaticPanels(term = 0) {
        const $pss = this.$panelSections;

        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        for (var i=0; i<$pss.length; i++) {
            this.initStaticPanel($pss[i], null, u, true);
            await delayer();
        }

        let $top = this.$panelSections.filter(asv(eds.onTop, t1));
        if ($top.length < 1) $top = this.$panelSections.filter(eid + "quickPanel");
        if ($top.length < 1) $top = this.$panelSections;
        if ($top.length > 0) {
            const targetComponent = $top[$top.length - 1].pageHandle;
            targetComponent?.show(false);
            this.panelCurrentOnTop = targetComponent;
        }
    },

    releaseStaticPanel(component) {
        if (component == null) return;
        const instanceId = component.instanceId;
        component.release(component.isStatic ? null : true);
        if (this.panelSections[instanceId] != null) delete this.panelSections[instanceId];
        const index = this.panelSectionList.indexOf(component);
        if (index > -1) this.panelSectionList.splice(index, 1);
    },

    initStaticPanel(bound, intent = null, instanceOrigin, init = false) {
        this.releaseStaticPanel(bound.pageHandle);
        const component = new EstrePanelComponent(bound, instanceOrigin);
        if (!init || component.isStatic) {
            this.panelSections[component.instanceId] = component;
            this.panelSectionList.push(component);
        }
        component.init(intent);
        return component;
    },

    async initHeaderBars(term = 0) {
        const $hss = this.$headerSections;

        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        for (var i=0; i<$hss.length; i++) {
            this.initHeaderBar($hss[i], null, u, true);
            await delayer();
        }

        let $top = this.$headerSections.filter(asv(eds.onTop, t1));
        if ($top.length < 1) $top = this.$headerSections.filter(eid + "appbar");
        if ($top.length < 1) $top = this.$headerSections;
        if ($top.length > 0) {
            const targetComponent = $top[$top.length - 1].pageHandle;
            targetComponent?.show(false);
            this.headerCurrentOnTop = targetComponent;
        }
    },

    releaseHeaderBar(component) {
        if (component == null) return;
        const instanceId = component.instanceId;
        component.release(component.isStatic ? null : true);
        if (this.headerSections[instanceId] != null) delete this.headerSections[instanceId];
        const index = this.headerSectionList.indexOf(component);
        if (index > -1) this.headerSectionList.splice(index, 1);
    },

    initHeaderBar(bound, intent = null, instanceOrigin, init = false) {
        this.releaseHeaderBar(bound.pageHandle);
        const component = new EstreHeaderComponent(bound, instanceOrigin);
        if (!init || component.isStatic) {
            this.headerSections[component.instanceId] = component;
            this.headerSectionList.push(component);
        }
        component.init(intent);
        // if (component.isOnTop) component.show(false);
        return component;
    },

   initSessionManager() {
        this.$more = this.$mainSections.filter("#more");
        this.$sessionManager = this.$more.find(".session_manager");
        this.$sessionGroupHolder = this.$more.find(".session_group_holder");
        this.$fixedPages = this.$sessionGroupHolder.find(c.c + ".fixed_pages");
        this.$fixedPageList = this.$fixedPages.find(".session_list");
        this.$openedPages = this.$sessionGroupHolder.find(c.c + ".opened_pages");
        this.$openedPageList = this.$openedPages.find(".session_list");

        this.initSessionList(this.$fixedPageList);  
        this.initSessionList(this.$openedPageList);  
    },

    initSessionList($listHolder) {
        const $list = $listHolder.find(uis.pageShortCut);
        for (var item of $list) {
            this.setEventSessionItem($(item));
        }
    },

    setEventSessionItem($item) {
        if (!($item instanceof jQuery)) {
            this.setEventSessionItem($($item));
            return;
        }

        const inst = this;
        $item.find(btn).click(function(e) {
            const $this = $(this);
            const $item = $this.closest(".page_short_cut");
            const contained = $item.attr(eds.contained);
            const containerType = $item.attr(eds.containerType);
            const containerId = $item.attr(eds.containerId);

            switch(contained) {
                case "root":
                    if (containerType == "root_tab_content") inst.switchRootTab(containerId);
                    break;

                default:
                    if (containerType == "sub_page") {
                        const section = inst.mainSections[contained];
                        if (section.showContainer(containerId)) inst.switchRootTab(contained);
                    }
                    break;
            }
        });
    },


    focus(article) {
        const currentTopArticle = this.showingTopArticle;

        if (article == null && currentTopArticle == null) {
            let $top = this.$mainSections.filter(eid + "home");
            if ($top.length < 1) this.$mainSections.filter(cls + "home");
            if ($top.length < 1) this.$mainSections.filter(asv(eds.onTop, t1));
            if ($top.length < 1) this.$mainSections;
            const top = $top[0]?.pageHandle;
            if (top != null) {
                this.mainCurrentOnTop = top;
                top.focus();
            }
        } else if (article == currentTopArticle) return article.container.component.focus();
        else if (article == null) return currentTopArticle.container.component.focus();
    },

    reload() {
        return this.onReload();
    },

    back() {
        return this.onBack();
    },

    closeContainer() {
        return this.onCloseContainer();
    },

    
    async onReload() {
        return this.isOpenMainMenu ? await this.onReloadMenu() : false ||
            await this.onReloadBlinded() || await this.onReloadMain();
    },

    async onBack() {
        return await this.onBackOverlay() || onBackWhile() ||
            this.isOpenMainMenu ? await this.onBackMenu() || await this.closeMainMenu() : false ||
            await this.onBackBlinded() || await this.onBackMain();
    },

    async onCloseContainer() {
        return this.isOpenMainMenu ? await this.menuCurrentOnTop?.onCloseContainer() ?? false : false ||
            await this.mainCurrentOnTop?.onCloseContainer();
    },


    onReloadHeader() {
        const currentOnTop = this.headerCurrentOnTop;
        return currentOnTop?.onReload() ?? false;
    },

    onReloadMenu() {
        const currentOnTop = this.menuCurrentOnTop;
        return currentOnTop?.onReload() ?? false;
    },

    onReloadBlinded() {
        if (this.$blindSections.filter(asv(eds.onTop, t1)).length > 0) {
            return this.blindedCurrentOnTop?.onReload() ?? false;
        } else return false;
    },

    onReloadMain() {
        const currentOnTop = this.mainCurrentOnTop;
        return currentOnTop?.onReload() ?? false;
    },


    onBackOverlay() {
        if (this.$overlaySections.filter(asv(eds.onTop, t1)).length > 0) {
            return this.overlayCurrentOnTop?.onBack() ?? false;
        } else return false;
    },

    onBackMenu() {
        const currentOnTop = this.menuCurrentOnTop ?? this.menuArea;
        return currentOnTop?.onBack() ?? false;
    },

    async onBackBlinded() {
        const currentOnTop = this.blindedCurrentOnTop;
        let processed = false;
        if (currentOnTop != null) processed = await currentOnTop.onBack();
        const prevBlindedId = this.prevBlindedId;
        if (!processed && prevBlindedId != null) {
            processed = await this.showInstantBlinded(prevBlindedId);
        }
        return processed;
    },

    async onBackMain() {
        const currentOnTop = this.mainCurrentOnTop;
        let processed = false;
        if (currentOnTop != null) processed = await currentOnTop.onBack();
        if (!processed) {
            if (!currentOnTop.isHome) processed = await this.switchRootTabPrev();
            else if (currentOnTop.intent?.bringOnBack != n) {
                const bringOnBack = currentOnTop.intent?.bringOnBack;
                if (bringOnBack.pid != n && bringOnBack.hostType == currentOnTop.hostType) {
                    processed = t;
                    const pid = bringOnBack.pid;
                    if (window.isDebug) console.log("Bringing on back to " + pid);
                    delete currentOnTop.intent.bringOnBack;
                    pageManager.bringPage(pid);
                }
            }
        }
        return processed;
    },


    async onFocus() {
        const top = this.showingTopArticle ?? this.mainCurrentOnTop;
        if (window.isDebug) console.log(`[estreUi.onFocus] visibility=${document.visibilityState} hasFocus=${document.hasFocus()} top=${top?.pid ?? "(none)"}`);
        top?.focus();
    },

    async onBlur() {
        const top = this.showingTopArticle ?? this.mainCurrentOnTop;
        if (window.isDebug) console.log(`[estreUi.onBlur] visibility=${document.visibilityState} hasFocus=${document.hasFocus()} top=${top?.pid ?? "(none)"}`);
        await top?.blur();
    },


    onReady() {
        this.initialHistoryOffset = history.length;
        // note("[" + history.length + "] initial - null / null");
        this.euiState = "initializing";
        this.replaceCurrentState(null);
        this.euiState = "onReady";
        this.replaceCurrentState();

        this.focus();

        this.setUiOnReady();
    },


    async checkOnReady(awaitAsyncTasks = t, transitionDelay = 500, linkTimeout = 8000, imageTimeout = 3000) {
        // lazy load of links
        const head = doc.h;
        const lazyLinks = head.querySelectorAll(m1 + aiv(lk, lz));
        for (const lazy of lazyLinks) {
            const link = doc.ce(lk);
            for (const attr of lazy.attributes) {
                if (attr.name == "link") continue;
                link.setAttribute(attr.name, attr.value);
            }
            lazy.after(link);
            lazy.remove();
        }


        const waiters = [];

        waiters.push(EUX.setOnLinksFullyLoaded(_ => {
            if (isStandalone) {
                // is PWA

            } else {
                // isn't PWA
                updateInsets({ type: "init"});
                // setTimeout(() => updateInsets(), 3000);
                window.addEventListener("load", updateInsets);
                window.addEventListener('resize', updateInsets);
                window.addEventListener('orientationchange', updateInsets);
                document.addEventListener('scrollend', updateInsets);
            }
            
            setTimeout(() => $("main#splashRoot").css("z-index", null), 0);
        }, linkTimeout));

        waiters.push(EUX.setOnImagesFullyLoaded(_ => {
            // do nothing
        }, imageTimeout));


        if (awaitAsyncTasks) waiters.push(postPromise(resolve => {
            const callback = _ => {
                EstreAsyncManager.removeOnFinishedCurrentWorks(callback);
                resolve();
            };

            EstreAsyncManager.setOnFinishedCurrentWorks(callback);
        }));


        await Promise.all(waiters);

        setTimeout(_ => this.onReady(), transitionDelay);
    },

    setUiOnReady() {
        doc.$b.attr(eds.onReady, t0);
        setTimeout(_ => doc.$b.attr(eds.onReady, t1), cvt.t2ms($("main#splashRoot").css(a.trdr)));
    },

    unsetUiOnReady() {
        doc.$b.attr(eds.onReady, t0);
        setTimeout(_ => doc.$b.attr(eds.onReady, ""), cvt.t2ms($("main#splashRoot").css(a.trdr)));
    },

    eoo: eoo
}

