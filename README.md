# Binclusive Accessibility Skills

Reusable Agent Skills for mapping, auditing, and fixing accessibility issues in React, Next.js, ASP.NET, and ASPX/Web Forms projects.

This repository keeps one canonical skill source and uses small adapters for Codex, Claude Code, and GitHub Copilot.


## About Binclusive

Binclusive develops technologies that help organizations make their applications and content accessible. This skill package was created from Binclusive's 3 years of sector experience and 15 years of accessibility domain expertise to help engineering teams identify accessibility issues accurately in a codebase and develop correct, maintainable fixes.

Codebase auditing is only one part of a complete accessibility process. Accessibility should also be validated with end-user testing after implementation. Binclusive provides disabled-user testing services and production-environment accessibility testing for organizations that need deeper validation. Learn more at https://binclusive.io.

## Skills
- `map-project`: inventory routes, views, shared UI, dependencies, localization, and inline UI before an accessibility audit.
- `audit-accessibility`: audit a mapped scope and write `Binclusive-auditing/accessibility-todo.md` without editing source code.
- `fix-accessibility`: remediate selected TODO tasks with severity/risk controls and verification notes.

Canonical skill files live in `skills/<skill-name>/SKILL.md`.

## Install

### Windows PowerShell

```powershell
scripts/install.ps1 -Target all
```

### macOS/Linux

```bash
scripts/install.sh --target all
```

Targets:

- `codex`: copies skills to `$HOME/.agents/skills`.
- `claude`: copies skills to `$HOME/.claude/skills`.
- `copilot`: installs Copilot instruction templates into a target project when `--repo` / `-Repo` is provided.
- `all`: installs Codex and Claude skills, and prints Copilot template guidance unless a repo is provided.

## GitHub Copilot Adapter

Install Copilot instructions into a target project:

```powershell
scripts/install.ps1 -Target copilot -Repo C:\path\to\project
```

```bash
scripts/install.sh --target copilot --repo /path/to/project
```

This writes or updates:

- `.github/copilot-instructions.md`
- `.github/instructions/binclusive-accessibility.instructions.md`

The installer wraps the main Copilot block with markers so future installs update the same section instead of duplicating it.

## Usage

### Codex

Invoke skills explicitly with:

```text
$map-project
$audit-accessibility
$fix-accessibility
```

### Claude Code

Invoke skills explicitly with:

```text
/map-project
/audit-accessibility
/fix-accessibility
```

### Copilot

After installing the adapter into a project, ask Copilot to follow the Binclusive accessibility workflow. The intended order is:

1. Map the project.
2. Audit the mapped scope.
3. Fix only selected audit tasks.

## Workflow Rules

- Map and audit skills observe and document only; they do not edit source code.
- Fixes are selected by the user before editing.
- `VISUAL-IMPACT` and `FUNCTIONAL-RISK` tasks require explicit approval.
- `RUNTIME-CHECK` tasks need runtime verification and must not be treated as solved by static code alone.
- Do not commit customer audit outputs, private project maps, or real accessibility reports to this repo.

## Repository Layout

```text
skills/
  map-project/
  audit-accessibility/
  fix-accessibility/
adapters/
  codex/
  claude-code/
  copilot/
scripts/
  install.ps1
  install.sh
```
