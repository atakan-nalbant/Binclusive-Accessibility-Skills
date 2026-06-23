---
name: audit-accessibility
description: Audit React, Next.js, React Native, Expo, ASP.NET, ASPX/Web Forms, SwiftUI, UIKit, or Python accessibility from a prior Binclusive project map. Use when the user says /auditaccessibility, audit accessibility, run accessibility audit, accessibility test, iOS accessibility audit, SwiftUI accessibility audit, UIKit accessibility audit, React Native accessibility audit, Expo accessibility audit, Python accessibility audit, Django accessibility audit, "binclusive projemi test et", "erişilebilirlik testi yap", "erişilebilirlik todo çıkar", "accessibility todo çıkar", or wants an accessibility TODO report from mapped routes, views, screens, components, controls, or paths.
---

# Audit Accessibility

Audit a previously mapped React/Next.js web, React Native/Expo, ASP.NET/ASPX, iOS SwiftUI/UIKit, or Python (desktop GUI, CLI/TUI, web backend, or docs) scope and write an actionable accessibility TODO report. This skill observes and documents only. It never edits source code.

## Start Here

1. Locate `Binclusive-auditing/` in the project root.
2. If no map file exists, stop and ask the user to run `map-project` or `/mapaccessibility` first.
3. If multiple map files exist, summarize them and ask which map to audit unless the user named one.
4. Read the selected `*_project-map.md` end to end.
5. Detect framework/platform/language from the map. Read only the references that match the mapped scope:
   - For React/Next.js web, read:
     - `references/auditor-web-a11y.md`
     - `references/react-nextjs.md`
     - `references/patterns/react-nextjs-patterns.md` when available
   - For React Native/Expo, read:
     - `references/react-native.md`
     - `references/patterns/react-native-patterns.md` when available
   - For ASP.NET MVC/Razor or ASPX/Web Forms, read:
     - `references/auditor-web-a11y.md`
     - `references/aspnet-aspx.md`
     - `references/patterns/aspnet-aspx-patterns.md` when available
   - For iOS SwiftUI/UIKit, read:
     - `references/ios-swift.md`
     - `references/patterns/ios-swift-patterns.md` when available
   - For Python, read:
     - `references/python.md` (classify the surface first: desktop GUI, CLI/TUI, web backend, generated docs, or pure library)
     - `references/auditor-web-a11y.md` as well when the Python app renders HTML (Django/Flask/Jinja templates)
6. For mixed-platform maps, keep findings grouped by platform/surface and do not apply web-only rules to native/mobile UI or mobile-only rules to web UI.
7. Audit only the scope listed in the map, unless the user explicitly expands scope.
8. Write `Binclusive-auditing/accessibility-todo.md` and also archive a dated copy: `accessibility-todo_<YYYY-MM-DD>.md`.

## CI / Diff Mode

Use this mode for CI/CD pull-request checks. It is triggered by a `--diff` or `--ci` argument, or when the `BINCLUSIVE_CI` environment variable is set. In this mode the audit is **non-interactive, diff-scoped, and gated** — it asks no questions and audits only what the change touched.

1. **Compute the change scope.** Run `node <skill-dir>/scripts/git-diff-scope.mjs <project-root>`. It returns `changedFiles` (auditable source files changed between the base ref and HEAD), `changedLineRanges` per file, `mode`, and `baselineMap`. The base ref comes from `BINCLUSIVE_BASE_REF`, else `GITHUB_BASE_REF`, else `origin/main`. By default the scope is **committed history only** (`base...HEAD`); pass `--include-working` (or `BINCLUSIVE_INCLUDE_WORKING=1`) to also audit uncommitted/untracked local edits for pre-commit runs. A file with `status: "U"` (untracked) or empty `changedLineRanges` is audited whole. Always read the `notes` — if it reports uncommitted files excluded, surface that rather than reporting an empty audit as "all clear."
2. **If `changedFiles` is empty,** write no findings, state "no auditable changes in this diff," and stop. CI passes.
3. **Resolve usage context (both models supported):**
   - If `baselineMap` is set, read it and pull the known usages of each changed shared component into scope (a changed `Button` audits its consumer pages too).
   - If `baselineMap` is null (diff-only), search for importers/consumers of each changed file to recover usage context. Record this as a coverage limitation.
