import { describe, test, expect, beforeEach, afterEach } from 'vitest';

// ── EstreCoverBarHandle — entry CRUD + DOM render + click routing ─────
//
// The handle owns the fixedBottom cover-bar surface. Each test spins up a
// fresh instance bound to a minimal DOM scaffold (the two nav siblings)
// so the suite is isolated from estreUi's global init path.
//
// All assertions use native DOM API — the cover bar is intentionally
// jQuery-agnostic internally (the framework's jQuery fallback under
// jsdom does not implement .on / .attr / etc.).

function makeFixedBottom() {
    document.body.innerHTML = `
        <footer id="fixedBottom">
            <nav id="customFixedSections"></nav>
            <nav id="rootbar"></nav>
            <nav id="instantSections"></nav>
        </footer>
    `;
    return document.getElementById('fixedBottom');
}

describe('EstreCoverBarHandle — CRUD + rendering', () => {

    let handle;
    let instant;
    beforeEach(() => {
        handle = new EstreCoverBarHandle(makeFixedBottom());
        instant = handle.instantSections;
    });

    test('pushEntry returns positive integer tokens that increase monotonically', () => {
        const a = handle.pushEntry({ title: 'A' });
        const b = handle.pushEntry({ title: 'B' });
        expect(typeof a).toBe('number');
        expect(a).toBeGreaterThan(0);
        expect(b).toBeGreaterThan(a);
    });

    test('pushEntry appends a button into instantSections with the cover-token attr', () => {
        const token = handle.pushEntry({ title: 'Hello' });
        const btn = instant.querySelector(`[data-cover-token="${token}"]`);
        expect(btn).not.toBeNull();
        expect(btn.querySelector(':scope > label').textContent).toBe('Hello');
    });

    test('pushEntry sets the title attr to the cover title (native tooltip)', () => {
        const token = handle.pushEntry({ title: '엠피솔루션학원 - 유성직원·유성교사·유성선생' });
        const btn = instant.querySelector(`[data-cover-token="${token}"]`);
        expect(btn.getAttribute('title')).toBe('엠피솔루션학원 - 유성직원·유성교사·유성선생');
    });

    test('updateEntry title rewrites the tooltip in sync with the label', () => {
        const token = handle.pushEntry({ title: 'Old' });
        handle.updateEntry(token, { title: 'New' });
        const btn = instant.querySelector(`[data-cover-token="${token}"]`);
        expect(btn.getAttribute('title')).toBe('New');
        expect(btn.querySelector(':scope > label').textContent).toBe('New');
    });

    test('default icon resolves by sectionBound (main → static)', () => {
        const token = handle.pushEntry({ title: 'P', sectionBound: 'main', icon: '' });
        const img = instant.querySelector(`[data-cover-token="${token}"] .cover_icon > img`);
        expect(img.getAttribute('src')).toBe('./vectors/cover-icon-default-static.svg');
    });

    test('default icon resolves by sectionBound (blind → instant)', () => {
        const token = handle.pushEntry({ title: 'P', sectionBound: 'blind', icon: '' });
        const img = instant.querySelector(`[data-cover-token="${token}"] .cover_icon > img`);
        expect(img.getAttribute('src')).toBe('./vectors/cover-icon-default-instant.svg');
    });

    test('default icon resolves by sectionBound (overlay → overlay)', () => {
        const token = handle.pushEntry({ title: 'P', sectionBound: 'overlay', icon: '' });
        const img = instant.querySelector(`[data-cover-token="${token}"] .cover_icon > img`);
        expect(img.getAttribute('src')).toBe('./vectors/cover-icon-default-overlay.svg');
    });

    test('icon "none" / null renders text-only — no cover_icon span', () => {
        const tNone = handle.pushEntry({ title: 'A', sectionBound: 'main', icon: 'none' });
        const tNull = handle.pushEntry({ title: 'B', sectionBound: 'main', icon: null });
        expect(instant.querySelector(`[data-cover-token="${tNone}"] .cover_icon`)).toBeNull();
        expect(instant.querySelector(`[data-cover-token="${tNull}"] .cover_icon`)).toBeNull();
    });

    test('explicit icon URL is rendered as-is', () => {
        const token = handle.pushEntry({ title: 'P', sectionBound: 'main', icon: '/custom.svg' });
        const img = instant.querySelector(`[data-cover-token="${token}"] .cover_icon > img`);
        expect(img.getAttribute('src')).toBe('/custom.svg');
    });

    test('removeEntry detaches the DOM and drops the state entry', () => {
        const token = handle.pushEntry({ title: 'X' });
        expect(handle.entries.length).toBe(1);
        expect(handle.removeEntry(token)).toBe(true);
        expect(handle.entries.length).toBe(0);
        expect(instant.querySelector('[data-cover-token]')).toBeNull();
    });

    test('removeEntry returns false on unknown token', () => {
        expect(handle.removeEntry(999)).toBe(false);
    });

    test('removeEntry clears activeToken when removing the active entry', () => {
        const a = handle.pushEntry({ title: 'A' });
        const b = handle.pushEntry({ title: 'B' });
        handle.setActiveByToken(a);
        expect(handle.activeToken).toBe(a);
        handle.removeEntry(a);
        expect(handle.activeToken).toBeNull();
        // Removing a non-active entry leaves activeToken alone:
        handle.setActiveByToken(b);
        const c = handle.pushEntry({ title: 'C' });
        handle.removeEntry(c);
        expect(handle.activeToken).toBe(b);
    });

    test('setActiveByToken toggles data-active mutually exclusively', () => {
        const a = handle.pushEntry({ title: 'A' });
        const b = handle.pushEntry({ title: 'B' });
        handle.setActiveByToken(a);
        expect(instant.querySelector(`[data-cover-token="${a}"]`).getAttribute('data-active')).toBe('1');
        handle.setActiveByToken(b);
        expect(instant.querySelector(`[data-cover-token="${a}"]`).getAttribute('data-active')).toBe('');
        expect(instant.querySelector(`[data-cover-token="${b}"]`).getAttribute('data-active')).toBe('1');
    });

    test('setActiveByToken(null) clears the active state', () => {
        const a = handle.pushEntry({ title: 'A' });
        handle.setActiveByToken(a);
        expect(handle.activeToken).toBe(a);
        expect(handle.setActiveByToken(null)).toBe(true);
        expect(handle.activeToken).toBeNull();
        expect(instant.querySelector(`[data-cover-token="${a}"]`).getAttribute('data-active')).toBe('');
    });

    test('setActiveByToken(null) is a no-op when no entry is active', () => {
        handle.pushEntry({ title: 'A' });
        expect(handle.activeToken).toBeNull();
        expect(handle.setActiveByToken(null)).toBe(true);
        expect(handle.activeToken).toBeNull();
    });

    test('setActiveByToken(undefined) clears like null', () => {
        const a = handle.pushEntry({ title: 'A' });
        handle.setActiveByToken(a);
        expect(handle.setActiveByToken(undefined)).toBe(true);
        expect(handle.activeToken).toBeNull();
    });

    test('setMinimizedByToken toggles data-minimized', () => {
        const token = handle.pushEntry({ title: 'A' });
        handle.setMinimizedByToken(token, true);
        expect(instant.querySelector(`[data-cover-token="${token}"]`).getAttribute('data-minimized')).toBe('1');
        handle.setMinimizedByToken(token, false);
        expect(instant.querySelector(`[data-cover-token="${token}"]`).getAttribute('data-minimized')).toBe('');
    });

    test('updateEntry rewrites label and icon in place', () => {
        const token = handle.pushEntry({ title: 'Old', sectionBound: 'blind', icon: '/before.svg' });
        handle.updateEntry(token, { title: 'New', icon: '/after.svg' });
        const btn = instant.querySelector(`[data-cover-token="${token}"]`);
        expect(btn.querySelector(':scope > label').textContent).toBe('New');
        expect(btn.querySelector('.cover_icon > img').getAttribute('src')).toBe('/after.svg');
    });

    test('updateEntry icon → "none" removes the icon span', () => {
        const token = handle.pushEntry({ title: 'A', sectionBound: 'main', icon: '/x.svg' });
        expect(instant.querySelector(`[data-cover-token="${token}"] .cover_icon`)).not.toBeNull();
        handle.updateEntry(token, { icon: 'none' });
        expect(instant.querySelector(`[data-cover-token="${token}"] .cover_icon`)).toBeNull();
    });

    test('pushEntry with badge: 5 sets data-badge="5" on the cover_icon', () => {
        const token = handle.pushEntry({ title: 'A', sectionBound: 'overlay', icon: '/x.svg', badge: 5 });
        const icon = instant.querySelector(`[data-cover-token="${token}"] > .cover_icon`);
        expect(icon).not.toBeNull();
        expect(icon.getAttribute('data-badge')).toBe('5');
    });

    test('pushEntry with badge: 1 sets data-badge="" (dot via CSS [data-badge=""])', () => {
        const token = handle.pushEntry({ title: 'A', sectionBound: 'overlay', icon: '/x.svg', badge: 1 });
        const icon = instant.querySelector(`[data-cover-token="${token}"] > .cover_icon`);
        expect(icon.getAttribute('data-badge')).toBe('');
    });

    test('pushEntry with badge > 99 caps the data-badge value at "99+"', () => {
        const token = handle.pushEntry({ title: 'A', sectionBound: 'overlay', icon: '/x.svg', badge: 234 });
        const icon = instant.querySelector(`[data-cover-token="${token}"] > .cover_icon`);
        expect(icon.getAttribute('data-badge')).toBe('99+');
    });

    test('pushEntry without badge leaves the cover_icon free of [data-badge]', () => {
        const token = handle.pushEntry({ title: 'A', sectionBound: 'overlay', icon: '/x.svg' });
        const icon = instant.querySelector(`[data-cover-token="${token}"] > .cover_icon`);
        expect(icon.hasAttribute('data-badge')).toBe(false);
    });

    test('updateEntry { badge: 0 } removes the data-badge attribute', () => {
        const token = handle.pushEntry({ title: 'A', sectionBound: 'overlay', icon: '/x.svg', badge: 3 });
        const icon = instant.querySelector(`[data-cover-token="${token}"] > .cover_icon`);
        expect(icon.hasAttribute('data-badge')).toBe(true);
        handle.updateEntry(token, { badge: 0 });
        expect(icon.hasAttribute('data-badge')).toBe(false);
    });

    test('updateEntry rewrites data-badge in place on the same .cover_icon node', () => {
        const token = handle.pushEntry({ title: 'A', sectionBound: 'overlay', icon: '/x.svg', badge: 1 });
        const first = instant.querySelector(`[data-cover-token="${token}"] > .cover_icon`);
        handle.updateEntry(token, { badge: 7 });
        const second = instant.querySelector(`[data-cover-token="${token}"] > .cover_icon`);
        expect(second).toBe(first); // same icon element
        expect(second.getAttribute('data-badge')).toBe('7');
    });

    test('badge on icon-less entry (icon: "none") is a no-op (no .cover_icon host)', () => {
        const token = handle.pushEntry({ title: 'A', icon: 'none', badge: 5 });
        const btn = instant.querySelector(`[data-cover-token="${token}"]`);
        expect(btn.querySelector('.cover_icon')).toBeNull();
        expect(btn.hasAttribute('data-badge')).toBe(false);
    });

    test('updateEntry icon → "" falls back to the sectionBound default', () => {
        const token = handle.pushEntry({ title: 'A', sectionBound: 'overlay', icon: '/x.svg' });
        handle.updateEntry(token, { icon: '' });
        expect(instant.querySelector(`[data-cover-token="${token}"] .cover_icon > img`).getAttribute('src'))
            .toBe('./vectors/cover-icon-default-overlay.svg');
    });
});

