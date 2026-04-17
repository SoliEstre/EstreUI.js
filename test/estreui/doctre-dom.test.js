import { describe, test, expect, beforeEach } from 'vitest';

// ── Doctre.patch() prototype extensions ─────────────────────────

describe('Doctre.patch() — Element prototype extensions', () => {

    test('freeze stores child nodes as frost JSON in dataset', () => {
        const el = document.createElement('div');
        el.innerHTML = '<span>hello</span>';
        el.freeze();
        expect(el.dataset.frozen).toBeDefined();
        expect(el.dataset.frozen).toContain('span');
        expect(el.dataset.frozen).toContain('hello');
        // Children still present after freeze
        expect(el.children.length).toBe(1);
    });

    test('freeze with custom dataName stores in that key', () => {
        const el = document.createElement('div');
        el.innerHTML = '<b>text</b>';
        el.freeze('myTemplate');
        expect(el.dataset.myTemplate).toBeDefined();
        expect(el.dataset.frozen).toBeUndefined();
    });

    test('solid freezes then clears innerHTML', () => {
        const el = document.createElement('div');
        el.innerHTML = '<p>content</p>';
        const returned = el.solid();
        expect(el.dataset.frozen).toBeDefined();
        expect(el.innerHTML).toBe('');
        // Returns the element (chainable)
        expect(returned).toBe(el);
    });

    test('hot restores frozen data as DocumentFragment', () => {
        const el = document.createElement('div');
        el.innerHTML = '<em>restored</em>';
        el.solid();
        const fragment = el.hot();
        expect(fragment).toBeInstanceOf(DocumentFragment);
        expect(fragment.firstChild.tagName).toBe('EM');
        expect(fragment.firstChild.textContent).toBe('restored');
    });

    test('hot with matchReplacer performs token substitution', () => {
        const el = document.createElement('div');
        el.innerHTML = '<span>|name|</span>';
        el.solid();
        const fragment = el.hot({ name: 'World' });
        expect(fragment.firstChild.textContent).toBe('World');
    });

    test('hot returns null when no frozen data', () => {
        const el = document.createElement('div');
        const result = el.hot();
        expect(result).toBeNull();
    });

    test('hot returns null when frozen data is empty', () => {
        const el = document.createElement('div');
        el.dataset.frozen = '';
        const result = el.hot();
        expect(result).toBeNull();
    });

    test('worm appends hot content and returns NodeArray', () => {
        const el = document.createElement('div');
        el.innerHTML = '<i>item</i>';
        el.solid();
        const nodeArray = el.worm();
        expect(nodeArray).toBeInstanceOf(NodeArray);
        expect(nodeArray.length).toBeGreaterThan(0);
        // Content is appended to the element
        expect(el.children.length).toBe(1);
        expect(el.children[0].tagName).toBe('I');
    });

    test('melt clears then appends (solid → melt roundtrip)', () => {
        const el = document.createElement('div');
        el.innerHTML = '<strong>original</strong>';
        el.solid();
        // Element is empty after solid
        expect(el.innerHTML).toBe('');
        // melt restores content
        const nodeArray = el.melt();
        expect(el.children.length).toBe(1);
        expect(el.children[0].tagName).toBe('STRONG');
        expect(el.children[0].textContent).toBe('original');
    });

    test('melt with matchReplacer replaces tokens', () => {
        const el = document.createElement('div');
        el.innerHTML = '<span>|greeting|</span>';
        el.solid();
        el.melt({ greeting: 'Hi' });
        expect(el.children[0].textContent).toBe('Hi');
    });

    test('multiple melt calls from same frozen template', () => {
        const el = document.createElement('div');
        el.innerHTML = '<span>|val|</span>';
        el.solid();

        el.melt({ val: 'first' });
        expect(el.textContent).toBe('first');

        el.melt({ val: 'second' });
        expect(el.textContent).toBe('second');

        // frozen data persists
        expect(el.dataset.frozen).toBeDefined();
    });

    test('burn returns fragment and deletes frozen data', () => {
        const el = document.createElement('div');
        el.innerHTML = '<div>temp</div>';
        el.solid();
        expect(el.dataset.frozen).toBeDefined();
        const fragment = el.burn();
        expect(fragment).toBeInstanceOf(DocumentFragment);
        expect(el.dataset.frozen).toBeUndefined();
    });
});


// ── Doctre.createElement / createElementBy ──────────────────────

