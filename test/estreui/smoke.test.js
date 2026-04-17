import { describe, test, expect } from 'vitest';

describe('Smoke test — script loading', () => {
    test('alienese primitives are available', () => {
        expect(t).toBe(true);
        expect(f).toBe(false);
        expect(n).toBe(null);
        expect(u).toBe(undefined);
    });

    test('nne() is a function', () => {
        expect(typeof nne).toBe('function');
    });

    test('Doctre class is available', () => {
        expect(typeof Doctre).toBe('function');
    });

    test('EstreUiPage class is available', () => {
        expect(typeof EstreUiPage).toBe('function');
    });

    test('uis/eds registries exist', () => {
        expect(typeof uis).toBe('object');
        expect(typeof eds).toBe('object');
    });
});
