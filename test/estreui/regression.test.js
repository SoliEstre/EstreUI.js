import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Regression tests for review items #001–#008.
// Each describe block corresponds to one reviewed defect. Tests here are
// intended to fail if the fix is ever reverted.
// See: .agent/estreui/review/ for the defect write-ups.

const scriptsDir = resolve(import.meta.dirname, '..', '..', 'scripts');
const readScript = name => readFileSync(resolve(scriptsDir, name), 'utf8');


// ── #001 — closePage missing return ─────────────────────────────
//
// Defect: guards inside closePage called `resolve(null)` without `return`,
// so subsequent lines ran and threw TypeError on null `page`.
// Fix: each guard now uses `return resolve(null)`.

describe('#001 regression — closePage guards early-return', () => {

    test('closePage resolves null for unknown `!` alias without throwing', async () => {
        const mgr = new EstreUiPageManager();
        await expect(mgr.closePage('!neverRegistered')).resolves.toBeNull();
    });

    test('closePage resolves null for unknown `*` alias without throwing', async () => {
        const mgr = new EstreUiPageManager();
        mgr.extPidMap = {};
        await expect(mgr.closePage('*neverRegistered')).resolves.toBeNull();
    });

    test('closePage resolves null for unregistered full PID without throwing', async () => {
        const mgr = new EstreUiPageManager();
        await expect(mgr.closePage('$s&m=neverRegistered')).resolves.toBeNull();
    });

    test('closePage source contains `return resolve(null)` guard pattern', () => {
        const src = readScript('estreUi-pageManager.js');
        // Extract closePage body
        const match = src.match(/closePage\s*\([^)]*\)\s*\{[\s\S]*?^    \}/m);
        expect(match).not.toBeNull();
        const body = match[0];
        // At least four guard lines should use the early-return pattern.
        const returnResolveCount = (body.match(/return resolve\(null\)/g) || []).length;
        expect(returnResolveCount).toBeGreaterThanOrEqual(4);
    });
});


// ── #002 — showOrBringPage scope leak + wrong arg ───────────────
//
// Defect: `pid = "*" + id` (no const/let → global) then forwarded bare `id`
// to pageManager.showOrBringPage, so the `*` prefix was dropped.
// Fix: `return pageManager.showOrBringPage("*" + id, ...)`.

describe('#002 regression — showOrBringPage delegation', () => {

    test('EstreUiCustomPageManager.showOrBringPage forwards `*` + id', () => {
        const custom = new EstreUiCustomPageManager();
        let seenPid = null;
        const original = pageManager.showOrBringPage;
        pageManager.showOrBringPage = (pid) => { seenPid = pid; return 'ok'; };
        try {
            custom.showOrBringPage('someExtId');
        } finally {
            pageManager.showOrBringPage = original;
        }
        expect(seenPid).toBe('*someExtId');
    });

    test('showOrBringPage does not leak a `pid` global', () => {
        const before = 'pid' in globalThis;
        const custom = new EstreUiCustomPageManager();
        const original = pageManager.showOrBringPage;
        pageManager.showOrBringPage = () => null;
        try {
            custom.showOrBringPage('anything');
        } finally {
            pageManager.showOrBringPage = original;
        }
        const after = 'pid' in globalThis;
        expect(after).toBe(before);
    });
});


// ── #003 — getConatiner typo ────────────────────────────────────
//
// Defect: method named `getConatiner` (typo for Container).
// Fix: renamed to `getContainer`; old typo removed entirely.

describe('#003 regression — getContainer (canonical spelling)', () => {

    test('EstreUiPageManager.getContainer exists', () => {
        const mgr = new EstreUiPageManager();
        expect(typeof mgr.getContainer).toBe('function');
    });

    test('typo spelling `getConatiner` is absent', () => {
        const mgr = new EstreUiPageManager();
        expect(mgr.getConatiner).toBeUndefined();
    });

    test('source contains no occurrence of `getConatiner`', () => {
        for (const name of ['estreUi-pageManager.js', 'estreUi-pageModel.js', 'estreUi-main.js', 'estreUi-handles.js']) {
            const src = readScript(name);
            expect(src, `${name} should not contain getConatiner`).not.toMatch(/getConatiner/);
        }
    });
});


