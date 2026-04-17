import { describe, test, expect } from 'vitest';

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