4. **Audit only the changed targets,** and prioritize the `changedLineRanges` — do not raise findings on unchanged lines of a touched file unless the change made them newly reachable. Apply the normal Audit Order and reference rules to that narrowed scope.
5. **Never ask scope questions, never expand beyond the diff,** and never fall back to a whole-project audit in this mode.
6. **Write the report as usual** (`accessibility-todo.md` + dated copy), with `Scope audited: diff vs <base ref>` and the changed file list in the header.
7. **Do not edit source code.** CI mode is audit-and-gate only; remediation is a separate human-reviewed step.

The build pass/fail is decided by the gate, run after this skill: `node <skill-dir>/scripts/gate.mjs Binclusive-auditing/accessibility-todo.md --max-severity=serious` exits non-zero when any open finding is at or above the threshold. See `references/ci-cd.md` for the full pipeline wiring.

## Required Output

Use the TODO format in `references/accessibility-todo-format.md`. Every finding must include:

- stable task id (`TASK-001`, etc.)
- component/page/screen/control, file path, usage context
- severity: Critical, Serious, Moderate, Minor
- fix type: `SAFE`, `VISUAL-IMPACT`, `FUNCTIONAL-RISK`, or `RUNTIME-CHECK`
- exact code snippet or enough verified code/storyboard/xib context
- problem, WCAG/APG/platform impact, correct solution, verification steps
- status: `TODO`

## Audit Order

For web scopes:

1. Inline interactive UI in pages/views.
2. Shared interactive components: Button, Link, Input, Select, Dialog, Drawer, Popover, Menu, Tabs, Accordion, Carousel, Toast.
3. Shared display components: Image, Icon, Avatar, Table, Chart, Skeleton, Loading, Badge.
4. Page-level patterns: landmarks, headings, skip link, route focus, page title, language/locale, reduced motion, zoom/reflow.

For React Native scopes:

1. Inline interactive UI in screens, route files, custom headers, list items, forms, modals, and native-wrapper components.
2. Shared interactive controls: Pressable/Button, Touchable, Link, TextInput, Select/Picker, Checkbox, Radio, Switch, Slider, Dialog/Modal, BottomSheet, Menu, Tabs, custom gesture targets.
3. Shared display components: Text, Image/Icon, Avatar, List/FlatList/SectionList, Card/Row, Chart, Map, Skeleton, Loading, Badge, Toast/Banner, WebView, Media controls.
4. Screen-level patterns: screen titles, focus/reading order, modal presentation/dismissal, errors, status updates, localization, font scaling, Reduce Motion, RTL, contrast, touch targets.
5. Platform assistive technology behavior: VoiceOver/TalkBack, Switch Control, Voice Control, keyboard/accessibility focus, font scale/Dynamic Type, Button Shapes, Differentiate Without Color, Increase Contrast.

For iOS SwiftUI/UIKit scopes:

1. Inline interactive UI in SwiftUI views, UIKit controllers, cells, and storyboard/xib scenes.
2. Shared interactive controls: Button, NavigationLink, TextField, Picker, Toggle, Slider, Stepper, Sheet/Dialog, Menu, Tab, custom gesture targets, custom UIControls.
3. Shared display components: Image, SF Symbol/Icon, Avatar, List, Table, Collection/Grid, Chart, Map, Skeleton, Loading, Badge, Toast/Banner.
4. Screen-level patterns: navigation titles, headings, focus/reading order, modal presentation/dismissal, errors, status updates, localization, Dynamic Type, Reduce Motion, RTL, contrast, touch targets.
5. Platform assistive technology behavior: VoiceOver, Switch Control, Voice Control, Full Keyboard Access, Dynamic Type, Button Shapes, Differentiate Without Color, Increase Contrast.

## Rules

- User-provided audit documents may be read as inspiration only; do not copy customer data into skill resources.
- Do not modify source code.
- Do not include accessible elements as findings.
- Do not guess contrast, screen-reader/VoiceOver/TalkBack output, focus trap/focus order behavior, touch target size, Dynamic Type/font-scale layout, or runtime state. Mark these `RUNTIME-CHECK`.
- Prefer native HTML fixes for web, React Native primitives/accessibility props for React Native, and native SwiftUI/UIKit controls/APIs for iOS.
- Do not claim compliance; report verified findings and residual risk only.
- If the map has blind spots, carry them into the audit summary.