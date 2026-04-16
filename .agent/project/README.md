# EstreUI.js Project Adaptation Guide — Agent Context

This folder provides reference material for AI agents and developers working on **projects that use EstreUI.js**.
It covers the background knowledge needed when integrating EstreUI.js into a new project or modifying code in an existing one.

> The authoritative guide is [AGENTS.md](../../AGENTS.md) at the repository root. This folder is supplementary.

## Folder Index

| Document | Description |
| --- | --- |
| [upstream-files.md](upstream-files.md) | List and role classification of EstreUI.js upstream files. Use this to determine which files are framework and which are project-specific. |
| [adaptation-guide.md](adaptation-guide.md) | Mapping of EstreUI.js concepts (PID, Handle, Active Struct, etc.) to the files and patterns you should implement in your project. |
| [style-guide.md](style-guide.md) | Identifier substitution rules and tone guide for excerpting project code into EstreUI.js public documentation. |

## Workflow Summary

When project code changes occur, reflect relevant updates in the documents in this folder.

1. Check [upstream-files.md](upstream-files.md) to determine whether the changed file is upstream or project-specific.
2. If file structure or roles changed, update [upstream-files.md](upstream-files.md).
3. If new EstreUI.js usage patterns were added or changed, update [adaptation-guide.md](adaptation-guide.md).
4. If EstreUI.js public documentation needs updating, apply the substitution rules from [style-guide.md](style-guide.md) when editing `.agent/estreui/` documents.

## Update Policy

- Update [upstream-files.md](upstream-files.md) when new upstream files are added to EstreUI.js.
- Add to [adaptation-guide.md](adaptation-guide.md) when new adaptation patterns are discovered.
- Update [style-guide.md](style-guide.md) when new substitution rules are needed.