describe('EstreCoverBarHandle — click routing', () => {

    let handle;
    let instant;
    let pageHandle;
    let calls;
    beforeEach(() => {
        handle = new EstreCoverBarHandle(makeFixedBottom());
        instant = handle.instantSections;
        calls = [];
        // Minimal pageHandle stand-in. Records show/hide invocations.
        pageHandle = {
            show: (...args) => { calls.push(['show', ...args]); },
            hide: (...args) => { calls.push(['hide', ...args]); },
        };
    });

    test('inactive entry click → pageHandle.show(true, true)', () => {
        const token = handle.pushEntry({ pageHandle, title: 'P' });
        instant.querySelector(`[data-cover-token="${token}"]`).click();
        expect(calls).toEqual([['show', true, true]]);
    });

    test('active + non-minimized click → pageHandle.hide()', () => {
        const token = handle.pushEntry({ pageHandle, title: 'P' });
        handle.setActiveByToken(token);
        instant.querySelector(`[data-cover-token="${token}"]`).click();
        expect(calls).toEqual([['hide']]);
    });

    test('active + minimized click → pageHandle.show (restore)', () => {
        const token = handle.pushEntry({ pageHandle, title: 'P' });
        handle.setActiveByToken(token);
        handle.setMinimizedByToken(token, true);
        instant.querySelector(`[data-cover-token="${token}"]`).click();
        expect(calls).toEqual([['show', true, true]]);
    });

    test('click on entry without pageHandle (Phase 3 placeholder) is a no-op', () => {
        const token = handle.pushEntry({ title: 'External' });
        instant.querySelector(`[data-cover-token="${token}"]`).click();
        expect(calls).toEqual([]);
    });
});


