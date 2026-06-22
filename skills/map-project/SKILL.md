---
name: map-project
description: Map a React, Next.js, ASP.NET, ASPX/Web Forms, SwiftUI, or UIKit codebase for accessibility auditing. Use when the user says /mapaccessibility, map accessibility, project map, component/view map, iOS accessibility map, SwiftUI accessibility map, UIKit accessibility map, "binclusive projemi haritala", "projeyi erişilebilirlik için haritala", "accessibility için map çıkar", "proje haritası çıkar", or wants to inventory routes, screens, views, shared components, controls, dependencies, localization, and inline UI before an audit/test.
---

# Map Project

Create an evidence-based project map for a React/Next.js, ASP.NET/ASPX, or iOS SwiftUI/UIKit app. This skill observes and documents only. It never edits source code.

## Start Here

1. Inspect the target repo for existing `Binclusive-auditing/`.
2. If map files already exist, summarize the latest 3 files briefly: filename, date, scope if visible, and ask whether to reuse one or create a new map.
3. Run the read-only inspector when Node is available:
   `node <skill-dir>/scripts/inspect-project.mjs <project-root>`.
   Use its JSON as discovery input, not as a final audit or proof of accessibility.
4. Ask scope questions before scanning unless the user already gave exact scope:
   - Whole project/app, selected routes/screens, selected components/controls, a folder path, or free-form target list?
   - Should localization/hardcoded strings be included? Default: yes.
   - Is this React/Next.js web, ASP.NET MVC/Razor, ASPX/Web Forms, SwiftUI, UIKit, or mixed iOS? If not, state which references are available and continue only if the user wants a best-effort map.
5. Create `Binclusive-auditing/` in the project root if missing.
6. Write one map file named `<project-name>_<YYYY-MM-DD>_project-map.md` inside `Binclusive-auditing/`.

## CI / Diff Mode

Triggered by a `--diff` or `--ci` argument or the `BINCLUSIVE_CI` environment variable. Used in CI/CD to keep a committed baseline map current without a full re-map, non-interactively.

1. Run `node <audit-skill-dir>/scripts/git-diff-scope.mjs <project-root>` (the diff helper ships with `audit-accessibility`) to get `changedFiles` and the existing `baselineMap` path.
2. **Ask no scope questions.** Scope = the changed files only.
3. If a baseline map exists, map the changed files and merge their entries (paths, type, native element/control, usages) into it in place; preserve unrelated sections. If none exists, this step is optional — `audit-accessibility` can run diff-only without a committed map.
4. Do not re-scan or re-map the whole project in this mode. Record in the map which entries were refreshed from the diff and the base ref used.

This step is optional for CI: it only improves cross-file usage context for the audit. The audit can run without it (diff-only mode).

## Source Of Truth

Read the platform-specific mapping reference after scope is clear:

- React/Next.js web: `references/mapper-web.md`
- ASP.NET MVC/Razor or ASPX/Web Forms: `references/mapper-aspnet.md`
- iOS SwiftUI/UIKit: `references/mapper-ios-swift.md`

Keep these references out of context until after the user confirms mapping scope. For mixed projects, read every reference that matches the selected scope and keep platform sections separate in the map.

For Android/Kotlin projects, the inspector can identify platform signals, but this skill only has detailed web and iOS mapping rules. Report Android detections as signal-only unless an Android mapping reference has been added.

## Required Output

The map file must state:

- project/app name, date, mapper, scope, and exact mapped areas
- framework/platform, routing/navigation model, language, rendering/UI model, styling/design-system approach
- i18n/localization setup, locales, fallback locale, RTL/mirroring evidence
- a11y/l10n relevant dependencies and known concerns
- pages/views/routes or screens/flows with file paths
- shared UI components/controls with file paths, type, wrapper/native element or platform control, and known usages
- inline UI inventory per page/view/screen
- hardcoded string and localization hotspots
- platform feature notes such as Dynamic Type, VoiceOver, Switch Control, Voice Control, reduced motion, contrast, and generated UI when relevant
- coverage notes, blind spots, and runtime-verification needs
- instructions for `audit-accessibility`

## Rules

- User-provided audit documents may be read as inspiration only; do not copy customer data into skill resources.
- Do not modify source code.
- Do not install dependencies.
- Do not invent files, routes, screens, components, controls, or line numbers.
- If framework/platform/routing/navigation is ambiguous, ask instead of guessing.
- If a target cannot be verified statically, mark it `needs runtime verification`.
- If the project is huge, map the agreed scope first and record what was excluded.
