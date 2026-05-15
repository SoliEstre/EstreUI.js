import { describe, test, expect, beforeEach } from 'vitest';

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
