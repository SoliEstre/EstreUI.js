# Example Sanitization Guide

`.agent/estreui/` documents are general-purpose developer documentation for EstreUI.js itself. To avoid exposing any specific project's domain, apply the rules below when excerpting project code into documentation.

## 1. Identifier Substitution Principles

| Original Type | Neutral Example for Documentation |
| --- | --- |
| Project-specific custom handle class names (`*Handle`) | `MyHandle`, `SearchHandle`, `UserHandle`, `BoardHandle`, etc. |
| Class names with project prefix | Remove prefix or replace with `App*` / `My*` |
| PagesProvider class | `MyPagesProvider` |
| CustomPageManager class | `MyPageManager` |
| API client / server URLs | `myApi`, `apiBaseUrl`, `API_BASE`, `api.example.com` |
| Session/auth managers | `sessionManager`, `MySessionManager` |
| Project domain / brand names | `example.com`, `app.example.com`, `MyApp` |
| Project-specific constants (WUID, session keys, etc.) | `APP_WUID`, `APP_SESSION_KEY` |
| Project-specific CSS filenames | `appCommon.css`, `appFonts.css`, etc. |
| External service keys / tokens | Never expose — mask or remove when excerpting code |

## 2. Domain Terms — Do Not Expose / Abstract

| Project Domain Terms | Treatment in Documentation |
| --- | --- |
| Project-specific page names (domain-specific) | Replace with generic names: `home`, `profile`, `list`, `detail`, `settings` |
| Project-specific code systems | Never expose — use fake tokens (`code1`, `code2`) if needed |
| PID examples | Simplify to generic `&m=section#container@article` form. PID format itself is fine but replace domain words |

## 3. Code Excerpting Rules

- Keep each code block to **15–30 lines**. Do not copy 200 lines verbatim from the original.
- Generalize business logic calls to their signature only; replace body with comments like `// authentication logic`.
- Same for HTML excerpts — show only the minimal markup where the key conventions (`data-exported`, `data-static`, `data-container-id`, `local-style`, etc.) are visible.
- Do not embed line numbers or file paths as comments inside code. Use "see also" links in the prose instead.

## 4. Tone & Style Guide

- Write in **example → generalization** order. Show a short markup/JS snippet first, then explain how it works.
- Both language versions must have **100% identical heading structure and example code**. Only the prose language differs. This makes future synchronization easier.
- When using examples that depend on external libraries (jQuery, etc.), either note the dependency or simplify to a dependency-free form.

## 5. "Is This EstreUI Scope?" Quick Checklist

- Does the class/function start with `Estre*`? → Likely EstreUI.
- Can it be found in this repository's source? → EstreUI.
- Does it contain a project prefix or domain-specific words? → Project-specific — do not include as-is in EstreUI docs.
- Is it a project server API route? → Project-specific — never expose.
