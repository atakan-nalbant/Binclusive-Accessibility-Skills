---
name: map-project
description: Map a React, Next.js, ASP.NET, or ASPX/Web Forms codebase for accessibility auditing. Use when the user says /mapaccessibility, map accessibility, project map, component/view map, "binclusive projemi haritala", "projeyi erişilebilirlik için haritala", "accessibility için map çıkar", "proje haritası çıkar", or wants to inventory routes, views, shared components, dependencies, localization, and inline UI before an audit/test.
---

# Map Project

Create an evidence-based project map for a React/Next.js or ASP.NET/ASPX app. This skill observes and documents only. It never edits source code.

## Start Here

1. Inspect the target repo for existing `Binclusive-auditing/`.
2. If map files already exist, summarize the latest 3 files briefly: filename, date, scope if visible, and ask whether to reuse one or create a new map.
3. Run the read-only inspector when Node is available:
   `node <skill-dir>/scripts/inspect-project.mjs <project-root>`.
   Use its JSON as discovery input, not as a final audit or proof of accessibility.
4. Ask scope questions before scanning unless the user already gave exact scope:
   - Whole project, selected views/routes, selected components, a folder path, or free-form target list?
   - Should localization/hardcoded strings be included? Default: yes.
   - Is this React/Next.js web, ASP.NET MVC/Razor, or ASPX/Web Forms? If not, state which web references are available and continue only if the user wants a best-effort map.
5. Create `Binclusive-auditing/` in the project root if missing.
6. Write one map file named `<project-name>_<YYYY-MM-DD>_project-map.md` inside `Binclusive-auditing/`.

## Source Of Truth

Read `references/mapper-web.md` for the detailed React/Web mapping workflow and output sections. For ASP.NET MVC/Razor or ASPX/Web Forms projects, also read `references/mapper-aspnet.md`. Keep these references out of context until after the user confirms mapping scope.

For Swift/iOS or Android/Kotlin projects, the inspector can identify platform signals, but this skill only has detailed web mapping rules. Report mobile detections as signal-only unless a mobile mapping reference has been added.

## Required Output

The map file must state:

- project name, date, mapper, scope, and exact mapped areas
- framework, routing model, language, rendering model, styling approach
- i18n/localization setup, locales, fallback locale, RTL evidence
- a11y/l10n relevant dependencies and known concerns
- pages/views/routes with file paths
- shared UI components with file paths, type, wrapper/native element, and known usages
- inline UI inventory per page/view
- hardcoded string and localization hotspots
- coverage notes, blind spots, and runtime-verification needs
- instructions for `audit-accessibility`

## Rules

- User-provided audit documents may be read as inspiration only; do not copy customer data into skill resources.

- Do not modify source code.
- Do not install dependencies.
- Do not invent files, routes, components, or line numbers.
- If framework/routing is ambiguous, ask instead of guessing.
- If a target cannot be verified statically, mark it `needs runtime verification`.
- If the project is huge, map the agreed scope first and record what was excluded.