// ── #004 — EstreDedicatedCalanderHandle typo ───────────────────
//
// Defect: class misspelled `Calander` (should be `Calendar`).
// Fix: renamed to `EstreDedicatedCalendarHandle`; typo removed.

describe('#004 regression — EstreDedicatedCalendarHandle spelling', () => {

    test('source contains canonical `EstreDedicatedCalendarHandle`', () => {
        const src = readScript('estreUi-handles.js');
        expect(src).toMatch(/class EstreDedicatedCalendarHandle\b/);
        expect(src).toMatch(/EstreDedicatedCalendarHandle\b/);
    });

    test('source contains no occurrence of the `Calander` misspelling', () => {
        for (const name of ['estreUi-handles.js', 'estreUi-pageManager.js', 'estreUi-pageModel.js', 'estreUi-main.js']) {
            const src = readScript(name);
            expect(src, `${name} should not contain Calander`).not.toMatch(/Calander/);
        }
    });

    test('unifiedCalendar / dedicatedCalendar keys map through the handles registry', () => {
        const src = readScript('estreUi-handles.js');
        expect(src).toMatch(/uis\.unifiedCalendar\][\s\S]{0,40}EstreUnifiedCalendarHandle/);
        expect(src).toMatch(/uis\.dedicatedCalendar\][\s\S]{0,40}EstreDedicatedCalendarHandle/);
    });
});


// ── #005 — switch fall-through annotation ──────────────────────
//
// Defect: bringPage/showPage switch relied on fall-through without comments,
// causing linter warnings and reader confusion.
// Fix: `// falls through` comment placed at each intentional drop-through.

describe('#005 regression — switch fall-through annotated', () => {

    test('bringPage switch has `// falls through` markers at article and container cases', () => {
        const src = readScript('estreUi-pageManager.js');
        const bringPage = src.match(/bringPage\s*\([^)]*\)\s*\{[\s\S]*?^    \}/m);
        expect(bringPage).not.toBeNull();
        const body = bringPage[0];
        // Two intentional fall-throughs: after article and after container
        const fallsThroughCount = (body.match(/\/\/ falls through/g) || []).length;
        expect(fallsThroughCount).toBeGreaterThanOrEqual(2);
    });

    test('showPage switch has `// falls through` markers', () => {
        const src = readScript('estreUi-pageManager.js');
        const showPage = src.match(/showPage\s*\([^)]*\)\s*\{[\s\S]*?^    \}/m);
        expect(showPage).not.toBeNull();
        const body = showPage[0];
        const fallsThroughCount = (body.match(/\/\/ falls through/g) || []).length;
        expect(fallsThroughCount).toBeGreaterThanOrEqual(2);
    });
});


// ── #006 — export fetch no backoff ─────────────────────────────
//
// Defect: retry on fetch failure invoked recursively without delay,
// risking log flood and server hammering.
// Fix: exponential backoff with Math.pow(2, attempt), capped at 30_000ms.

describe('#006 regression — export fetch exponential backoff', () => {

    test('estreUi-main.js retry uses Math.pow(2, attempt) backoff', () => {
        const src = readScript('estreUi-main.js');
        const backoffMatches = src.match(/Math\.min\(1000 \* Math\.pow\(2, attempt\), 30000\)/g) || [];
        // There are 8 loadExported* helpers — each should have a backoff calc.
        expect(backoffMatches.length).toBeGreaterThanOrEqual(8);
    });

    test('retry handlers use setTimeout(resolve, delay) before recursing', () => {
        const src = readScript('estreUi-main.js');
        const delayResolveMatches = src.match(/postPromise\(resolve => setTimeout\(resolve, delay\)\)/g) || [];
        expect(delayResolveMatches.length).toBeGreaterThanOrEqual(8);
    });

    test('all loadExported* handlers pass attempt + 1 on retry', () => {
        const src = readScript('estreUi-main.js');
        const recursiveRetry = src.match(/loadExported\w+\([^)]*attempt \+ 1\)/g) || [];
        expect(recursiveRetry.length).toBeGreaterThanOrEqual(8);
    });
});


