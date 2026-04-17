import { describe, test, expect, beforeEach, vi } from 'vitest';

// ── data-exported slot identification ──────────────────��────────

describe('data-exported slot identification', () => {

    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('eds.exported is the correct attribute name', () => {
        expect(eds.exported).toBe('data-exported');
    });

    test('querySelectorAll finds exported slots', () => {
        document.body.innerHTML = `
            <header id="fixedTop" data-exported="1"></header>
            <footer id="fixedBottom" data-exported="1"></footer>
            <main id="staticDoc" data-exported="1"></main>
            <main id="instantDoc" data-exported="1"></main>
            <nav id="managedOverlay" data-exported="1"></nav>
            <nav id="mainMenu" data-exported="1"></nav>
        `;

        const slots = document.querySelectorAll(ax(eds.exported));
        expect(slots.length).toBe(6);
    });

    test('non-exported elements are not matched', () => {
        document.body.innerHTML = `
            <header id="fixedTop" data-exported="1"></header>
            <div id="regular"></div>
            <section id="custom"></section>
        `;

        const slots = document.querySelectorAll(ax(eds.exported));
        expect(slots.length).toBe(1);
        expect(slots[0].id).toBe('fixedTop');
    });
});


// ── fetch + inject pattern (loadExported core behavior) ─────────

describe('loadExported pattern — fetch + inject', () => {

    beforeEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    test('fetched HTML content can be injected into a slot', async () => {
        const slot = document.createElement('header');
        slot.id = 'fixedTop';
        slot.setAttribute('data-exported', '1');
        document.body.appendChild(slot);

        // Simulate what loadExported does: fetch → response.text() → prepend
        const htmlContent = '<nav class="topbar"><span>Logo</span></nav>';

        // Mock the fetch → inject pattern
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve(htmlContent),
        });

        const response = await fetch('fixedTop.html');
        const text = await response.text();
        slot.innerHTML = text;

        expect(slot.querySelector('.topbar')).not.toBeNull();
        expect(slot.querySelector('span').textContent).toBe('Logo');
    });

    test('multiple slots can be independently populated', async () => {
        const top = document.createElement('header');
        top.id = 'fixedTop';
        top.setAttribute('data-exported', '1');

        const bottom = document.createElement('footer');
        bottom.id = 'fixedBottom';
        bottom.setAttribute('data-exported', '1');

        document.body.append(top, bottom);

        // Inject separately
        top.innerHTML = '<div class="top-content">Top</div>';
        bottom.innerHTML = '<div class="bottom-content">Bottom</div>';

        expect(top.querySelector('.top-content').textContent).toBe('Top');
        expect(bottom.querySelector('.bottom-content').textContent).toBe('Bottom');

        // Slots don't interfere
        expect(top.querySelector('.bottom-content')).toBeNull();
        expect(bottom.querySelector('.top-content')).toBeNull();
    });

    test('fetch failure triggers retry pattern', async () => {
        let attempt = 0;
        vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
            attempt++;
            if (attempt < 3) return Promise.reject(new Error('Network error'));
            return Promise.resolve({
                ok: true,
                text: () => Promise.resolve('<div>loaded</div>'),
            });
        });

        // Simulate retry logic similar to loadExported
        const loadWithRetry = async (url, maxAttempts = 3) => {
            for (let i = 0; i < maxAttempts; i++) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('Not ok');
                    return await response.text();
                } catch (e) {
                    if (i === maxAttempts - 1) throw e;
                }
            }
        };

        const html = await loadWithRetry('fixedTop.html');
        expect(html).toBe('<div>loaded</div>');
        expect(attempt).toBe(3);
    });

    test('injected content with data-solid elements can be frozen', () => {
        const slot = document.createElement('main');
        slot.setAttribute('data-exported', '1');
        document.body.appendChild(slot);

        // Simulate injected HTML with template elements
        slot.innerHTML = `
            <section data-static="1">
                <div data-solid="0">
                    <span class="item">|title|</span>
                </div>
            </section>
        `;

        // Find and freeze solid elements (like initSolidPoint would)
        const solidEls = slot.querySelectorAll('[data-solid]');
        expect(solidEls.length).toBe(1);

        const tpl = solidEls[0];
        tpl.solid();
        expect(tpl.innerHTML).toBe('');
        expect(tpl.dataset.frozen).toContain('|title|');

        // Melt with data
        tpl.melt({ title: 'Hello' });
        expect(tpl.querySelector('.item').textContent).toBe('Hello');
    });
});
