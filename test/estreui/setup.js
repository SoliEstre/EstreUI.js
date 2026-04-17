/**
 * Test setup — loads EstreUI.js scripts into the jsdom global scope.
 *
 * Browser scripts declare top-level `const` which is block-scoped in Node.
 * We concatenate them into a single `new Function()` body so they share
 * one scope, then bind the public identifiers to `globalThis`.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const scriptsDir = resolve(import.meta.dirname, '..', '..', 'scripts');

const loadOrder = [
    'modernism.js',
    'alienese.js',
    'doctre.js',
    'estreU0EEOZ.js',
    'estreUi-core.js',
    'estreUi-dialog.js',
    'estreUi-notation.js',
    'estreUi-pageModel.js',
    'estreUi-pageManager.js',
    'estreUi-handles.js',
    'estreUi-interaction.js',
    'estreUi-main.js',
];

// Read all scripts
const sources = loadOrder.map(name => {
    const path = resolve(scriptsDir, name);
    return `// --- ${name} ---\n` + readFileSync(path, 'utf8');
});

// Wrap in a function that returns public identifiers
// Top-level `const` inside the function body shares one scope.
const combined = sources.join('\n\n');

// Build a function that executes all scripts and returns key exports
const wrapper = new Function(`
    ${combined}

    // Return key identifiers for global binding
    return {
        // modernism
        _global, defineGlobal,
        UNDEFINED, NULL, TRUE, FALSE,
        FUNCTION, BOOLEAN, STRING, SYMBOL, NUMBER, BIGINT, OBJECT,

        // alienese — primitives & common
        t, f, n, u, d, s, i, es, cm, cl, eq,
        U, N, T, F,
        nne, noe, nn, en, ee, ne, et, ef,
        mc, ec, xc, tc, cc, kc,
        cp, mk, mm, tw, cn, pc, ow, tk, aq, ih, rv,
        pq, pd, pp, pb, ppq, paq, pwq, pfq, pfp,
        ok, ov, oe, oc,
        dr, drx,
        to, tm, tu, tf, tb, ts, ty, tn, tg, tj,
        im, io, ia, sm, df, xv, nxv, ev, nev,
        fc, nfc, xu, xn, xt, xf, nxu, nxn,
        ifx, itx, ifr, val,
        f02b, f02r, ff, fb, fi, fo, fkv, w, dw,
        rx, reg,
        obj, str, num, fun, ra, dt, sa, ma,
        eoo, eoa, x,
        lr, rr, lc, rc, ls, rs, lt, gt,

        // doctre
        Doctre,
        NodeArray,

        // estreU0EEOZ
        LocalStyle,
        ax, ai, aiv, acv,
        doc,

        // estreUi
        uis, eds,
        EstreUiPage,
        EstreUiPageManager,
        EstreUiCustomPageManager,
        EstrePageHandler,
        EstrePageHandle,
        EstreHandle,
        pageManager,
        estreUi,
    };
`);

// Execute and bind to globalThis
try {
    const exports = wrapper();
    for (const [key, value] of Object.entries(exports)) {
        globalThis[key] = value;
    }
    // Activate Doctre prototype extensions on Element/Node/NodeList
    Doctre.patch();
} catch (e) {
    console.error('Failed to load EstreUI scripts:', e.message);
    console.error(e.stack?.split('\n').slice(0, 5).join('\n'));
    throw e;
}