// ── #007 — LocalStyle ## regex edge ────────────────────────────
//
// Defect: two-pass regex left some `##` edge cases unmatched and was
// non-obvious to maintain.
// Fix: single regex `/(^|[^#])##(?!#)/gm`.

describe('#007 regression — LocalStyle.localize ## replacement', () => {

    test('source contains the single-pass regex', () => {
        const src = readScript('estreU0EEOZ.js');
        expect(src).toMatch(/\/\(\^\|\[\^#\]\)\#\#\(\?\!#\)\/gm/);
    });

    // Functional checks against live LocalStyle.localize():
    // build a DOM tree, set styleText with various `##` forms, and verify
    // the resulting stylesheet text.

    function localizedText(styleText, { fixture } = {}) {
        document.body.innerHTML = '';
        const host = document.createElement('div');
        host.id = 'host';
        const child = document.createElement('div');
        child.className = 'child';
        host.appendChild(child);
        document.body.appendChild(host);

        // Run localize against the `child` element.
        const style = document.createElement('style');
        child.appendChild(style);
        LocalStyle.localize(style, styleText, child);
        // After localize, the style element has been replaced with outerHTML
        const written = child.querySelector('style');
        return written ? written.innerHTML : child.innerHTML;
    }

    test('## at line start is replaced with local prefix', () => {
        const out = localizedText('## { color: red; }');
        expect(out).toMatch(/div#host/);
        expect(out).not.toMatch(/\s##\s/);
        expect(out).not.toMatch(/^##/m);
    });

    test('## in middle of line is replaced when bordered by whitespace', () => {
        const out = localizedText('.parent ## .leaf { color: red; }');
        expect(out).toMatch(/\.parent .*\.leaf/);
        expect(out).not.toMatch(/##/);
    });

    test('multiple ## on same line are all replaced', () => {
        const out = localizedText('## > .a, ## > .b { color: red; }');
        const remaining = (out.match(/##/g) || []).length;
        expect(remaining).toBe(0);
    });

    test('### (triple) is left untouched (lookahead guards against it)', () => {
        const out = localizedText('### { color: red; }');
        expect(out).toMatch(/###/);
    });

    test('HTML entities (&gt;, &amp;) are decoded before replacement', () => {
        const out = localizedText('## &gt; .leaf { color: red; }');
        expect(out).not.toMatch(/&gt;/);
        expect(out).toMatch(/>/);
    });
});


// ── #008 — #isHiding / #isClosing flags never reset ────────────
//
// Defect: `#isHiding` was set in `hide()` and `#isClosing` in `close()`
// but neither was ever set back to false. For static pages cycling
// through show/hide/show/hide, the second hide's guard
// `(!this.isHiding && this.isShowing)` would fail and the call became
// a no-op. `isClosing` could also leak `true` across reuse, corrupting
// the bringOnBack branch in `onHide` and the `isFinalBlur` semantics
// planned for roadmap #006.
// Fix: reset `#isHiding = false` at the end of `onHide()` and reset
// `#isClosing = false` at the end of `close()`'s post-onClose chain.

describe('#008 regression — lifecycle flags reset', () => {

    const pageModelSrc = readScript('estreUi-pageModel.js');

    test('onHide resets #isHiding to false before returning', () => {
        const onHide = pageModelSrc.match(/async onHide\(fullyHide\)\s*\{[\s\S]*?^    \}/m);
        expect(onHide).not.toBeNull();
        const body = onHide[0];
        expect(body).toMatch(/this\.#isHiding\s*=\s*false/);
    });

    test('close resets #isClosing after the onClose chain', () => {
        const close = pageModelSrc.match(/^    close\(isTermination = false, isOnRelease = false\)\s*\{[\s\S]*?^    \}/m);
        expect(close).not.toBeNull();
        const body = close[0];
        expect(body).toMatch(/this\.#isClosing\s*=\s*false/);
    });
});
