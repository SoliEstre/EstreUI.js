#!/usr/bin/env node
/**
 * .agent/ docs lint
 *
 * Verifies that index READMEs stay in sync with the files around them.
 * See: .agent/estreui/roadmap/005-agent-docs-lint.md
 *
 * ─────────────────────────────────────────────────────────────────
 * Expected layout (this script is tailored to it — see fallback below)
 *
 *   .agent/
 *     estreui/
 *       README.md               ← index for the folder
 *       <topic>.en.md           ← two-track docs: English half
 *       <topic>.ko.md           ← two-track docs: Korean half
 *       review/
 *         README.md             ← dashboard table
 *         NNN-<slug>.md         ← one file per review item
 *       roadmap/
 *         README.md             ← dashboard table
 *         NNN-<slug>.md         ← one file per roadmap item
 *
 * If your project uses a different docs layout, either (a) restructure to
 * match, (b) fork this script and adjust the directory constants below, or
 * (c) drop the script — none of the checks make sense without the indexes.
 * When the expected directories are absent, the script exits early with a
 * hint instead of crashing.
 * ─────────────────────────────────────────────────────────────────
 *
 * Checks
 *   1. Index completeness — every non-README `.md` in `.agent/estreui/` is
 *      linked from `.agent/estreui/README.md`.
 *   2. Dead links        — every relative `.md` link in the READMEs points
 *      at a file that actually exists on disk.
 *   3. Two-track parity  — every `<topic>.en.md` in `.agent/estreui/` has a
 *      matching `<topic>.ko.md` (and vice versa). Missing pairs must be
 *      marked 🟡 in the index.
 *   4. Review dashboard  — every `.agent/estreui/review/NNN-*.md` has a row
 *      in `review/README.md`.
 *   5. Roadmap dashboard — every `.agent/estreui/roadmap/NNN-*.md` has a row
 *      in `roadmap/README.md` (supporting sub-docs can opt out via the
 *      LINT_IGNORE marker, see below).
 *
 * LINT_IGNORE marker
 *   Any file whose first 10 lines contain `<!-- lint-ignore:unindexed -->`
 *   is exempt from checks 1 and 5. Use it for child artifacts that live
 *   alongside a numbered parent but don't warrant their own dashboard row.
 *
 * Exit code: 0 on clean, 1 on any finding.
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { resolve, relative, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ESTREUI = resolve(__dirname, 'estreui');
const REVIEW = resolve(ESTREUI, 'review');
const ROADMAP = resolve(ESTREUI, 'roadmap');

const IGNORE_MARKER = '<!-- lint-ignore:unindexed -->';

// Preflight: if the expected layout isn't present, bail out with a hint
// rather than crashing on the first missing directory.
for (const [label, path] of [['estreui', ESTREUI], ['review', REVIEW], ['roadmap', ROADMAP]]) {
    try {
        if (!statSync(path).isDirectory()) throw new Error('not a directory');
    } catch {
        console.error(`.agent/ docs lint — expected directory not found: ${relative(ROOT, path).replace(/\\/g, '/')}`);
        console.error('This script assumes the .agent/estreui/{review,roadmap}/ layout documented at the top of lint.mjs.');
        console.error(`Missing: ${label}/. Adjust the constants in this script or skip running it.`);
        process.exit(0);
    }
}

const findings = [];
function fail(check, message) {
    findings.push({ check, message });
}

// ── Helpers ─────────────────────────────────────────────────────

function listMd(dir) {
    return readdirSync(dir)
        .filter(name => name.endsWith('.md'))
        .filter(name => statSync(resolve(dir, name)).isFile());
}

// Returns all markdown links as { href, text } pairs.
// Matches `[text](href)` but skips autolinks and images.
function extractLinks(content) {
    const links = [];
    const regex = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
    let m;
    while ((m = regex.exec(content)) !== null) {
        links.push({ text: m[1], href: m[2] });
    }
    return links;
}

function hasIgnoreMarker(filePath) {
    try {
        const head = readFileSync(filePath, 'utf8').split('\n').slice(0, 10).join('\n');
        return head.includes(IGNORE_MARKER);
    } catch {
        return false;
    }
}

function relFromRoot(absPath) {
    return relative(ROOT, absPath).replace(/\\/g, '/');
}


// ── Check 2 (runs first so later checks can reuse the link map) ─

function collectReadmeLinks(readmePath) {
    const content = readFileSync(readmePath, 'utf8');
    const links = extractLinks(content);
    const hrefs = new Set();
    const baseDir = dirname(readmePath);

    for (const { href } of links) {
        // Strip anchor
        const cleanHref = href.split('#')[0];
        if (cleanHref === '') continue;

        // Skip absolute URLs and non-markdown references
        if (/^https?:\/\//.test(cleanHref)) continue;
        if (/^mailto:/.test(cleanHref)) continue;
        if (!cleanHref.endsWith('.md') && !cleanHref.endsWith('/')) continue;

        hrefs.add(cleanHref);

        // Dead-link check — resolve to absolute and stat
        const target = resolve(baseDir, cleanHref);
        try {
            statSync(target);
        } catch {
            fail('dead-link', `${relFromRoot(readmePath)} → ${href} (resolved: ${relFromRoot(target)})`);
        }
    }

    return hrefs;
}

const topIndexLinks = collectReadmeLinks(resolve(ESTREUI, 'README.md'));
const reviewIndexLinks = collectReadmeLinks(resolve(REVIEW, 'README.md'));
const roadmapIndexLinks = collectReadmeLinks(resolve(ROADMAP, 'README.md'));


// ── Check 1: index completeness (.agent/estreui/) ──────────────

{
    const topLevelFiles = listMd(ESTREUI).filter(name => name !== 'README.md');
    for (const name of topLevelFiles) {
        const absPath = resolve(ESTREUI, name);
        if (hasIgnoreMarker(absPath)) continue;

        // Accept either the bare filename or `./filename`
        if (!topIndexLinks.has(name) && !topIndexLinks.has(`./${name}`)) {
            fail('index-completeness', `.agent/estreui/${name} is not linked from .agent/estreui/README.md`);
        }
    }
}


// ── Check 3: two-track parity (.agent/estreui/) ────────────────

{
    const topLevelFiles = listMd(ESTREUI).filter(name => name !== 'README.md');
    const byTopic = new Map(); // topic → { en: bool, ko: bool }
    for (const name of topLevelFiles) {
        const match = name.match(/^(.+)\.(en|ko)\.md$/);
        if (!match) continue;
        const [, topic, lang] = match;
        if (!byTopic.has(topic)) byTopic.set(topic, { en: false, ko: false });
        byTopic.get(topic)[lang] = true;
    }

    const indexText = readFileSync(resolve(ESTREUI, 'README.md'), 'utf8');
    for (const [topic, { en, ko }] of byTopic) {
        if (en && ko) continue; // complete pair, nothing to check

        // Incomplete pair must be flagged 🟡 in the index. Look for the topic's
        // filename adjacent to a 🟡 status cell on the same line.
        const missingLang = en ? 'ko' : 'en';
        const haveFile = `${topic}.${en ? 'en' : 'ko'}.md`;

        // Find the index row mentioning haveFile
        const rowRegex = new RegExp(`\\|[^\\n]*${haveFile.replace(/\./g, '\\.')}[^\\n]*\\|`, 'g');
        const matches = indexText.match(rowRegex) || [];
        const flaggedYellow = matches.some(row => row.includes('🟡'));
        if (!flaggedYellow) {
            fail('two-track-parity',
                `${topic}: missing ${topic}.${missingLang}.md — index row must be marked 🟡 (draft)`);
        }
    }
}


// ── Check 4: review dashboard completeness ─────────────────────

{
    const reviewFiles = listMd(REVIEW).filter(name => name !== 'README.md');
    for (const name of reviewFiles) {
        const absPath = resolve(REVIEW, name);
        if (hasIgnoreMarker(absPath)) continue;

        if (!reviewIndexLinks.has(name) && !reviewIndexLinks.has(`./${name}`)) {
            fail('review-dashboard', `review/${name} is not listed in review/README.md`);
        }
    }
}


// ── Check 5: roadmap dashboard completeness ────────────────────

{
    const roadmapFiles = listMd(ROADMAP).filter(name => name !== 'README.md');
    for (const name of roadmapFiles) {
        const absPath = resolve(ROADMAP, name);
        if (hasIgnoreMarker(absPath)) continue;

        if (!roadmapIndexLinks.has(name) && !roadmapIndexLinks.has(`./${name}`)) {
            fail('roadmap-dashboard', `roadmap/${name} is not listed in roadmap/README.md`);
        }
    }
}


// ── Report ─────────────────────────────────────────────────────

if (findings.length === 0) {
    console.log('.agent/ docs lint — clean.');
    process.exit(0);
}

const byCheck = new Map();
for (const { check, message } of findings) {
    if (!byCheck.has(check)) byCheck.set(check, []);
    byCheck.get(check).push(message);
}

console.error(`.agent/ docs lint — ${findings.length} finding(s):\n`);
for (const [check, msgs] of byCheck) {
    console.error(`[${check}]`);
    for (const msg of msgs) console.error(`  - ${msg}`);
    console.error('');
}
process.exit(1);
