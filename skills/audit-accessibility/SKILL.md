---
name: audit-accessibility
description: Audit React, Next.js, ASP.NET, or ASPX/Web Forms accessibility from a prior Binclusive project map. Use when the user says /auditaccessibility, audit accessibility, run accessibility audit, accessibility test, "binclusive projemi test et", "erişilebilirlik testi yap", "erişilebilirlik todo çıkar", "accessibility todo çıkar", or wants an accessibility TODO report from mapped routes, views, components, or paths.
---

# Audit Accessibility

Audit a previously mapped React/Next.js or ASP.NET/ASPX scope and write an actionable accessibility TODO report. This skill observes and documents only. It never edits source code.

## Start Here

1. Locate `Binclusive-auditing/` in the project root.
2. If no map file exists, stop and ask the user to run `map-project` or `/mapaccessibility` first.
3. If multiple map files exist, summarize them and ask which map to audit unless the user named one.
4. Read the selected `*_project-map.md` end to end.
5. Detect framework/language from the map. Always read:
   - `references/auditor-web-a11y.md`
   For React/Next.js, also read:
   - `references/react-nextjs.md`
   - `references/patterns/react-nextjs-patterns.md` when available
   For ASP.NET MVC/Razor or ASPX/Web Forms, also read:
   - `references/aspnet-aspx.md`
   - `references/patterns/aspnet-aspx-patterns.md` when available
6. Audit only the scope listed in the map, unless the user explicitly expands scope.
7. Write `Binclusive-auditing/accessibility-todo.md` and also archive a dated copy: `accessibility-todo_<YYYY-MM-DD>.md`.

## Required Output

Use the TODO format in `references/accessibility-todo-format.md`. Every finding must include:

- stable task id (`TASK-001`, etc.)
- component/page, file path, usage context
- severity: Critical, Serious, Moderate, Minor
- fix type: `SAFE`, `VISUAL-IMPACT`, `FUNCTIONAL-RISK`, or `RUNTIME-CHECK`
- exact code snippet or enough verified code context
- problem, WCAG/APG/platform impact, correct solution, verification steps
- status: `TODO`

## Audit Order

1. Inline interactive UI in pages/views.
2. Shared interactive components: Button, Link, Input, Select, Dialog, Drawer, Popover, Menu, Tabs, Accordion, Carousel, Toast.
3. Shared display components: Image, Icon, Avatar, Table, Chart, Skeleton, Loading, Badge.
4. Page-level patterns: landmarks, headings, skip link, route focus, page title, language/locale, reduced motion, zoom/reflow.

## Rules

- User-provided audit documents may be read as inspiration only; do not copy customer data into skill resources.

- Do not modify source code.
- Do not include accessible elements as findings.
- Do not guess contrast, screen-reader output, focus trap behavior, or runtime state. Mark these `RUNTIME-CHECK`.
- Prefer native HTML fixes in recommended solutions.
- Do not claim compliance; report verified findings and residual risk only.
- If the map has blind spots, carry them into the audit summary.