// ── EstreCoverBarHandle — overflow measurement + dropdown ─────────────
//
// jsdom does not lay out CSS, so scrollWidth / clientWidth are always 0
// out of the box. Each suite stubs both as computed getters that fake a
// fixed per-entry width and treat the sentinel's reserved width as part
// of the budget — so the handle's "hide one until it fits" loop walks
// realistically.

function makeFixedBottomWithTopLayer() {
    document.body.innerHTML = `
        <footer id="fixedBottom">
            <nav id="customFixedSections"></nav>
            <nav id="rootbar"></nav>
            <nav id="instantSections"></nav>
        </footer>
        <div id="topLayer"></div>
    `;
    return {
        fixedBottom: document.getElementById('fixedBottom'),
        topLayer: document.getElementById('topLayer'),
    };
}

function stubAreaOverflow(area, entryWidth, sentinelWidth, clientWidth) {
    Object.defineProperty(area, 'scrollWidth', {
        configurable: true,
        get() {
            const visible = area.querySelectorAll(
                '.cover_entry:not([data-overflowed="1"])'
            ).length;
            const sent = area.querySelector('.cover_overflow_sentinel');
            const sentOn = sent != null && !sent.hidden;
            return visible * entryWidth + (sentOn ? sentinelWidth : 0);
        },
    });
    Object.defineProperty(area, 'clientWidth', {
        configurable: true,
        get: () => clientWidth,
    });
}