describe('Doctre.createElement', () => {

    test('creates element with tag name', () => {
        const el = Doctre.createElement('div');
        expect(el.tagName).toBe('DIV');
    });

    test('creates element with majorAttrs (class, id)', () => {
        const el = Doctre.createElement('span', { class: 'foo bar', id: 'myId' });
        expect(el.className).toBe('foo bar');
        expect(el.id).toBe('myId');
    });

    test('creates element with string content', () => {
        const el = Doctre.createElement('p', null, 'hello');
        expect(el.textContent).toBe('hello');
    });

    test('creates element with style object', () => {
        const el = Doctre.createElement('div', null, null, { color: 'red' });
        expect(el.style.color).toBe('red');
    });

    test('creates element with data attributes', () => {
        const el = Doctre.createElement('div', null, null, {}, {}, { itemId: '123' });
        expect(el.dataset.itemId).toBe('123');
    });

    test('creates element with matchReplacer in content', () => {
        // createElement signature: (tagName, majorAttrs, contentData, style, attrs, datas, matchReplacer)
        const el = Doctre.createElement('div', null, '|msg|', {}, {}, {}, { msg: 'replaced' });
        expect(el.textContent).toBe('replaced');
    });
});


describe('Doctre.createElementBy (solidId)', () => {

    test('parses solidId with tag.class#id', () => {
        const el = Doctre.createElementBy('div.box.float#app');
        expect(el.tagName).toBe('DIV');
        expect(el.classList.contains('box')).toBe(true);
        expect(el.classList.contains('float')).toBe(true);
        expect(el.id).toBe('app');
    });

    test('parses solidId with name and type', () => {
        const el = Doctre.createElementBy('input@email$text');
        expect(el.tagName).toBe('INPUT');
        expect(el.getAttribute('name')).toBe('email');
        expect(el.getAttribute('type')).toBe('text');
    });

    test('creates element with content and solidId', () => {
        const el = Doctre.createElementBy('span.label', 'Hello');
        expect(el.textContent).toBe('Hello');
        expect(el.classList.contains('label')).toBe(true);
    });
});


// ── Doctre.createFragment ───────────────────────────────────────

describe('Doctre.createFragment', () => {

    test('creates fragment from cold array with strings', () => {
        const frag = Doctre.createFragment(['<b>bold</b>', '<i>italic</i>']);
        expect(frag).toBeInstanceOf(DocumentFragment);
        expect(frag.childNodes.length).toBe(2);
        expect(frag.firstChild.tagName).toBe('B');
    });

    test('creates fragment from cold array with element arrays', () => {
        const frag = Doctre.createFragment([['div', [], {}, {}, {}]]);
        expect(frag.firstChild.tagName).toBe('DIV');
    });
});


// ── Doctre coldify / stringify / live roundtrip ─────────────────

describe('Doctre coldify → stringify → live roundtrip', () => {

    test('element survives coldify → stringify → parse roundtrip', () => {
        const original = document.createElement('div');
        original.className = 'container';
        original.id = 'main';
        const child = document.createElement('span');
        child.textContent = 'content';
        original.appendChild(child);

        // Serialize to frost (JSON string)
        const frost = Doctre.stringify(original, false, true);
        expect(typeof frost).toBe('string');

        // Restore from frost
        const fragment = Doctre.parse(frost);
        expect(fragment).toBeInstanceOf(DocumentFragment);

        const restored = fragment.firstChild;
        expect(restored.tagName).toBe('DIV');
        expect(restored.className).toBe('container');
        expect(restored.id).toBe('main');
        expect(restored.firstChild.tagName).toBe('SPAN');
        expect(restored.firstChild.textContent).toBe('content');
    });

    test('coldify preserves multiple children', () => {
        const parent = document.createElement('ul');
        for (const text of ['A', 'B', 'C']) {
            const li = document.createElement('li');
            li.textContent = text;
            parent.appendChild(li);
        }

        const cold = Doctre.coldify(parent.childNodes, true);
        expect(cold.length).toBe(3);
        // Each item is a cold array starting with tag info
        for (const item of cold) {
            expect(Array.isArray(item)).toBe(true);
        }
    });

    test('Node.coldify / Node.stringify prototype methods work', () => {
        const el = document.createElement('b');
        el.textContent = 'bold';

        const cold = el.coldify();
        expect(Array.isArray(cold)).toBe(true);

        const frost = el.stringify();
        expect(typeof frost).toBe('string');
        expect(frost).toContain('b');
    });

    test('NodeList.coldify works on multiple nodes', () => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = '<span>a</span><span>b</span>';
        const cold = wrapper.childNodes.coldify(true);
        expect(cold.length).toBe(2);
    });

    test('Element.cold returns child cold array', () => {
        const el = document.createElement('div');
        el.innerHTML = '<p>text</p>';
        const cold = el.cold(true);
        expect(Array.isArray(cold)).toBe(true);
        expect(cold.length).toBe(1);
    });

    test('Element.frozen returns frost string of children', () => {
        const el = document.createElement('div');
        el.innerHTML = '<i>text</i>';
        const frost = el.frozen();
        expect(typeof frost).toBe('string');
        expect(frost).toContain('i');
        expect(frost).toContain('text');
    });

    test('Element.takeCold returns cold and clears content', () => {
        const el = document.createElement('div');
        el.innerHTML = '<span>gone</span>';
        const cold = el.takeCold(true);
        expect(cold.length).toBe(1);
        expect(el.innerHTML).toBe('');
    });

    test('Element.takeFrozen returns frost and clears content', () => {
        const el = document.createElement('div');
        el.innerHTML = '<b>gone</b>';
        const frost = el.takeFrozen();
        expect(frost).toContain('b');
        expect(el.innerHTML).toBe('');
    });
});


