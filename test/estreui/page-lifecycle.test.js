import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── bringPage / showPage / closePage — PID alias resolution ─────
//
// Tier 3 focuses on the alias-resolution and null-guard logic that precedes
// the DOM-heavy switch block. A fully-mounted page tree is out of scope;
// instead, these tests exercise the early-return paths that govern how
// navigation methods handle `!`/`*`-prefixed aliases and missing pages.

describe('EstreUiPageManager — PID alias resolution (sync methods)', () => {

    test('bringPage returns null for unknown `!` managed alias', () => {
        const mgr = new EstreUiPageManager();
        expect(mgr.bringPage('!nonexistentAlias')).toBeNull();
    });

    test('showPage returns null for unknown `!` managed alias', () => {
        const mgr = new EstreUiPageManager();
        expect(mgr.showPage('!nonexistentAlias')).toBeNull();
    });

    test('bringPage returns null for unknown `*` external alias', () => {
        const mgr = new EstreUiPageManager();
        mgr.extPidMap = { known: '$s&m=home' };
        expect(mgr.bringPage('*unknown')).toBeNull();
    });

    test('showPage returns null for unknown `*` external alias', () => {
        const mgr = new EstreUiPageManager();
        mgr.extPidMap = { known: '$s&m=home' };
        expect(mgr.showPage('*unknown')).toBeNull();
    });

    test('bringPage returns null for full but unregistered PID', () => {
        const mgr = new EstreUiPageManager();
        expect(mgr.bringPage('$s&m=notRegistered')).toBeNull();
    });

    test('showPage returns null for full but unregistered PID', () => {
        const mgr = new EstreUiPageManager();
        expect(mgr.showPage('$s&m=notRegistered')).toBeNull();
    });
});


describe('EstreUiPageManager — closePage promise', () => {

    test('closePage resolves null for unknown `!` alias', async () => {
        const mgr = new EstreUiPageManager();
        const result = await mgr.closePage('!nonexistentAlias');
        expect(result).toBeNull();
    });

    test('closePage resolves null for unknown `*` alias', async () => {
        const mgr = new EstreUiPageManager();
        mgr.extPidMap = { known: '$s&m=home' };
        const result = await mgr.closePage('*unknown');
        expect(result).toBeNull();
    });

    test('closePage resolves null for unregistered full PID', async () => {
        const mgr = new EstreUiPageManager();
        const result = await mgr.closePage('$s&m=notRegistered');
        expect(result).toBeNull();
    });

    test('closePage with registered page but missing sections resolves null', async () => {
        const mgr = new EstreUiPageManager();
        const page = new EstreUiPage();
        page.setSectionBound('main');
        page.setComponent('testNoSections');
        mgr.register(page);
        // page.sections getter returns estreUi.$mainSections etc. which is null in test env
        const result = await mgr.closePage(page.pid);
        expect(result).toBeNull();
    });
});


describe('EstreUiPageManager — showOrBringPage fallback', () => {

    test('showOrBringPage returns null when both show and bring fail', () => {
        const mgr = new EstreUiPageManager();
        expect(mgr.showOrBringPage('!nonexistent')).toBeNull();
    });

    test('showOrBringPage calls showPage first (falsy → bringPage fallback)', () => {
        const mgr = new EstreUiPageManager();
        const calls = [];
        mgr.showPage = (pid) => { calls.push(['show', pid]); return null; };
        mgr.bringPage = (pid) => { calls.push(['bring', pid]); return 'brought'; };
        const result = mgr.showOrBringPage('$s&m=anything');
        expect(result).toBe('brought');
        expect(calls).toEqual([['show', '$s&m=anything'], ['bring', '$s&m=anything']]);
    });

    test('showOrBringPage short-circuits when showPage returns truthy', () => {
        const mgr = new EstreUiPageManager();
        const calls = [];
        mgr.showPage = (pid) => { calls.push(['show', pid]); return 'shown'; };
        mgr.bringPage = (pid) => { calls.push(['bring', pid]); return 'brought'; };
        const result = mgr.showOrBringPage('$s&m=anything');
        expect(result).toBe('shown');
        expect(calls).toEqual([['show', '$s&m=anything']]);
    });
});


// ── EstreUiCustomPageManager — delegation contract ─────────────
//
// The custom page manager exposes user-facing `bringPage(id)`, `showPage(id)`,
// `closePage(id)`, `showOrBringPage(id)` — each must wrap `id` with a `*`
// prefix and forward to the underlying `pageManager` singleton. This is the
// contract broken by review #002 (showOrBringPage scope leak).