describe('EstreCoverBarHandle — overflow measurement', () => {

    let handle;
    let instant;
    let sentinel;
    beforeEach(() => {
        const { fixedBottom, topLayer } = makeFixedBottomWithTopLayer();
        handle = new EstreCoverBarHandle(fixedBottom, topLayer);
        instant = handle.instantSections;
        sentinel = instant.querySelector('.cover_overflow_sentinel');
        // 100 px per entry, 30 px sentinel, 250 px wide nav.
        //   2 entries → 200 ≤ 250  → no overflow
        //   3 entries → 300 > 250  → overflow; sentinel(30) + 2 entries(200) = 230 ≤ 250
        stubAreaOverflow(instant, 100, 30, 250);
    });

    test('constructor appends a hidden sentinel into instantSections', () => {
        expect(sentinel).not.toBeNull();
        expect(sentinel.hidden).toBe(true);
        expect(sentinel.getAttribute('data-area')).toBe('instant');
    });

    test('sentinel renders an inline ^-chevron SVG (not a unicode glyph)', () => {
        // The chevron must be an SVG so it sizes / positions independently of
        // the platform font, and so it picks up currentColor for hover state.
        const svg = sentinel.querySelector('svg');
        expect(svg).not.toBeNull();
        expect(svg.getAttribute('viewBox')).toBe('0 0 12 8');
        const polyline = svg.querySelector('polyline');
        expect(polyline).not.toBeNull();
        expect(polyline.getAttribute('stroke')).toBe('currentColor');
    });

    test('sentinel stays hidden when entries fit', () => {
        handle.pushEntry({ title: 'A' });
        handle.pushEntry({ title: 'B' });
        expect(sentinel.hidden).toBe(true);
        expect(instant.querySelectorAll('[data-overflowed="1"]').length).toBe(0);
    });

    test('sentinel reveals + newest entries get data-overflowed when too many', () => {
        const a = handle.pushEntry({ title: 'A' });
        const b = handle.pushEntry({ title: 'B' });
        const c = handle.pushEntry({ title: 'C' });
        const d = handle.pushEntry({ title: 'D' });
        expect(sentinel.hidden).toBe(false);
        // Sentinel(30) + 2 visible entries(200) = 230 ≤ 250 → 2 entries hidden.
        // instantSections hides from the trailing edge — the most-recently
        // pushed entries (closest to the sentinel) drop into the dropdown first.
        expect(instant.querySelector(`[data-cover-token="${a}"]`).getAttribute('data-overflowed')).toBeNull();
        expect(instant.querySelector(`[data-cover-token="${b}"]`).getAttribute('data-overflowed')).toBeNull();
        expect(instant.querySelector(`[data-cover-token="${c}"]`).getAttribute('data-overflowed')).toBe('1');
        expect(instant.querySelector(`[data-cover-token="${d}"]`).getAttribute('data-overflowed')).toBe('1');
    });

    test('removeEntry triggers recompute — sentinel re-hides once everything fits', () => {
        const a = handle.pushEntry({ title: 'A' });
        const b = handle.pushEntry({ title: 'B' });
        handle.pushEntry({ title: 'C' });
        handle.pushEntry({ title: 'D' });
        expect(sentinel.hidden).toBe(false);
        handle.removeEntry(a);
        handle.removeEntry(b);
        expect(sentinel.hidden).toBe(true);
        expect(instant.querySelectorAll('[data-overflowed="1"]').length).toBe(0);
    });

    test('handle constructed without topLayer still measures overflow safely', () => {
        document.body.innerHTML = `
            <footer id="fixedBottom">
                <nav id="customFixedSections"></nav>
                <nav id="rootbar"></nav>
                <nav id="instantSections"></nav>
            </footer>
        `;
        const h = new EstreCoverBarHandle(document.getElementById('fixedBottom'));
        const inst = h.instantSections;
        stubAreaOverflow(inst, 100, 30, 250);
        h.pushEntry({ title: 'A' });
        h.pushEntry({ title: 'B' });
        h.pushEntry({ title: 'C' });
        // Sentinel reveals; opening a dropdown is just a no-op when topLayer is null.
        expect(inst.querySelector('.cover_overflow_sentinel').hidden).toBe(false);
    });
});

describe('EstreCoverBarHandle — overflow dropdown', () => {

    let handle;
    let instant;
    let topLayer;
    let sentinel;
    beforeEach(() => {
        const fb = makeFixedBottomWithTopLayer();
        handle = new EstreCoverBarHandle(fb.fixedBottom, fb.topLayer);
        instant = handle.instantSections;
        topLayer = fb.topLayer;
        sentinel = instant.querySelector('.cover_overflow_sentinel');
        stubAreaOverflow(instant, 100, 30, 250);
    });

    test('clicking sentinel mounts a dropdown into topLayer with overflowed rows', () => {
        handle.pushEntry({ title: 'A' });
        handle.pushEntry({ title: 'B' });
        const c = handle.pushEntry({ title: 'C' });
        const d = handle.pushEntry({ title: 'D' });
        sentinel.click();
        const dropdown = topLayer.querySelector('.cover_overflow_dropdown');
        expect(dropdown).not.toBeNull();
        expect(dropdown.getAttribute('data-area')).toBe('instant');
        const rows = dropdown.querySelectorAll('.cover_entry');
        expect(rows.length).toBe(2);
        // Newest hidden first — d was pushed last so it sat closest to the
        // sentinel; reading the dropdown top-down should show d → c.
        expect(rows[0].getAttribute('data-cover-token')).toBe(String(d));
        expect(rows[1].getAttribute('data-cover-token')).toBe(String(c));
        expect(sentinel.getAttribute('data-opened')).toBe('1');
    });

    test('clicking the sentinel again toggles it closed', () => {
        handle.pushEntry({ title: 'A' });
        handle.pushEntry({ title: 'B' });
        handle.pushEntry({ title: 'C' });
        handle.pushEntry({ title: 'D' });
        sentinel.click();
        expect(topLayer.querySelector('.cover_overflow_dropdown')).not.toBeNull();
        sentinel.click();
        expect(topLayer.querySelector('.cover_overflow_dropdown')).toBeNull();
        expect(sentinel.getAttribute('data-opened')).toBeNull();
    });

    test('outside pointerdown closes the dropdown', () => {
        handle.pushEntry({ title: 'A' });
        handle.pushEntry({ title: 'B' });
        handle.pushEntry({ title: 'C' });
        handle.pushEntry({ title: 'D' });
        sentinel.click();
        document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(topLayer.querySelector('.cover_overflow_dropdown')).toBeNull();
    });

    test('pointerdown INSIDE the dropdown does not close it', () => {
        handle.pushEntry({ title: 'A' });
        handle.pushEntry({ title: 'B' });
        handle.pushEntry({ title: 'C' });
        handle.pushEntry({ title: 'D' });
        sentinel.click();
        const dropdown = topLayer.querySelector('.cover_overflow_dropdown');
        dropdown.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(topLayer.querySelector('.cover_overflow_dropdown')).not.toBeNull();
    });

    test('Escape closes the dropdown', () => {
        handle.pushEntry({ title: 'A' });
        handle.pushEntry({ title: 'B' });
        handle.pushEntry({ title: 'C' });
        handle.pushEntry({ title: 'D' });
        sentinel.click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(topLayer.querySelector('.cover_overflow_dropdown')).toBeNull();
    });

    test('dropdown row routes the click through #onEntryClicked + closes itself', () => {
        const calls = [];
        const pageHandle = {
            show: (...args) => { calls.push(['show', ...args]); },
            hide: () => { calls.push(['hide']); },
        };
        handle.pushEntry({ title: 'A' });
        handle.pushEntry({ title: 'B' });
        handle.pushEntry({ title: 'C' });
        // d is the newest push → trailing hide puts it in the dropdown.
        const d = handle.pushEntry({ pageHandle, title: 'D' });
        sentinel.click();
        const row = topLayer.querySelector(
            `.cover_overflow_dropdown [data-cover-token="${d}"]`
        );
        row.click();
        expect(calls).toEqual([['show', true, true]]);
        expect(topLayer.querySelector('.cover_overflow_dropdown')).toBeNull();
    });

    test('opening with no topLayer is a safe no-op', () => {
        document.body.innerHTML = `
            <footer id="fixedBottom">
                <nav id="customFixedSections"></nav>
                <nav id="rootbar"></nav>
                <nav id="instantSections"></nav>
            </footer>
        `;
        const h = new EstreCoverBarHandle(document.getElementById('fixedBottom'));
        const inst = h.instantSections;
        const sent = inst.querySelector('.cover_overflow_sentinel');
        stubAreaOverflow(inst, 100, 30, 250);
        h.pushEntry({ title: 'A' });
        h.pushEntry({ title: 'B' });
        h.pushEntry({ title: 'C' });
        expect(() => sent.click()).not.toThrow();
    });
});


