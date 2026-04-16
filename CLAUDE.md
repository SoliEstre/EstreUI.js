# CLAUDE.md

Claude (or Claude Code) sessions use [AGENTS.md](AGENTS.md) as the **authoritative guide** for this repository. Below are Claude-specific notes.

## Required Reading
- [AGENTS.md](AGENTS.md) — Shared rules for all agents (language policy / `.agent/` structure / README update rules / example neutrality).
- [.agent/estreui/README.md](.agent/estreui/README.md) — EstreUI.js documentation index (dual-track).
- [.agent/project/README.md](.agent/project/README.md) — Project adaptation guide.

## First Session
- On your first session with a new user, ask which language they prefer for conversation and project documents (see AGENTS.md §2 "First-session setup").
- Apply the chosen language to all subsequent responses, project documents, and the secondary track of EstreUI.js docs.

## Claude Session Guidelines
- Default conversation language is English unless the user has chosen otherwise.
- Before starting documentation work, read the relevant README (index) first. Use TodoWrite to visualize the plan if needed.
- When describing EstreUI.js APIs or behavior, verify against this repository's source code directly.
- Ensure no project-specific brand/domain identifiers appear in documentation — use neutral examples.
