import { describe, test, expect } from 'vitest';

// ── nne / noe — null-or-empty checks ───────────────────────────

describe('nne() — isNotNullAndEmpty', () => {

    test('returns true for non-empty string', () => {
        expect(nne('hello')).toBe(true);
    });

    test('returns true for number', () => {
        expect(nne(42)).toBe(true);
    });

    test('returns false for zero (falsy = empty)', () => {
        expect(nne(0)).toBe(false);
    });

    test('returns false for false (falsy = empty)', () => {
        expect(nne(false)).toBe(false);
    });

    test('returns false for empty object (falsy = empty)', () => {
        expect(nne({})).toBe(false);
    });

    test('returns false for empty array (falsy = empty)', () => {
        expect(nne([])).toBe(false);
    });

    test('returns false for null', () => {
        expect(nne(null)).toBe(false);
    });

    test('returns false for undefined', () => {
        expect(nne(undefined)).toBe(false);
    });

    test('returns false for empty string', () => {
        expect(nne('')).toBe(false);
    });
});

describe('noe() — isNullOrEmpty', () => {

    test('returns true for null', () => {
        expect(noe(null)).toBe(true);
    });

    test('returns true for undefined', () => {
        expect(noe(undefined)).toBe(true);
    });

    test('returns true for empty string', () => {
        expect(noe('')).toBe(true);
    });

    test('returns false for non-empty string', () => {
        expect(noe('x')).toBe(false);
    });

    test('returns true for zero (falsy = empty)', () => {
        expect(noe(0)).toBe(true);
    });
});


// ── Primitive aliases ───────────────────────────────────────────

describe('Alienese primitive aliases', () => {

    test('t/f/n/u are correct', () => {
        expect(t).toBe(true);
        expect(f).toBe(false);
        expect(n).toBe(null);
        expect(u).toBe(undefined);
    });

    test('d is dot, s is space, i is hash', () => {
        expect(d).toBe('.');
        expect(s).toBe(' ');
        expect(i).toBe('#');
    });

    test('U/N/T/F are type strings', () => {
        expect(U).toBe('undefined');
        expect(N).toBe('null');
        expect(T).toBe('true');
        expect(F).toBe('false');
    });
});


// ── Type checking aliases ───────────────────────────────────────

describe('Alienese type checks', () => {

    test('to() returns typeof', () => {
        expect(to(42)).toBe('number');
        expect(to('x')).toBe('string');
        expect(to(true)).toBe('boolean');
        expect(to(undefined)).toBe('undefined');
        expect(to({})).toBe('object');
        expect(to(() => {})).toBe('function');
    });

    test('ts/tn/tb/tf/tj — typed checks', () => {
        expect(ts('hello')).toBe(true);
        expect(ts(42)).toBe(false);
        expect(tn(42)).toBe(true);
        expect(tn('x')).toBe(false);
        expect(tb(true)).toBe(true);
        expect(tb(0)).toBe(false);
        expect(tf(() => {})).toBe(true);
        expect(tf('x')).toBe(false);
        expect(tj({})).toBe(true);
        expect(tj(42)).toBe(false);
    });

    test('ia() — isArray', () => {
        expect(ia([])).toBe(true);
        expect(ia({})).toBe(false);
        expect(ia('str')).toBe(false);
    });
});


// ── Match case ──────────────────────────────────────────────────

describe('xc() — exactCase', () => {

    test('matches exact value and returns handler result', () => {
        const result = xc(2, {
            1: _ => 'one',
            2: _ => 'two',
            3: _ => 'three',
        });
        expect(result).toBe('two');
    });

    test('returns undefined when no match', () => {
        const result = xc(99, {
            1: _ => 'one',
        });
        expect(result).toBeUndefined();
    });
});


// ── Object utilities ────────────────────────────────────────────

describe('ok/ov/oe/oc — Object shortcuts', () => {

    test('ok returns keys', () => {
        expect(ok({ a: 1, b: 2 })).toEqual(['a', 'b']);
    });

    test('ov returns values', () => {
        expect(ov({ a: 1, b: 2 })).toEqual([1, 2]);
    });

    test('oe returns entries', () => {
        expect(oe({ a: 1 })).toEqual([['a', 1]]);
    });

    test('oc returns key count', () => {
        expect(oc({ a: 1, b: 2, c: 3 })).toBe(3);
    });
});


// ── Copy utilities ──────────────────────────────────────────────

describe('cp/mk — copy/mock', () => {

    test('cp deep copies an object', () => {
        const orig = { a: { b: 1 }, c: 2 };
        const copied = cp(orig);
        expect(copied).toEqual(orig);
        expect(copied).not.toBe(orig);
        expect(copied.a).not.toBe(orig.a);
    });

    test('mk shallow clones', () => {
        const orig = { a: 1, b: 2 };
        const cloned = mk(orig);
        expect(cloned).toEqual(orig);
        expect(cloned).not.toBe(orig);
    });
});