// ── EstreCoverBarHandle — entry context menu (right-click) ────────────
//
// Right-click on an external-embed entry (onAction !== null) opens a small
// menu in #topLayer with a title header and three action items: 화면
// 가운데로 이동 (placeholder for the embed API), 최소화/복원 (label flips
// on entry.minimized), 닫기. Each item delegates to entry.onAction with
// the corresponding action token. Internal page-handle entries are not
// targeted (they have their own navigation).

describe('EstreCoverBarHandle — entry context menu', () => {

    let handle;
    let instant;
    let topLayer;
    let calls;
    beforeEach(() => {
        const fb = makeFixedBottomWithTopLayer();
        handle = new EstreCoverBarHandle(fb.fixedBottom, fb.topLayer);
        instant = handle.instantSections;
        topLayer = fb.topLayer;
        calls = [];
    });

    function rightClick(el) {
        const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 100, clientY: 100 });
        el.dispatchEvent(event);
    }

    test('contextmenu on external entry mounts a menu with title + 3 items', () => {
        const token = handle.pushEntry({
            title: 'Embed Title',
            onAction: (action) => { calls.push(action); },
        });
        const btn = instant.querySelector(`[data-cover-token="${token}"]`);
        rightClick(btn);
        const menu = topLayer.querySelector('.cover_entry_menu');
        expect(menu).not.toBeNull();
        expect(menu.querySelector('header.cover_menu_title').textContent).toBe('Embed Title');
        const items = menu.querySelectorAll('button.cover_menu_item');
        expect(items.length).toBe(3);
        expect(items[0].getAttribute('data-action')).toBe('center');
        expect(items[1].getAttribute('data-action')).toBe('minimize');
        expect(items[2].getAttribute('data-action')).toBe('close');
    });

    test('contextmenu on internal page-handle entry (no onAction) does NOT open', () => {
        const pageHandle = { show: () => {}, hide: () => {} };
        const token = handle.pushEntry({ pageHandle, title: 'P' });
        const btn = instant.querySelector(`[data-cover-token="${token}"]`);
        rightClick(btn);
        expect(topLayer.querySelector('.cover_entry_menu')).toBeNull();
    });

    test('menu reflects entry.minimized → "복원" label + restore action', () => {
        const token = handle.pushEntry({
            title: 'A',
            onAction: (action) => { calls.push(action); },
        });
        handle.setMinimizedByToken(token, true);
        const btn = instant.querySelector(`[data-cover-token="${token}"]`);
        rightClick(btn);
        const items = topLayer.querySelectorAll('.cover_entry_menu > button.cover_menu_item');
        expect(items[1].textContent).toBe('복원');
        expect(items[1].getAttribute('data-action')).toBe('restore');
    });

    test('clicking menu items dispatches the right onAction + closes the menu', () => {
        const token = handle.pushEntry({
            title: 'A',
            onAction: (action) => { calls.push(action); },
        });
        const btn = instant.querySelector(`[data-cover-token="${token}"]`);
        rightClick(btn);
        const items = topLayer.querySelectorAll('.cover_entry_menu > button.cover_menu_item');
        items[2].click(); // 닫기
        expect(calls).toEqual(['close']);
        // The fade-out animation leaves the element in the DOM for 0.2s with
        // data-closing="1"; the live (non-closing) menu disappears immediately.
        expect(topLayer.querySelector('.cover_entry_menu:not([data-closing="1"])')).toBeNull();
    });

    test('opening a new context menu closes any prior one', () => {
        const a = handle.pushEntry({ title: 'A', onAction: () => {} });
        const b = handle.pushEntry({ title: 'B', onAction: () => {} });
        rightClick(instant.querySelector(`[data-cover-token="${a}"]`));
        expect(topLayer.querySelectorAll('.cover_entry_menu:not([data-closing="1"])').length).toBe(1);
        rightClick(instant.querySelector(`[data-cover-token="${b}"]`));
        const live = topLayer.querySelectorAll('.cover_entry_menu:not([data-closing="1"])');
        expect(live.length).toBe(1);
        expect(live[0].getAttribute('data-cover-token')).toBe(String(b));
    });

    test('Escape closes the context menu', () => {
        const token = handle.pushEntry({ title: 'A', onAction: () => {} });
        rightClick(instant.querySelector(`[data-cover-token="${token}"]`));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(topLayer.querySelector('.cover_entry_menu:not([data-closing="1"])')).toBeNull();
    });

    test('outside pointerdown closes the context menu', () => {
        const token = handle.pushEntry({ title: 'A', onAction: () => {} });
        rightClick(instant.querySelector(`[data-cover-token="${token}"]`));
        document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(topLayer.querySelector('.cover_entry_menu:not([data-closing="1"])')).toBeNull();
    });

    test('"화면 가운데로 이동" fires onAction("center") as a placeholder', () => {
        const token = handle.pushEntry({
            title: 'A',
            onAction: (action) => { calls.push(action); },
        });
        rightClick(instant.querySelector(`[data-cover-token="${token}"]`));
        const items = topLayer.querySelectorAll('.cover_entry_menu > button.cover_menu_item');
        items[0].click(); // 화면 가운데로 이동
        expect(calls).toEqual(['center']);
    });

    test('openContextMenu(public) mounts a menu without requiring a cover entry', () => {
        // Host code (e.g. a rootbar tab) opens a menu directly via the public
        // API. No cover_entry is required; the menu carries its own title +
        // items + onAction.
        const onAction = (action) => { calls.push(action); };
        handle.openContextMenu({
            x: 100, y: 100,
            title: '망고톡',
            items: [
                { label: 'A', action: 'a' },
                { label: 'B', action: 'b' },
            ],
            onAction,
            anchorData: { 'data-host': 'rootbar' },
        });
        const menu = topLayer.querySelector('.cover_entry_menu:not([data-closing="1"])');
        expect(menu).not.toBeNull();
        expect(menu.getAttribute('data-host')).toBe('rootbar');
        expect(menu.querySelector('header.cover_menu_title').textContent).toBe('망고톡');
        const items = menu.querySelectorAll('button.cover_menu_item');
        expect(items.length).toBe(2);
        items[1].click();
        expect(calls).toEqual(['b']);
    });

    test('EstreCoverBarHandle.menuIcons exposes reusable SVG glyphs', () => {
        const icons = EstreCoverBarHandle.menuIcons;
        expect(typeof icons.center).toBe('string');
        expect(icons.center).toMatch(/<svg/);
        expect(icons.center).toMatch(/viewBox="0 0 14 14"/);
        // Center icon is the redesigned 4-arrow inward chevron — not the
        // diagonal-X that close uses. The SVG should contain four <path>
        // elements (one per axis-aligned arrow) instead of the old diagonal
        // stroke + rect combo.
        expect((icons.center.match(/<path/g) || []).length).toBe(4);
        expect(icons.close).toMatch(/<svg/);
        expect(icons.minimize).toMatch(/<svg/);
        expect(icons.restore).toMatch(/<svg/);
    });

    test('menu anchors to the cursor and picks a quadrant that opens toward viewport center', () => {
        const token = handle.pushEntry({ title: 'A', onAction: () => {} });
        const btn = instant.querySelector(`[data-cover-token="${token}"]`);
        // jsdom defaults: innerWidth = 1024, innerHeight = 768. Center ≈ (512, 384).
        const w = window.innerWidth;
        const h = window.innerHeight;

        const dispatchAt = (x, y) => {
            btn.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
        };

        // bottom-right click → menu pinned bottom-right (grows up-and-left)
        dispatchAt(w - 50, h - 50);
        let menu = topLayer.querySelector('.cover_entry_menu:not([data-closing="1"])');
        expect(menu.style.right).not.toBe('auto');
        expect(menu.style.bottom).not.toBe('auto');
        expect(menu.style.left).toBe('auto');
        expect(menu.style.top).toBe('auto');
        expect(menu.style.getPropertyValue('--menu-origin')).toBe('bottom right');

        // top-left click → menu pinned top-left (grows down-and-right)
        dispatchAt(50, 50);
        menu = topLayer.querySelector('.cover_entry_menu:not([data-closing="1"])');
        expect(menu.style.left).not.toBe('auto');
        expect(menu.style.top).not.toBe('auto');
        expect(menu.style.right).toBe('auto');
        expect(menu.style.bottom).toBe('auto');
        expect(menu.style.getPropertyValue('--menu-origin')).toBe('top left');
    });
});