describe('EstreUiCustomPageManager — delegates with `*` prefix', () => {

    function withStubbedPageManager(run) {
        const original = {
            bringPage: pageManager.bringPage,
            showPage: pageManager.showPage,
            closePage: pageManager.closePage,
            showOrBringPage: pageManager.showOrBringPage,
        };
        const calls = [];
        pageManager.bringPage = (...args) => (calls.push(['bring', ...args]), 'B');
        pageManager.showPage = (...args) => (calls.push(['show', ...args]), 'S');
        pageManager.closePage = (...args) => (calls.push(['close', ...args]), 'C');
        pageManager.showOrBringPage = (...args) => (calls.push(['showOrBring', ...args]), 'SB');
        try {
            run(calls);
        } finally {
            Object.assign(pageManager, original);
        }
    }

    test('bringPage(id) → pageManager.bringPage("*" + id)', () => {
        const custom = new EstreUiCustomPageManager();
        withStubbedPageManager(calls => {
            const result = custom.bringPage('home', 'myIntent', 'origin1');
            expect(result).toBe('B');
            expect(calls).toEqual([['bring', '*home', 'myIntent', 'origin1']]);
        });
    });

    test('showPage(id) → pageManager.showPage("*" + id)', () => {
        const custom = new EstreUiCustomPageManager();
        withStubbedPageManager(calls => {
            const result = custom.showPage('home', 'myIntent', 'origin1');
            expect(result).toBe('S');
            expect(calls).toEqual([['show', '*home', 'myIntent', 'origin1']]);
        });
    });

    test('closePage(id) → pageManager.closePage("*" + id)', () => {
        const custom = new EstreUiCustomPageManager();
        withStubbedPageManager(calls => {
            const result = custom.closePage('home', true, 'origin1');
            expect(result).toBe('C');
            expect(calls).toEqual([['close', '*home', true, 'origin1']]);
        });
    });

    test('showOrBringPage(id) → pageManager.showOrBringPage("*" + id)', () => {
        const custom = new EstreUiCustomPageManager();
        withStubbedPageManager(calls => {
            const result = custom.showOrBringPage('home', 'myIntent', 'origin1');
            expect(result).toBe('SB');
            expect(calls).toEqual([['showOrBring', '*home', 'myIntent', 'origin1']]);
        });
    });
});


// ── findPid / get / getComponent ────────────────────────────────

describe('EstreUiPageManager — page registry lookups', () => {

    test('register + get by pid', () => {
        const mgr = new EstreUiPageManager();
        const page = new EstreUiPage();
        page.setSectionBound('main');
        page.setComponent('lookup1');
        mgr.register(page);
        expect(mgr.get(page.pid)).toBe(page);
    });

    test('findPid resolves statementless PID', () => {
        const mgr = new EstreUiPageManager();
        const page = new EstreUiPage();
        page.setSectionBound('main');
        page.setComponent('lookup2');
        mgr.register(page);
        // page.pid is '$&m=lookup2' — no $s/$i prefix. findPid handles bare PIDs.
        expect(mgr.findPid(page.pid)).toBe(page.pid);
        expect(mgr.findPid('unknownPid')).toBeNull();
        expect(mgr.findPid(null)).toBeNull();
    });

    test('getContainer returns null when no match (canonical name — #003 fix)', () => {
        const mgr = new EstreUiPageManager();
        expect(mgr.getContainer('noSuch', 'noComp', 'main')).toBeNull();
    });

    test('register is idempotent — second register of same PID is a no-op', () => {
        const mgr = new EstreUiPageManager();
        const p1 = new EstreUiPage();
        p1.setSectionBound('main');
        p1.setComponent('dup');
        mgr.register(p1);

        const p2 = new EstreUiPage();
        p2.setSectionBound('main');
        p2.setComponent('dup');
        mgr.register(p2);

        expect(mgr.get(p1.pid)).toBe(p1);
    });
});


// ── Roadmap #006 phase A — focus tracking groundwork ───────────
//
// Verifies that the page handle exposes a `lastFocusedElement` slot
// and that estreUi-main.js wires up a document-level focusin listener
// to record into it. Behavioral verification of the listener requires a
// fully-mounted estreUi.init(), which is out of scope here; we instead
// check for the wiring at the source level.

