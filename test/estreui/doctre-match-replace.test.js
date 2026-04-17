import { describe, test, expect } from 'vitest';

describe('Doctre.matchReplace — string replacements', () => {

    test('replaces pipe-delimited tokens with string values', () => {
        const result = Doctre.matchReplace('|greeting| |name|!', {
            greeting: 'Hello',
            name: 'World',
        });
        expect(result).toBe('Hello World!');
    });

    test('replaces token with function return value (receives key)', () => {
        const result = Doctre.matchReplace('|x|', {
            x: (key) => key.toUpperCase(),
        });
        expect(result).toBe('X');
    });

    test('replaces token with JSON-stringified object', () => {
        const result = Doctre.matchReplace('data=|obj|', {
            obj: { a: 1, b: 2 },
        });
        expect(result).toBe('data={"a":1,"b":2}');
    });

    test('replaces token with number (coerced to string)', () => {
        const result = Doctre.matchReplace('count: |n|', { n: 42 });
        expect(result).toBe('count: 42');
    });

    test('replaces token with boolean (coerced to string)', () => {
        const result = Doctre.matchReplace('|flag|', { flag: true });
        expect(result).toBe('true');
    });

    test('unmatched tokens remain when no dataPlaceholder', () => {
        const result = Doctre.matchReplace('|known| |unknown|', {
            known: 'yes',
        });
        expect(result).toBe('yes |unknown|');
    });

    test('null value with dataPlaceholder uses placeholder', () => {
        const result = Doctre.matchReplace('|a| |b|', {
            a: 'ok',
            b: null,
            dataPlaceholder: '-',
        });
        expect(result).toBe('ok -');
    });

    test('multiple occurrences of same token are all replaced', () => {
        const result = Doctre.matchReplace('|x| and |x|', { x: 'A' });
        expect(result).toBe('A and A');
    });

    test('empty replacer object returns string unchanged', () => {
        const result = Doctre.matchReplace('|a| |b|', {});
        expect(result).toBe('|a| |b|');
    });

    test('empty string input returns empty string', () => {
        const result = Doctre.matchReplace('', { a: 'x' });
        expect(result).toBe('');
    });
});


describe('Doctre.matchReplace — coverReplaceable', () => {

    test('coverReplaceable replaces all unmatched tokens with dataPlaceholder', () => {
        const result = Doctre.matchReplace('|known| |x| |y|', {
            known: 'ok',
            dataPlaceholder: '?',
            coverReplaceable: true,
        });
        expect(result).toBe('ok ? ?');
    });

    test('coverReplaceable with function dataPlaceholder (receives match with pipes)', () => {
        const result = Doctre.matchReplace('|a| |missing|', {
            a: 'found',
            dataPlaceholder: (key) => `[${key}]`,
            coverReplaceable: true,
        });
        // The function receives the full match including pipes
        expect(result).toBe('found [|missing|]');
    });

    test('coverReplaceable without dataPlaceholder leaves tokens', () => {
        const result = Doctre.matchReplace('|a| |b|', {
            a: 'ok',
            coverReplaceable: true,
        });
        expect(result).toBe('ok |b|');
    });
});


describe('Doctre.matchReplace — object mode', () => {

    test('replaces tokens in both keys and values of an object', () => {
        const result = Doctre.matchReplace(
            { '|keyToken|': '|valToken|', plain: '|v|' },
            { keyToken: 'realKey', valToken: 'realVal', v: 'data' },
        );
        expect(result).toEqual({ realKey: 'realVal', plain: 'data' });
    });
});


describe('Doctre.crashBroker', () => {

    test('returns input unchanged on non-Safari (no escape needed)', () => {
        // In jsdom, isRequiredEscape depends on user agent detection
        const input = 'hello world';
        const result = Doctre.crashBroker(input);
        expect(result).toBe('hello world');
    });
});


describe('Doctre.copyPrimitives', () => {

    test('keeps only primitive values from object', () => {
        const result = Doctre.copyPrimitives({
            a: 1,
            b: 'str',
            c: true,
            d: { nested: true },
            e: [1, 2],
            f: null,
        });
        // null is primitive (Object(null) !== null), so it's kept
        expect(result).toEqual({ a: 1, b: 'str', c: true, f: null });
    });
});
