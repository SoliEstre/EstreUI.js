import { describe, test, expect } from 'vitest';

// ── Static PID builders ─────────────────────────────────────────

describe('EstreUiPage — static PID builders', () => {

    test('getPidComponent: main + static', () => {
        expect(EstreUiPage.getPidComponent('home', 'main', 'static'))
            .toBe('$s&m=home');
    });

    test('getPidComponent: overlay + instant', () => {
        expect(EstreUiPage.getPidComponent('dialog', 'overlay', 'instant'))
            .toBe('$i&o=dialog');
    });

    test('getPidComponent: blind, no statement', () => {
        expect(EstreUiPage.getPidComponent('splash', 'blind'))
            .toBe('&b=splash');
    });

    test('getPidComponent: header', () => {
        expect(EstreUiPage.getPidComponent('appbar', 'header', 'static'))
            .toBe('$s&h=appbar');
    });

    test('getPidComponent: menu', () => {
        expect(EstreUiPage.getPidComponent('menuArea', 'menu', 'static'))
            .toBe('$s&u=menuArea');
    });

    test('getPidComponent: null id → null', () => {
        expect(EstreUiPage.getPidComponent(null, 'main')).toBeNull();
    });

    test('getPidComponent: empty id → null', () => {
        expect(EstreUiPage.getPidComponent('', 'main')).toBeNull();
    });

    test('getPidComponent: invalid sectionBound → null', () => {
        expect(EstreUiPage.getPidComponent('home', 'unknown')).toBeNull();
    });

    test('getPidContainer: builds component#container', () => {
        expect(EstreUiPage.getPidContainer('root', 'home', 'main', 'static'))
            .toBe('$s&m=home#root');
    });

    test('getPidContainer: null componentId → undefined', () => {
        expect(EstreUiPage.getPidContainer('root', null, 'main'))
            .toBeUndefined();
    });

    test('getPidArticle: builds component#container@article', () => {
        expect(EstreUiPage.getPidArticle('detail', 'root', 'home', 'main', 'static'))
            .toBe('$s&m=home#root@detail');
    });

    test('getPidArticle: instant overlay', () => {
        expect(EstreUiPage.getPidArticle('form', 'content', 'functional', 'overlay', 'instant'))
            .toBe('$i&o=functional#content@form');
    });
});


// ── Static PID strippers ────────────────────────────────────────

describe('EstreUiPage — PID strippers', () => {

    test('getPidStatementless: removes $s prefix', () => {
        expect(EstreUiPage.getPidStatementless('$s&m=home#root'))
            .toBe('&m=home#root');
    });

    test('getPidStatementless: removes $i prefix', () => {
        expect(EstreUiPage.getPidStatementless('$i&o=dialog'))
            .toBe('&o=dialog');
    });

    test('getPidStatementless: no statement prefix → unchanged', () => {
        expect(EstreUiPage.getPidStatementless('&m=home'))
            .toBe('&m=home');
    });

    test('getPidOriginless: removes instance origin after ^', () => {
        expect(EstreUiPage.getPidOriginless('$s&m=home^origin1'))
            .toBe('$s&m=home');
    });

    test('getPidOriginless: no ^ → unchanged', () => {
        expect(EstreUiPage.getPidOriginless('$s&m=home#root'))
            .toBe('$s&m=home#root');
    });

    test('getPidSeamless: strips both statement and origin', () => {
        expect(EstreUiPage.getPidSeamless('$i&o=dialog^session123'))
            .toBe('&o=dialog');
    });
});


// ── Instance PID construction via setters ───────────────────────

describe('EstreUiPage — pid getter via manual construction', () => {

    function buildPage({ sectionBound, component, container, article, statement }) {
        const page = new EstreUiPage();
        if (sectionBound) page.setSectionBound(sectionBound);
        if (component) page.setComponent(component);
        if (container) page.setContainer(container);
        if (article) page.setArticle(article);
        return page;
    }

    test('component-only PID', () => {
        const page = buildPage({ sectionBound: 'main', component: 'home' });
        expect(page.pid).toBe('$&m=home');
        expect(page.hostType).toBe('component');
        expect(page.isComponent).toBe(true);
        expect(page.isContainer).toBe(false);
        expect(page.isMain).toBe(true);
    });

    test('component + container PID', () => {
        const page = buildPage({ sectionBound: 'main', component: 'home', container: 'root' });
        expect(page.pid).toBe('$&m=home#root');
        expect(page.hostType).toBe('container');
        expect(page.isContainer).toBe(true);
    });

    test('full article PID', () => {
        const page = buildPage({ sectionBound: 'overlay', component: 'functional', container: 'content', article: 'form' });
        expect(page.pid).toBe('$&o=functional#content@form');
        expect(page.hostType).toBe('article');
        expect(page.isArticle).toBe(true);
        expect(page.isOverlay).toBe(true);
    });

    test('sectionBound accessors', () => {
        const page = buildPage({ sectionBound: 'blind', component: 'splash' });
        expect(page.isBlinded).toBe(true);
        expect(page.isMain).toBe(false);
    });

    test('id returns deepest level', () => {
        const pageComp = buildPage({ sectionBound: 'main', component: 'home' });
        expect(pageComp.id).toBe('home');

        const pageCont = buildPage({ sectionBound: 'main', component: 'home', container: 'root' });
        expect(pageCont.id).toBe('root');

        const pageArt = buildPage({ sectionBound: 'main', component: 'home', container: 'root', article: 'detail' });
        expect(pageArt.id).toBe('detail');
    });

    test('setComponent is idempotent (first call wins)', () => {
        const page = new EstreUiPage();
        page.setSectionBound('main');
        page.setComponent('first');
        page.setComponent('second');
        expect(page.component).toBe('first');
    });
});
