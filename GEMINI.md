# GEMINI.md

Gemini CLI sessions use [AGENTS.md](AGENTS.md) as the **authoritative guide** for this repository. Below are Gemini-specific notes.

## Required Reading
- [AGENTS.md](AGENTS.md) — Shared rules for all agents.
- [.agent/estreui/README.md](.agent/estreui/README.md) — EstreUI.js documentation index (dual-track).
- [.agent/project/README.md](.agent/project/README.md) — Project adaptation guide.

## First Session
- On your first session with a new user, ask which language they prefer for conversation and project documents (see AGENTS.md §2 "First-session setup").
- Apply the chosen language to all subsequent responses, project documents, and the secondary track of EstreUI.js docs.

## Gemini Session Guidelines
- Default conversation language is English unless the user has chosen otherwise.
- Always update the corresponding README index after adding or modifying documents.
- Verify EstreUI.js facts against this repository's source code.
- Do not include project-specific identifiers (brands, domains, API routes) in documentation — use neutral examples.