// ── EstreCoverBarHandle — external embed entries (Phase 3) ────────────
//
// External entries carry an `onAction` callback instead of a pageHandle.
// Click routing reports intent through it ("focus" / "minimize" / "restore")
// instead of calling show / hide; `closable: true` adds an ✕ that fires
// onAction("close") without removing the entry — the embed is expected to
// call removeInstantSectionEntry after its own close path completes.

describe('EstreCoverBarHandle — external entries (onAction + closable)', () => {

    let handle;
    let instant;
    let calls;
    beforeEach(() => {
        handle = new EstreCoverBarHandle(makeFixedBottom());
        instant = handle.instantSections;
        calls = [];
    });

    test('inactive external entry click → onAction("focus")', () => {
        const token = handle.pushEntry({
            title: 'Embed',
            onAction: (action) => { calls.push(action); },
        });
        instant.querySelector(`[data-cover-token="${token}"]`).click();
        expect(calls).toEqual(['focus']);
    });

    test('active + non-minimized click → onAction("minimize")', () => {
        const token = handle.pushEntry({
            title: 'Embed',
            onAction: (action) => { calls.push(action); },
        });
        handle.setActiveByToken(token);
        instant.querySelector(`[data-cover-token="${token}"]`).click();
        expect(calls).toEqual(['minimize']);
    });

    test('active + minimized click → onAction("restore")', () => {
        const token = handle.pushEntry({
            title: 'Embed',
            onAction: (action) => { calls.push(action); },
        });
        handle.setActiveByToken(token);
        handle.setMinimizedByToken(token, true);
        instant.querySelector(`[data-cover-token="${token}"]`).click();
        expect(calls).toEqual(['restore']);
    });

    test('closable:true renders an ✕ button inside the entry', () => {
        const token = handle.pushEntry({
            title: 'Embed',
            closable: true,
            onAction: () => {},
        });
        const close = instant.querySelector(`[data-cover-token="${token}"] .cover_entry_close`);
        expect(close).not.toBeNull();
        expect(close.textContent).toBe('✕');
    });

    test('closable:false (default) does not render an ✕', () => {
        const token = handle.pushEntry({ title: 'Embed', onAction: () => {} });
        expect(instant.querySelector(`[data-cover-token="${token}"] .cover_entry_close`)).toBeNull();
    });

    test('✕ click → onAction("close") + entry remains in the bar', () => {
        const token = handle.pushEntry({
            title: 'Embed',
            closable: true,
            onAction: (action) => { calls.push(action); },
        });
        const close = instant.querySelector(`[data-cover-token="${token}"] .cover_entry_close`);
        close.click();
        expect(calls).toEqual(['close']);
        // Entry stays — embed is expected to call removeInstantSectionEntry.
        expect(handle.findEntry(token)).not.toBeNull();
        expect(instant.querySelector(`[data-cover-token="${token}"]`)).not.toBeNull();
    });

    test('✕ click does not also trigger the surrounding focus click', () => {
        const token = handle.pushEntry({
            title: 'Embed',
            closable: true,
            onAction: (action) => { calls.push(action); },
        });
        const close = instant.querySelector(`[data-cover-token="${token}"] .cover_entry_close`);
        // jsdom dispatches both the ✕ click and (if not stopped) the parent
        // button click. The handler stops propagation, so we should see only
        // "close" — not "close" + "focus".
        close.click();
        expect(calls).toEqual(['close']);
    });

    test('updateEntry can toggle closable on and off', () => {
        const token = handle.pushEntry({ title: 'Embed', onAction: () => {} });
        expect(instant.querySelector(`[data-cover-token="${token}"] .cover_entry_close`)).toBeNull();
        handle.updateEntry(token, { closable: true });
        expect(instant.querySelector(`[data-cover-token="${token}"] .cover_entry_close`)).not.toBeNull();
        handle.updateEntry(token, { closable: false });
        expect(instant.querySelector(`[data-cover-token="${token}"] .cover_entry_close`)).toBeNull();
    });

    test('updateEntry can swap onAction in place', () => {
        const token = handle.pushEntry({
            title: 'Embed',
            onAction: () => { calls.push('first'); },
        });
        handle.updateEntry(token, { onAction: () => { calls.push('second'); } });
        instant.querySelector(`[data-cover-token="${token}"]`).click();
        expect(calls).toEqual(['second']);
    });

    test('entry with neither pageHandle nor onAction is a click no-op', () => {
        const token = handle.pushEntry({ title: 'Bare' });
        // Should not throw, should not affect anything.
        expect(() =>
            instant.querySelector(`[data-cover-token="${token}"]`).click()
        ).not.toThrow();
    });

    test('pageHandle entry ignores onAction (internal route wins)', () => {
        const pageCalls = [];
        const pageHandle = {
            show: (...args) => { pageCalls.push(['show', ...args]); },
            hide: () => { pageCalls.push(['hide']); },
        };
        const token = handle.pushEntry({
            pageHandle,
            title: 'P',
            onAction: (action) => { calls.push(action); },
        });
        instant.querySelector(`[data-cover-token="${token}"]`).click();
        expect(pageCalls).toEqual([['show', true, true]]);
        expect(calls).toEqual([]);
    });
});


