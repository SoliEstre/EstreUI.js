import { describe, test, expect, beforeEach } from 'vitest';

// ── estreUi.pushBackHandler / popBackHandler / onBack external stack ──
//
// Roadmap #011 — light-DOM-mounted external embeds register navigation
// handlers; estreUi.onBack runs them LIFO before its own section stack.

describe('estreUi external back handler stack', () => {

    beforeEach(() => {
        // Drain any handlers a prior test may have left behind. The setup
        // bootstraps estreUi once per worker, so state persists across tests.
        estreUi.clearAllExternalBackHandlers();
    });

    test('pushBackHandler returns a positive integer token', () => {
        const token = estreUi.pushBackHandler(() => false);
        expect(typeof token).toBe('number');
        expect(token).toBeGreaterThan(0);
    });

    test('pushBackHandler rejects non-functions and returns null', () => {
        expect(estreUi.pushBackHandler(null)).toBeNull();
        expect(estreUi.pushBackHandler(undefined)).toBeNull();
        expect(estreUi.pushBackHandler(42)).toBeNull();
        expect(estreUi.pushBackHandler({})).toBeNull();
        expect(estreUi.externalBackStack.length).toBe(0);
    });

    test('successive pushes return distinct tokens', () => {
        const a = estreUi.pushBackHandler(() => false);
        const b = estreUi.pushBackHandler(() => false);
        expect(a).not.toBe(b);
    });

    test('popBackHandler returns true on hit, removes the entry', () => {
        const token = estreUi.pushBackHandler(() => false);
        expect(estreUi.externalBackStack.length).toBe(1);
        expect(estreUi.popBackHandler(token)).toBe(true);
        expect(estreUi.externalBackStack.length).toBe(0);
    });

    test('popBackHandler returns false on unknown token, stack unchanged', () => {
        const token = estreUi.pushBackHandler(() => false);
        expect(estreUi.popBackHandler(999999)).toBe(false);
        expect(estreUi.externalBackStack.length).toBe(1);
        // Cleanup
        estreUi.popBackHandler(token);
    });

    test('out-of-order pop is allowed', () => {
        const a = estreUi.pushBackHandler(() => false);
        const b = estreUi.pushBackHandler(() => false);
        const c = estreUi.pushBackHandler(() => false);
        expect(estreUi.externalBackStack.length).toBe(3);
        // Remove the middle one
        expect(estreUi.popBackHandler(b)).toBe(true);
        expect(estreUi.externalBackStack.length).toBe(2);
        expect(estreUi.externalBackStack[0].token).toBe(a);
        expect(estreUi.externalBackStack[1].token).toBe(c);
    });

    test('same handler can be pushed twice with separate tokens', () => {
        const handler = () => false;
        const a = estreUi.pushBackHandler(handler);
        const b = estreUi.pushBackHandler(handler);
        expect(a).not.toBe(b);
        expect(estreUi.externalBackStack.length).toBe(2);
        expect(estreUi.popBackHandler(a)).toBe(true);
        expect(estreUi.externalBackStack.length).toBe(1);
        expect(estreUi.popBackHandler(b)).toBe(true);
    });

    test('clearAllExternalBackHandlers empties the stack', () => {
        estreUi.pushBackHandler(() => false);
        estreUi.pushBackHandler(() => false);
        estreUi.pushBackHandler(() => false);
        expect(estreUi.externalBackStack.length).toBe(3);
        estreUi.clearAllExternalBackHandlers();
        expect(estreUi.externalBackStack.length).toBe(0);
    });

    test('onBack invokes handlers LIFO and stops at first truthy return', async () => {
        const calls = [];
        estreUi.pushBackHandler(() => { calls.push('first'); return false; });
        estreUi.pushBackHandler(() => { calls.push('second'); return false; });
        estreUi.pushBackHandler(() => { calls.push('third'); return true; });

        await estreUi.onBack();

        // LIFO — third runs first and absorbs; first/second never run.
        expect(calls).toEqual(['third']);
    });

    test('onBack falls through to the next handler when one returns falsy', async () => {
        const calls = [];
        estreUi.pushBackHandler(() => { calls.push('older'); return true; });
        estreUi.pushBackHandler(() => { calls.push('newer'); return false; });

        await estreUi.onBack();

        // Newer ran first, returned false → older ran and absorbed.
        expect(calls).toEqual(['newer', 'older']);
    });

    test('onBack returns true when an external handler absorbs', async () => {
        estreUi.pushBackHandler(() => true);
        const result = await estreUi.onBack();
        expect(result).toBe(true);
    });

    test('async handler is awaited', async () => {
        let resolved = false;
        estreUi.pushBackHandler(async () => {
            await new Promise(r => setTimeout(r, 10));
            resolved = true;
            return true;
        });

        const result = await estreUi.onBack();
        expect(resolved).toBe(true);
        expect(result).toBe(true);
    });

    test('throwing handler is isolated, next handler still runs', async () => {
        const calls = [];
        // Silence the warn during the test
        const originalLogging = window.isLogging;
        window.isLogging = false;

        estreUi.pushBackHandler(() => { calls.push('older'); return true; });
        estreUi.pushBackHandler(() => { calls.push('thrower'); throw new Error('boom'); });

        const result = await estreUi.onBack();

        expect(calls).toEqual(['thrower', 'older']);
        expect(result).toBe(true);

        window.isLogging = originalLogging;
    });

    test('async-rejecting handler is isolated', async () => {
        const calls = [];
        const originalLogging = window.isLogging;
        window.isLogging = false;

        estreUi.pushBackHandler(() => { calls.push('older'); return true; });
        estreUi.pushBackHandler(async () => { calls.push('rejector'); throw new Error('async-boom'); });

        const result = await estreUi.onBack();

        expect(calls).toEqual(['rejector', 'older']);
        expect(result).toBe(true);

        window.isLogging = originalLogging;
    });

    // Note: a "fall-through to EstreUI section stack" check would need a fully
    // initialized estreUi (overlayArea / blindArea / mainArea attached). In the
    // jsdom unit-test scope those are null, so we cover the fall-through
    // semantics indirectly via the falsy-return test above (which proves the
    // loop continues past a falsy handler) and trust the section-stack walk
    // itself to other test files.
});