// ── Element.alive / alone ───────────────────────────────────────

describe('Element.alive / alone', () => {

    test('alive appends frost content and returns NodeArray', () => {
        const el = document.createElement('div');
        el.innerHTML = '<p>existing</p>';

        const frost = '[["span",[],{},{},{}]]';
        const nodeArray = el.alive(frost);
        expect(nodeArray).toBeInstanceOf(NodeArray);
        // Both existing and new content
        expect(el.children.length).toBe(2);
    });

    test('alone clears then appends (replace)', () => {
        const el = document.createElement('div');
        el.innerHTML = '<p>old</p>';

        const frost = '[["span",["new"],{},{},{}]]';
        el.alone(frost);
        expect(el.children.length).toBe(1);
        expect(el.children[0].tagName).toBe('SPAN');
    });
});


// ── Doctre.getSolidId / packTagAndMajorAttrs ────────────────────

describe('Doctre.getSolidId', () => {

    test('assembles solidId from components', () => {
        expect(Doctre.getSolidId('div', 'a b', 'myId', 'myName', 'myType'))
            .toBe('div.a.b#myId@myName$myType');
    });

    test('omits null parts', () => {
        expect(Doctre.getSolidId('span', null, 'x'))
            .toBe('span#x');
    });

    test('tag only', () => {
        expect(Doctre.getSolidId('p'))
            .toBe('p');
    });
});


describe('Doctre.packTagAndMajorAttrs', () => {

    test('extracts as object by default', () => {
        const el = document.createElement('div');
        el.className = 'foo';
        el.id = 'bar';
        const packed = Doctre.packTagAndMajorAttrs(el);
        expect(packed.tagName).toBe('div');
        expect(packed.class).toBe('foo');
        expect(packed.id).toBe('bar');
    });

    test('extracts as solidId string when asSolidId=true', () => {
        const el = document.createElement('input');
        el.setAttribute('name', 'email');
        el.setAttribute('type', 'text');
        const solidId = Doctre.packTagAndMajorAttrs(el, true);
        expect(solidId).toBe('input@email$text');
    });
});


// ── NodeArray ───────────────────────────────────────────────────

describe('NodeArray', () => {

    test('box creates NodeArray from DocumentFragment', () => {
        const frag = document.createDocumentFragment();
        frag.appendChild(document.createElement('div'));
        frag.appendChild(document.createElement('span'));
        // Note: after box, fragment's children are still there because
        // box copies references, doesn't move nodes
        const arr = NodeArray.box(frag);
        expect(arr).toBeInstanceOf(NodeArray);
        expect(arr).toBeInstanceOf(Array);
        expect(arr.length).toBe(2);
        expect(arr[0].tagName).toBe('DIV');
        expect(arr[1].tagName).toBe('SPAN');
    });

    test('box creates NodeArray from NodeList', () => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = '<a>1</a><b>2</b><i>3</i>';
        const arr = NodeArray.box(wrapper.childNodes);
        expect(arr.length).toBe(3);
    });
});
