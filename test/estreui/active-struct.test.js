import { describe, test, expect, beforeEach } from 'vitest';

// ── CSS selector builder utilities (estreU0EEOZ) ───────────────

describe('Selector builder utilities', () => {

    test('ax builds attribute-exists selector [attr]', () => {
        expect(ax('data-solid')).toBe('[data-solid]');
        expect(ax('data-bind-value')).toBe('[data-bind-value]');
    });

    test('aiv builds attribute-value selector [attr="value"]', () => {
        const result = aiv('data-bind', 'name');
        expect(result).toContain('data-bind');
        expect(result).toContain('name');
        expect(result.startsWith('[')).toBe(true);
        expect(result.endsWith(']')).toBe(true);
    });

    test('eds contains expected attribute names', () => {
        expect(eds.solid).toBe('data-solid');
        expect(eds.bind).toBeDefined();
        expect(eds.bindValue).toBe('data-bind-value');
        expect(eds.bindAttr).toBe('data-bind-attr');
        expect(eds.bindStyle).toBe('data-bind-style');
        expect(eds.bindArray).toBe('data-bind-array');
    });
});


// ── data-solid (initSolidPoint) ─────────────────────────────────

describe('data-solid — freeze-on-init behavior', () => {

    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('element with data-solid freezes its children into data-frozen', () => {
        const container = document.createElement('div');
        const solidEl = document.createElement('div');
        solidEl.setAttribute('data-solid', '0');
        solidEl.innerHTML = '<span>template |name|</span>';
        container.appendChild(solidEl);
        document.body.appendChild(container);

        // Manually call solid() as initSolidPoint would
        // (initSolidPoint requires jQuery .find, we test the underlying behavior)
        solidEl.solid();

        // After solid: children cleared, frost stored
        expect(solidEl.innerHTML).toBe('');
        expect(solidEl.dataset.frozen).toBeDefined();
        expect(solidEl.dataset.frozen).toContain('span');
        expect(solidEl.dataset.frozen).toContain('template |name|');
    });

    test('solid element can be melted with replacements', () => {
        const el = document.createElement('div');
        el.setAttribute('data-solid', '0');
        el.innerHTML = '<p>Hello |who|!</p>';
        document.body.appendChild(el);

        el.solid();
        expect(el.innerHTML).toBe('');

        el.melt({ who: 'World' });
        expect(el.querySelector('p').textContent).toBe('Hello World!');
    });

    test('already-frozen element skips re-freeze', () => {
        const el = document.createElement('div');
        el.setAttribute('data-solid', '1');
        el.dataset.frozen = '[["b",["original"]]]';
        el.innerHTML = '<i>modified</i>';
        document.body.appendChild(el);

        // initSolidPoint checks: isNullOrEmpty(point.dataset.frozen) before calling solid
        // So if frozen already exists, it should NOT overwrite
        const existingFrost = el.dataset.frozen;
        // Simulate the guard check from initSolidPoint (line 2488)
        if (el.dataset.frozen == null || el.dataset.frozen === '') {
            el.solid();
        }
        expect(el.dataset.frozen).toBe(existingFrost);
        // Children are NOT cleared because solid was not called
        expect(el.querySelector('i')).not.toBeNull();
    });

    test('multiple solid priority levels process correctly', () => {
        const container = document.createElement('div');

        // Priority 0 (highest)
        const p0 = document.createElement('div');
        p0.setAttribute('data-solid', '0');
        p0.innerHTML = '<span>first</span>';
        container.appendChild(p0);

        // Priority 1
        const p1 = document.createElement('div');
        p1.setAttribute('data-solid', '1');
        p1.innerHTML = '<span>second</span>';
        container.appendChild(p1);

        document.body.appendChild(container);

        // Solid each (reverse priority order as initSolidPoint does)
        for (const el of [p1, p0]) {
            el.solid();
        }

        expect(p0.dataset.frozen).toContain('first');
        expect(p1.dataset.frozen).toContain('second');
        expect(p0.innerHTML).toBe('');
        expect(p1.innerHTML).toBe('');
    });
});


// ── Doctre.createElement integration with EstreUI selectors ─────

describe('Doctre + selector utilities integration', () => {

    test('can query elements by eds attribute selectors', () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <span data-bind="name">placeholder</span>
            <input data-bind-value="email">
            <div data-solid="0"><em>tpl</em></div>
        `;
        document.body.appendChild(container);

        const bindEls = container.querySelectorAll(ax(eds.bind));
        expect(bindEls.length).toBe(1);
        expect(bindEls[0].tagName).toBe('SPAN');

        const bindValueEls = container.querySelectorAll(ax(eds.bindValue));
        expect(bindValueEls.length).toBe(1);
        expect(bindValueEls[0].tagName).toBe('INPUT');

        const solidEls = container.querySelectorAll(ax(eds.solid));
        expect(solidEls.length).toBe(1);

        document.body.innerHTML = '';
    });

    test('doc.ce creates element via Doctre.createElement', () => {
        const el = doc.ce('div', '.container#main');
        expect(el.tagName).toBe('DIV');
        expect(el.classList.contains('container')).toBe(true);
        expect(el.id).toBe('main');
    });

    test('doc.cdf creates DocumentFragment', () => {
        const frag = doc.cdf();
        expect(frag).toBeInstanceOf(DocumentFragment);
    });

    test('doc.ctn creates text node', () => {
        const text = doc.ctn('hello');
        expect(text.nodeValue).toBe('hello');
    });

    test('doc.l restores frost to live fragment', () => {
        const frost = '[["span",["text"]]]';
        const frag = doc.l(frost);
        expect(frag).toBeInstanceOf(DocumentFragment);
        expect(frag.firstChild.tagName).toBe('SPAN');
        expect(frag.firstChild.textContent).toBe('text');
    });
});