describe('Roadmap #006 phase A — lastFocusedElement tracking', () => {

    const scriptsDir = resolve(import.meta.dirname, '..', '..', 'scripts');
    const readScript = name => readFileSync(resolve(scriptsDir, name), 'utf8');

    test('estreUi-main.js installs a document focusin listener with capture', () => {
        const src = readScript('estreUi-main.js');
        expect(src).toMatch(/document\.addEventListener\(\s*["']focusin["'][\s\S]*?,\s*true\s*\)/);
    });

    test('focusin listener records lastFocusedElement on the topmost handle', () => {
        const src = readScript('estreUi-main.js');
        const block = src.match(/document\.addEventListener\(\s*["']focusin["'][\s\S]{0,400}?,\s*true\s*\)/);
        expect(block).not.toBeNull();
        const body = block[0];
        expect(body).toMatch(/showingTopArticle/);
        expect(body).toMatch(/lastFocusedElement\s*=\s*e\.target/);
    });

    test('onClose clears lastFocusedElement to release the DOM reference', () => {
        const src = readScript('estreUi-pageModel.js');
        const onClose = src.match(/async onClose\(isTermination = false, isOnRelease = false\)\s*\{[\s\S]*?^    \}/m);
        expect(onClose).not.toBeNull();
        expect(onClose[0]).toMatch(/this\.lastFocusedElement\s*=\s*null/);
    });
});


// ── Roadmap #006 phase B — autoFocus + handler return contract ─

describe('Roadmap #006 phase B — pageManager.autoFocus priority', () => {

    function buildHost(html) {
        document.body.innerHTML = '';
        const host = document.createElement('div');
        host.innerHTML = html;
        document.body.appendChild(host);
        return host;
    }

    test('autoFocus picks first [data-autofocus] on first focus', () => {
        const host = buildHost(`
            <input class="a">
            <input class="b" data-autofocus>
            <input class="c" data-autofocus>
        `);
        const handle = { host, lastFocusedElement: null };
        const ok = pageManager.autoFocus(handle, true);
        expect(ok).toBe(true);
        expect(document.activeElement).toBe(host.querySelector('.b'));
    });

    test('autoFocus restores lastFocusedElement on subsequent focus', () => {
        const host = buildHost(`
            <input class="a">
            <input class="b" data-autofocus>
            <input class="c">
        `);
        const last = host.querySelector('.c');
        const handle = { host, lastFocusedElement: last };
        const ok = pageManager.autoFocus(handle, false);
        expect(ok).toBe(true);
        expect(document.activeElement).toBe(last);
    });

    test('autoFocus skips lastFocusedElement on first focus (data-autofocus wins)', () => {
        const host = buildHost(`
            <input class="a">
            <input class="b" data-autofocus>
            <input class="c">
        `);
        const handle = { host, lastFocusedElement: host.querySelector('.c') };
        pageManager.autoFocus(handle, true);
        expect(document.activeElement).toBe(host.querySelector('.b'));
    });

    test('autoFocus falls back to first focusable when no data-autofocus is present', () => {
        const host = buildHost(`
            <span>not focusable</span>
            <input class="first">
            <input class="second">
        `);
        const handle = { host, lastFocusedElement: null };
        const ok = pageManager.autoFocus(handle, true);
        expect(ok).toBe(true);
        expect(document.activeElement).toBe(host.querySelector('.first'));
    });

    test('autoFocus skips disabled and hidden elements', () => {
        const host = buildHost(`
            <input class="d" disabled>
            <input class="h" hidden>
            <input class="ok">
        `);
        const handle = { host, lastFocusedElement: null };
        pageManager.autoFocus(handle, true);
        expect(document.activeElement).toBe(host.querySelector('.ok'));
    });

    test('autoFocus returns false when host has no focusable element', () => {
        const host = buildHost(`<span>nothing</span>`);
        const handle = { host, lastFocusedElement: null };
        const ok = pageManager.autoFocus(handle, true);
        expect(ok).toBe(false);
    });

    test('autoFocus returns false when handle has no host', () => {
        expect(pageManager.autoFocus({ host: null }, true)).toBe(false);
        expect(pageManager.autoFocus(null, true)).toBe(false);
    });
});


describe('Roadmap #006 phase B — handler return-value contract', () => {

    const scriptsDir = resolve(import.meta.dirname, '..', '..', 'scripts');
    const readScript = name => readFileSync(resolve(scriptsDir, name), 'utf8');

    test('pageHandle.onFocus passes isFirstFocus and routes through handler then autoFocus', () => {
        const src = readScript('estreUi-pageModel.js');
        const onFocus = src.match(/^    onFocus\(\)\s*\{[\s\S]*?^    \}/m);
        expect(onFocus).not.toBeNull();
        const body = onFocus[0];
        expect(body).toMatch(/isFirstFocus\s*=\s*!this\.#everFocused/);
        expect(body).toMatch(/this\.handler\?\.onFocus\?\.\(this,\s*isFirstFocus\)/);
        expect(body).toMatch(/handled\s*===\s*true/);
        expect(body).toMatch(/pageManager\.autoFocus\?\.\(this,\s*isFirstFocus\)/);
    });

    test('pageHandle.onFocus snapshots activeElement into lastFocusedElement when handler returns true', () => {
        const src = readScript('estreUi-pageModel.js');
        const onFocus = src.match(/^    onFocus\(\)\s*\{[\s\S]*?^    \}/m);
        expect(onFocus).not.toBeNull();
        const body = onFocus[0];
        expect(body).toMatch(/document\.activeElement/);
        expect(body).toMatch(/this\.host\?\.contains\(ae\)/);
        expect(body).toMatch(/this\.lastFocusedElement\s*=\s*ae/);
    });

    test('pageHandle.onBlur passes this.isClosing as the isFinalBlur arg', () => {
        const src = readScript('estreUi-pageModel.js');
        const onBlur = src.match(/^    async onBlur\(\)\s*\{[\s\S]*?^    \}/m);
        expect(onBlur).not.toBeNull();
        expect(onBlur[0]).toMatch(/this\.handler\?\.onBlur\?\.\(this,\s*this\.isClosing\)/);
    });

    test('onClose resets #everFocused so re-opened static pages see isFirstFocus again', () => {
        const src = readScript('estreUi-pageModel.js');
        const onClose = src.match(/async onClose\(isTermination = false, isOnRelease = false\)\s*\{[\s\S]*?^    \}/m);
        expect(onClose).not.toBeNull();
        expect(onClose[0]).toMatch(/this\.#everFocused\s*=\s*false/);
    });

    test('dialog handlers return true from onFocus to opt out of autoFocus', () => {
        const src = readScript('estreUi-pageModel.js');
        // Six dialog handlers all use return true after $element.focus()
        const dialogReturns = src.match(/this\.\$\w+(?:\[0\])?\??\.focus\(\);\s*return true;/g) || [];
        expect(dialogReturns.length).toBeGreaterThanOrEqual(6);
    });
});


// ── Roadmap #006 phase C — top-level focus + visibilitychange ──

describe('Roadmap #006 phase C — estreUi.onFocus / onBlur wiring', () => {

    const scriptsDir = resolve(import.meta.dirname, '..', '..', 'scripts');
    const readScript = name => readFileSync(resolve(scriptsDir, name), 'utf8');

    test('estreUi.onFocus routes to the topmost handle.focus()', () => {
        const src = readScript('estreUi-main.js');
        const onFocus = src.match(/^    async onFocus\(\)\s*\{[\s\S]*?^    \},/m);
        expect(onFocus).not.toBeNull();
        const body = onFocus[0];
        expect(body).toMatch(/showingTopArticle\s*\?\?\s*this\.mainCurrentOnTop/);
        expect(body).toMatch(/top\?\.focus\(\)/);
    });

    test('estreUi.onBlur awaits the topmost handle.blur()', () => {
        const src = readScript('estreUi-main.js');
        const onBlur = src.match(/^    async onBlur\(\)\s*\{[\s\S]*?^    \},/m);
        expect(onBlur).not.toBeNull();
        const body = onBlur[0];
        expect(body).toMatch(/await top\?\.blur\(\)/);
    });

    test('visibilitychange listener routes to onFocus/onBlur', () => {
        const src = readScript('estreUi-main.js');
        const block = src.match(/document\.addEventListener\(\s*["']visibilitychange["'][\s\S]{0,400}?\}\s*\)/);
        expect(block).not.toBeNull();
        const body = block[0];
        expect(body).toMatch(/document\.visibilityState\s*===\s*["']visible["']/);
        expect(body).toMatch(/this\.onFocus\(\)/);
        expect(body).toMatch(/this\.onBlur\(\)/);
    });
});
