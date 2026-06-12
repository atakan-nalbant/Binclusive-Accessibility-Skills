# Binclusive Accessibility Workflow

Use the canonical Agent Skills in this repository as the source of truth:

- `skills/map-project/SKILL.md` inventories React/Next.js or ASP.NET/ASPX routes, views, pages, controls, dependencies, localization, and inline UI for accessibility review.
- `skills/audit-accessibility/SKILL.md` audits only the mapped scope and writes actionable accessibility TODOs.
- `skills/fix-accessibility/SKILL.md` fixes selected TODO tasks with severity/risk controls and verification notes.

Follow the workflow in order unless the user explicitly narrows the task:

1. Map first: create or reuse `Binclusive-auditing/*_project-map.md`.
2. Audit second: create `Binclusive-auditing/accessibility-todo.md` from the selected map.
3. Fix last: remediate only user-selected task IDs, SAFE tasks, severities, components, pages, or paths.

Respect the fix policy from `skills/fix-accessibility/SKILL.md`:

- `SAFE` tasks may be applied after summarizing the intended change.
- `VISUAL-IMPACT` and `FUNCTIONAL-RISK` tasks require explicit user approval before editing.
- `RUNTIME-CHECK` tasks need runtime verification steps and must not be marked solved by static code alone.

Prefer semantic HTML before ARIA, preserve existing styling/API contracts unless approved, and never claim full compliance. Report verified findings, changed files, checks run, and residual risk.
