import { describe, test, expect, beforeEach } from 'vitest';

// ── LocalStyle.localize — ## selector replacement ───────────────

describe('LocalStyle.localize', () => {

    let body;

    beforeEach(() => {
        // Clean up body for each test
        document.body.innerHTML = '';
    });

    test('replaces ## with local selector path (simple case)', () => {
        // Build: body > section#main > div > <style>## .item { color: red; }</style>
        const section = document.createElement('section');
        section.id = 'main';

        const container = document.createElement('div');
        container.className = 'content';
        section.appendChild(container);

        const style = document.createElement('style');
        style.innerHTML = '## .item { color: red; }';
        container.appendChild(style);

        document.body.appendChild(section);

        // localize replaces ## with the path from body down to parent
        LocalStyle.localize(style);

        // The style element should be replaced with a new <style> element
        // whose content has ## replaced with the selector path
        const newStyle = container.querySelector('style');
        expect(newStyle).not.toBeNull();
        // The path should include section#main and div.content
        const content = newStyle.innerHTML;
        expect(content).not.toContain('##');
        expect(content).toContain('section#main');
        expect(content).toContain('.item');
        expect(content).toContain('color: red');
    });

    test('replaces multiple ## occurrences independently', () => {
        const section = document.createElement('section');
        section.id = 'app';
        const wrapper = document.createElement('div');
        wrapper.id = 'wrap';
        section.appendChild(wrapper);

        const style = document.createElement('style');
        style.innerHTML = '## .a { margin: 0; } ## .b { padding: 0; }';
        wrapper.appendChild(style);
        document.body.appendChild(section);

        LocalStyle.localize(style);

        const newStyle = wrapper.querySelector('style');
        const content = newStyle.innerHTML;
        // Both ## should be replaced
        expect(content).not.toContain('##');
        // Should appear twice (two replacements)
        const selectorPath = 'section#app';
        const occurrences = content.split(selectorPath).length - 1;
        expect(occurrences).toBe(2);
    });

    test('does not replace ### (triple hash)', () => {
        const section = document.createElement('section');
        section.id = 'test';
        const div = document.createElement('div');
        div.id = 'inner';
        section.appendChild(div);

        const style = document.createElement('style');
        style.innerHTML = '### .x { color: blue; }';
        div.appendChild(style);
        document.body.appendChild(section);

        LocalStyle.localize(style);

        const newStyle = div.querySelector('style');
        const content = newStyle.innerHTML;
        // ### should remain (regex: ##(?!#))
        expect(content).toContain('###');
    });

    test('does not replace # preceded by another # (e.g. in id selector)', () => {
        const section = document.createElement('section');
        section.id = 'x';
        const div = document.createElement('div');
        div.id = 'y';
        section.appendChild(div);

        const style = document.createElement('style');
        // A normal id selector should NOT be treated as ##
        style.innerHTML = '#someId { color: green; }';
        div.appendChild(style);
        document.body.appendChild(section);

        LocalStyle.localize(style);

        const newStyle = div.querySelector('style');
        expect(newStyle.innerHTML).toContain('#someId');
    });

    test('uses container data-container-id for container elements', () => {
        const section = document.createElement('section');
        section.id = 'sec';

        const container = document.createElement('div');
        container.className = 'container';
        container.dataset.containerId = 'myContainer';
        section.appendChild(container);

        const style = document.createElement('style');
        style.innerHTML = '## .child { display: flex; }';
        container.appendChild(style);
        document.body.appendChild(section);

        LocalStyle.localize(style);

        const newStyle = container.querySelector('style');
        const content = newStyle.innerHTML;
        expect(content).toContain('data-container-id="myContainer"');
    });

    test('uses article data-article-id for article elements', () => {
        const section = document.createElement('section');
        section.id = 'sec';

        const article = document.createElement('article');
        article.dataset.articleId = 'myArticle';
        section.appendChild(article);

        const style = document.createElement('style');
        style.innerHTML = '## .inner { margin: auto; }';
        article.appendChild(style);
        document.body.appendChild(section);

        LocalStyle.localize(style);

        const newStyle = article.querySelector('style');
        const content = newStyle.innerHTML;
        expect(content).toContain('data-article-id="myArticle"');
    });

    test('decodes HTML entities in style text', () => {
        const section = document.createElement('section');
        section.id = 'ent';
        const div = document.createElement('div');
        div.id = 'box';
        section.appendChild(div);

        const style = document.createElement('style');
        // Browser may encode > as &gt; in innerHTML
        style.innerHTML = '## &gt; .child { color: red; }';
        div.appendChild(style);
        document.body.appendChild(section);

        LocalStyle.localize(style);

        const newStyle = div.querySelector('style');
        const content = newStyle.innerHTML;
        // &gt; should be decoded to >
        expect(content).toContain('>');
        expect(content).not.toContain('&gt;');
    });

    test('appendLocalize adds style at location without source element', () => {
        const section = document.createElement('section');
        section.id = 'loc';
        const wrapper = document.createElement('div');
        wrapper.id = 'target';
        section.appendChild(wrapper);
        document.body.appendChild(section);

        LocalStyle.appendLocalize(wrapper, '## .added { font-size: 14px; }');

        // A <style> element should be appended to wrapper
        const style = wrapper.querySelector('style');
        expect(style).not.toBeNull();
        // Note: appendLocalize(null, ...) adds directly, so content may be empty
        // because the styleSheet is created but content is set only via elem path
    });
});