// ── estreUi.{push,update,remove,setActive,setMinimized}InstantSectionEntry ─
//
// Thin wrappers over coverBarHandle that the embed layer talks to. The
// wrappers swallow the case where the cover bar hasn't initialised yet,
// returning null / false so embed code can be written without guarding
// on bar readiness.

describe('estreUi — instant-section external embed wrappers', () => {

    let savedHandle;
    let mountTopLayer;
    beforeEach(() => {
        savedHandle = estreUi.coverBarHandle;
        document.body.innerHTML = `
            <footer id="fixedBottom">
                <nav id="customFixedSections"></nav>
                <nav id="rootbar"></nav>
                <nav id="instantSections"></nav>
            </footer>
            <div id="topLayer"></div>
        `;
        mountTopLayer = document.getElementById('topLayer');
        estreUi.coverBarHandle = new EstreCoverBarHandle(
            document.getElementById('fixedBottom'),
            mountTopLayer,
        );
    });
    afterEach(() => {
        estreUi.coverBarHandle = savedHandle;
    });

    test('pushInstantSectionEntry returns a positive integer token', () => {
        const token = estreUi.pushInstantSectionEntry({ title: 'Hello' });
        expect(typeof token).toBe('number');
        expect(token).toBeGreaterThan(0);
    });

    test('pushInstantSectionEntry forwards title / icon / closable to the bar', () => {
        const token = estreUi.pushInstantSectionEntry({
            title: 'Embed',
            icon: '/x.svg',
            closable: true,
            onAction: () => {},
        });
        const btn = document.querySelector(`[data-cover-token="${token}"]`);
        expect(btn).not.toBeNull();
        expect(btn.querySelector(':scope > label').textContent).toBe('Embed');
        expect(btn.querySelector('.cover_icon > img').getAttribute('src')).toBe('/x.svg');
        expect(btn.querySelector('.cover_entry_close')).not.toBeNull();
    });

    test('updateInstantSectionEntry rewrites the entry in place', () => {
        const token = estreUi.pushInstantSectionEntry({ title: 'Old' });
        const ok = estreUi.updateInstantSectionEntry(token, { title: 'New' });
        expect(ok).toBe(true);
        const btn = document.querySelector(`[data-cover-token="${token}"]`);
        expect(btn.querySelector(':scope > label').textContent).toBe('New');
    });

    test('removeInstantSectionEntry detaches the DOM', () => {
        const token = estreUi.pushInstantSectionEntry({ title: 'X' });
        expect(estreUi.removeInstantSectionEntry(token)).toBe(true);
        expect(document.querySelector(`[data-cover-token="${token}"]`)).toBeNull();
    });

    test('setInstantSectionActiveByToken marks the entry data-active', () => {
        const token = estreUi.pushInstantSectionEntry({ title: 'A' });
        expect(estreUi.setInstantSectionActiveByToken(token)).toBe(true);
        const btn = document.querySelector(`[data-cover-token="${token}"]`);
        expect(btn.getAttribute('data-active')).toBe('1');
    });

    test('setInstantSectionMinimizedByToken toggles data-minimized', () => {
        const token = estreUi.pushInstantSectionEntry({ title: 'A' });
        estreUi.setInstantSectionMinimizedByToken(token, true);
        const btn = document.querySelector(`[data-cover-token="${token}"]`);
        expect(btn.getAttribute('data-minimized')).toBe('1');
        estreUi.setInstantSectionMinimizedByToken(token, false);
        expect(btn.getAttribute('data-minimized')).toBe('');
    });

    test('wrappers return null / false when coverBarHandle is not initialised', () => {
        estreUi.coverBarHandle = null;
        expect(estreUi.pushInstantSectionEntry({ title: 'A' })).toBeNull();
        expect(estreUi.updateInstantSectionEntry(1, { title: 'A' })).toBe(false);
        expect(estreUi.removeInstantSectionEntry(1)).toBe(false);
        expect(estreUi.setInstantSectionActiveByToken(1)).toBe(false);
        expect(estreUi.setInstantSectionMinimizedByToken(1, true)).toBe(false);
    });

    test('click on external entry routes user intent through onAction', () => {
        const calls = [];
        const token = estreUi.pushInstantSectionEntry({
            title: 'Embed',
            onAction: (action) => { calls.push(action); },
        });
        const btn = document.querySelector(`[data-cover-token="${token}"]`);
        // Inactive → focus
        btn.click();
        // Mark active externally, click again → minimize
        estreUi.setInstantSectionActiveByToken(token);
        btn.click();
        // Minimize via API, click again → restore
        estreUi.setInstantSectionMinimizedByToken(token, true);
        btn.click();
        expect(calls).toEqual(['focus', 'minimize', 'restore']);
    });

    test('closable ✕ on overflow dropdown row also routes onAction("close")', () => {
        const calls = [];
        // Stub overflow so the entry lands in the dropdown.
        const instant = estreUi.coverBarHandle.instantSections;
        Object.defineProperty(instant, 'scrollWidth', {
            configurable: true,
            get() {
                const v = instant.querySelectorAll('.cover_entry:not([data-overflowed="1"])').length;
                const s = instant.querySelector('.cover_overflow_sentinel');
                return v * 100 + (s != null && !s.hidden ? 30 : 0);
            },
        });
        Object.defineProperty(instant, 'clientWidth', { configurable: true, get: () => 150 });

        estreUi.pushInstantSectionEntry({ title: 'A' });
        estreUi.pushInstantSectionEntry({ title: 'B' });
        const tokenC = estreUi.pushInstantSectionEntry({
            title: 'C',
            closable: true,
            onAction: (action) => { calls.push(['C', action]); },
        });
        // Sentinel reveals; C is the newest so it gets overflowed first
        // (instantSections hides from the trailing edge).
        const sent = instant.querySelector('.cover_overflow_sentinel');
        expect(sent.hidden).toBe(false);
        sent.click();
        const dropRow = mountTopLayer.querySelector(
            `.cover_overflow_dropdown [data-cover-token="${tokenC}"]`,
        );
        expect(dropRow).not.toBeNull();
        dropRow.querySelector('.cover_entry_close').click();
        expect(calls).toEqual([['C', 'close']]);
    });
});
