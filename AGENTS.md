# AGENTS.md

This project (`EstreUI.js` — the "Rimwork" framework) is the repository published at [SoliEstre/EstreUI.js](https://github.com/SoliEstre/EstreUI.js).
This document is the **shared guide** ensuring all AI agents (Claude, Gemini, Codex, etc.) follow identical rules when working in this repository.

---

## 1. Agent Knowledge Base Structure

The `.agent/` folder at the root contains two areas:

| Path | Scope | Language | Nature |
| --- | --- | --- | --- |
| `.agent/estreui/` | EstreUI.js concepts, APIs, and patterns | **English + secondary language dual track** (`*.en.md` / `*.<lang>.md`) | Public-ready developer documentation |
| `.agent/project/` | Application/operational context for projects using EstreUI.js | **Project language** (see §2) | Internal reference for project adaptation |

**Entry points:** [.agent/estreui/README.md](.agent/estreui/README.md) and [.agent/project/README.md](.agent/project/README.md) — each folder's `README.md` serves as both table of contents and status board.

---

## 2. Language Policy

### Defaults

- Agent **thinking, responses, and conversation** default to **English**.
- `.agent/project/` documents are written in the **project language** (English by default).
- `.agent/estreui/` documents are always written in **dual track**: English (`.en.md`) plus one secondary language (`.<lang>.md`, e.g. `.ko.md`).

### First-session setup

When an agent begins its **first session** with a new user on this project, it should:

1. Ask the user which language they prefer for conversation and project documents.
2. If the user chooses a non-English language, update these accordingly:
   - Set the conversation language to the user's preference.
   - Rewrite `.agent/project/` documents in the chosen language.
   - Update this section to reflect the chosen project language.
3. The `.agent/estreui/` dual-track structure remains unchanged — English is always the primary track, and the secondary track language should match the project language.

### Dual-track rules for `.agent/estreui/`

- File naming: `<topic>.en.md` and `<topic>.<lang>.md` (e.g. `<topic>.ko.md`).
- If only one language exists, the topic is a draft — mark it in the README index.
- Both versions must follow the same structure and examples. Translate from whichever version was written first.
- `.agent/estreui/README.md` itself contains both English and secondary-language sections in a single file.

---

## 3. Work Rules (Mandatory)

Follow these rules whenever modifying or adding documents:

1. **Update README first.** If you add a new document/section or rename a title, immediately update the corresponding folder's `README.md` index. If the index drifts from reality, every other doc loses its way.
2. **Respect EstreUI.js scope.** `.agent/estreui/` documents must only describe features, APIs, and CSS included in this repository. Project-specific extensions (custom handle classes, project API routes, domain terms) do not belong here.
3. **Keep examples neutral.** Use generic names (`myApp`, `example.com`, `MyHandle`, etc.) that cannot identify any specific project.
4. **Prefer case-based writing.** Favor concrete scenarios ("this markup, in this file, triggers this hook, and renders like this") over abstract descriptions. Keep code blocks to the minimum runnable unit.
5. **Use markdown links for references.** Reference project files as `[filename.ext](relative/path)` (no absolute paths, no backslashes). Append `#Lnn` anchors for specific lines.
6. **Verify against upstream source.** When describing EstreUI.js behavior, verify against this repository's main branch rather than project-local copies that may have been modified.
7. **Run the `.agent/` lint before committing.** When you add, rename, delete, or restructure files under `.agent/`, run `npm run lint:docs` and ensure a clean exit before committing. Do not commit a broken lint state. Checks (index completeness, dead links, dual-track parity, review/roadmap dashboard integrity) are documented in the header of [.agent/lint.mjs](.agent/lint.mjs).

---

## 4. Test Suite

Tests that exercise EstreUI.js itself live in [test/estreui/](test/estreui/). This folder is the framework's canonical regression suite and is maintained inside this repository.

### Folder boundary

| Path | Scope | Ships with the framework |
| --- | --- | --- |
| `test/estreui/` | EstreUI.js framework tests (PID parsing, Doctre, LocalStyle, handles, page manager, regressions) | ✅ Yes |
| `test/project/` | Adopter-specific logic and flow tests (when added in downstream projects) | ❌ No (excluded alongside `.agent/project/`) |

- New tests that cover **framework behavior** go in `test/estreui/`. Do not mix in adopter-specific identifiers — these files are meant to be usable as-is by every EstreUI-based project.
- New tests that cover **adopter-specific logic** go in `test/project/`. That folder is the adopter's own and is never pulled back into the framework.

### Adopting the suite in a new EstreUI-based project

When a new project adopts EstreUI.js, copying `test/estreui/` gives it a regression suite out of the box:

1. Copy `test/estreui/` from this repository.
2. Install `vitest` and `jsdom` as dev dependencies; add `test` and `test:watch` scripts to `package.json`. See [.agent/estreui/testing-guide.en.md](.agent/estreui/testing-guide.en.md) for details.
3. Verify that `test/estreui/setup.js`'s `loadOrder` matches the project's script list — if custom handlers or extensions are added, insert them in the array in the same position as the HTML `<script>` tag order.
4. Run `npm test`. The full suite should pass immediately.

### Modifying shared tests

Edits to `test/estreui/` are framework-bound. Keep them free of adopter-specific identifiers — otherwise adopters pulling the suite will have to sanitize every time they sync.

---

## 5. EstreUI.js Review & Improvement Tracking

When bugs, typos, or improvements are discovered during source analysis or documentation, register them in `.agent/estreui/review/`:

1. **Create a file.** Use `NNN-slug.md` format (number + kebab-case) with details: symptom, code location (file + line), impact, and suggested fix.
2. **Update the dashboard.** Add a row to `review/README.md` with severity (🔴 bug / 🟡 typo / 🟢 improvement), category, file, and resolved-version columns.
3. **On resolution.** When a fix is applied, enter the version or commit hash in the "resolved version" column.
4. **Document language.** Review documents are written in the **project language** only (single track, since these are operational tracking documents).

---

## 6. Summary — What an Agent Should Do in a New Session

1. User requests EstreUI.js code changes → modify code; update docs if needed.
2. User requests "EstreUI.js concept/pattern documentation" → open `.agent/estreui/README.md` first to check status → write/edit topic docs (`*.en.md` + `*.<lang>.md`) → update README index.
3. User requests "project adaptation guide" → write/edit in `.agent/project/` using the project language.
4. Per-agent auxiliary files: [CLAUDE.md](CLAUDE.md), [GEMINI.md](GEMINI.md) — all reference this document (`AGENTS.md`) as the authoritative guide.
