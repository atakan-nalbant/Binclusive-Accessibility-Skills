---
name: audit-accessibility
description: Audit React, Next.js, Angular, React Native, Expo, ASP.NET, ASPX/Web Forms, SwiftUI, UIKit, native Android (Kotlin/Java, Jetpack Compose, Android Views/XML), Flutter (Dart, Material/Cupertino), or Python accessibility from a prior Binclusive project map. Use when the user says /auditaccessibility, audit accessibility, run accessibility audit, accessibility test, iOS accessibility audit, SwiftUI accessibility audit, UIKit accessibility audit, React Native accessibility audit, Expo accessibility audit, Angular accessibility audit, Angular CDK accessibility audit, Android accessibility audit, Jetpack Compose accessibility audit, Kotlin accessibility audit, Flutter accessibility audit, Dart accessibility audit, Python accessibility audit, Django accessibility audit, "binclusive projemi test et", "erisilebilirlik testi yap", "erisilebilirlik todo cikar", "accessibility todo cikar", or wants an accessibility TODO report from mapped routes, views, screens, components, controls, or paths. Also use to audit a single target only, e.g. "/auditaccessibility LoginButton", "audit only the X component", "sadece X componentini test et", or when a component/screen/folder name is passed as an argument - narrow the audit to that target from the existing map.
---

# Audit Accessibility

Audit a previously mapped React/Next.js web, Angular web, React Native/Expo, ASP.NET/ASPX, iOS SwiftUI/UIKit, native Android (Jetpack Compose / Android Views/XML), Flutter (Dart, Material/Cupertino), or Python (desktop GUI, CLI/TUI, web backend, or docs) scope and write an actionable accessibility TODO report. This skill observes and documents only. It never edits source code.

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
   - For Angular web, read:
     - `references/auditor-web-a11y.md`
     - `references/angular.md`
     - `references/patterns/angular-patterns.md` when available
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
   - For native Android (Jetpack Compose / Android Views/XML), read:
     - `references/android.md`
     - `references/patterns/android-patterns.md` when available
   - For Flutter (Dart, Material/Cupertino/Widgets), read:
     - `references/flutter.md`
     - `references/patterns/flutter-patterns.md` when available
   - For Python, read:
     - `references/python.md` (classify the surface first: desktop GUI, CLI/TUI, web backend, generated docs, or pure library)
     - `references/auditor-web-a11y.md` as well when the Python app renders HTML (Django/Flask/Jinja templates)
6. For mixed-platform maps, keep findings grouped by platform/surface and do not apply web-only rules to native/mobile UI or mobile-only rules to web UI.
7. Determine focus scope before auditing (see "Focus Scope" below).
8. Audit only the scope listed in the map or the resolved narrowed focus scope, unless the user explicitly expands scope.
9. Write `Binclusive-auditing/accessibility-todo.md` and also archive a dated copy: `accessibility-todo_<YYYY-MM-DD>.md`.

## Coverage — read every in-scope file end to end

The audit's second silent-skip failure mode is *within* a file: a large source file is
read once through the default window (~1500–2000 lines) and everything past it goes
un-audited, while the report still presents the file as covered. An un-read region is an
unaudited region — treat it as a finding-bearing surface you have not yet looked at, not
as clean.

1. **Read each in-scope file to EOF.** For every file in the focus scope, read the whole
   file — not just the first window. When a file is larger than a single read, read it in
   **paged offset chunks** (continue from where the previous read stopped) until you reach
   the end. Never audit a file you have only partially read and never infer the unread
   remainder from the part you saw.
2. **Keep a read-coverage ledger.** Track each in-scope file as **fully-read /
   partially-read / unread**, mirroring the map's coverage ledger. Reconcile it against
   the scope the map handed you before writing the report: every file in scope should be
   fully-read, or else appear as an explicit gap.
3. **Carry every gap into the report.** Any file or region you could not read in full —
   plus any blind spot the map already flagged — is surfaced in the audit summary as a
   named coverage gap, so "no findings here" is never confused with "not looked at here."

This applies to **every** run. CI/Diff Mode already narrows to changed line ranges; the
full-scope audit over a large mapped codebase is where the in-file skip bites.

See `references/read-coverage-ledger-example.md` for a real read-coverage ledger from a
101-file iOS run, including how a file larger than one read window is reported as
`Partially read` until it is paged through to EOF.

## Focus Scope

The map sets the outer boundary; within it the audit can run over everything mapped or narrow to one target.

1. **Use a named target when given.** If the user passed a component, screen/page, control, or folder path - as a `/auditaccessibility <target>` argument or in their request (e.g. "audit only the LoginButton") - audit only that target plus the usages the map records for it.
2. **Otherwise ask once:** "Audit the whole mapped scope, or narrow to a specific component, screen/page, or folder path?" Default to the whole mapped scope if the user does not specify. In CI / Diff Mode, do not ask; use the diff scope.
3. **Resolve the target against the map. Do not invent it.** If the named target is not in the selected map, list the closest mapped entries and ask the user to pick one, or to run `map-project` for that target first. Never silently fall back to auditing the whole project when a narrow target was requested.
4. **Narrowing is always allowed; expanding is not.** You may scope down to any subset of the mapped areas freely. Only audit beyond the map with explicit user approval.
5. **Record it.** Put the exact focus scope in the TODO header `Scope audited` field, and note when it was narrowed from a broader map (e.g. `LoginButton (narrowed from full project map)`). Keep stable `TASK-00x` ids scoped to this run.

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

The report header must also carry a **read-coverage ledger**: count of in-scope files
fully-read vs partially-read vs unread, and the explicit list of any partially-read or
unread files (see "Coverage"). A report with no coverage ledger reads as "everything was
audited" — which is the exact false-complete signal this guards against.

## Audit Order

For web scopes:

1. Inline interactive UI in pages/views.
2. Shared interactive components: Button, Link, Input, Select, Dialog, Drawer, Popover, Menu, Tabs, Accordion, Carousel, Toast.
3. Shared display components: Image, Icon, Avatar, Table, Chart, Skeleton, Loading, Badge.
4. Page-level patterns: landmarks, headings, skip link, route focus, page title, language/locale, reduced motion, zoom/reflow.

For Angular web scopes (the shared web rules apply; these are the Angular-specific layers):

1. Inline interactive UI in templates (`.component.html` / inline `template`): `(click)`/keyboard handlers on non-semantic elements, attribute bindings, and host bindings.
2. Attribute-binding correctness: `[attr.aria-*]`/`[attr.role]` vs bare `[aria-*]`/`[role]` property bindings that never reach the DOM; conditional ARIA state that must track real open/selected/checked state.
3. Shared interactive components: Button, Link (`routerLink`/`<a href>`), Input/`FormControl`, Select/Autocomplete, Checkbox, Radio, Switch/Toggle, Slider, Dialog/`MatDialog`/CDK overlay, Drawer, Menu, Tabs, Accordion/Expansion, Stepper, Carousel, Tooltip, custom directive-driven control.
4. Shared display components: Image (`<img alt>`/`[alt]`), Icon (`mat-icon`/SVG), Avatar, Table/`mat-table`/`cdk-table`, Chart, `cdk-virtual-scroll` list, Skeleton, Loading, Badge, Snackbar/Toast.
5. Angular CDK a11y and focus management: `cdkTrapFocus`/`cdkFocusInitial`/focus restore in dialogs and overlays, `cdkAriaLive`/`LiveAnnouncer` for status, `FocusMonitor` for visible keyboard focus, and that `A11yModule`/CDK a11y directives are actually imported where used.
6. Structural directives and routing: `*ngIf`/`@if`, `*ngFor`/`@for`, `*ngSwitch`/`@switch`, `[hidden]`, `@defer`, and router behavior — per-route page `title`/`TitleStrategy`, route-change focus reset/announcement, skip link, `<main>` landmark, `<html lang>`/`dir`.

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

For native Android (Jetpack Compose / Android Views/XML) scopes:

1. Inline interactive UI in mapped composables, Activities/Fragments, custom views, `RecyclerView` rows, and XML layouts.
2. Shared interactive controls: Button, IconButton, clickable text/Link, TextField/`EditText`, Checkbox, RadioButton, Switch, Slider/`SeekBar`, Stepper, Dialog/`BottomSheet`, Menu, Tab, Chip, custom gesture targets, custom `View`s.
3. Shared display components: Image, Icon/vector drawable, Avatar, List/`LazyColumn`/`RecyclerView`, Grid, Chart, Map, Skeleton, Loading/Progress, Badge, Snackbar/Toast.
4. Screen-level patterns: app bar/toolbar titles, headings, focus/reading order, dialog/sheet presentation/dismissal, errors, status updates, localization, font scaling, animations, RTL, contrast, touch targets (48dp).
5. Platform assistive technology behavior: TalkBack, Switch Access, Voice Access, Select to Speak, keyboard/D-pad focus, font scale, high-contrast/bold text, Color correction/inversion, Remove animations.

For Flutter (Dart, Material/Cupertino/Widgets) scopes:

1. Inline interactive UI in mapped screen/page widgets, custom widgets, `ListView`/`GridView` items, and dialogs/sheets.
2. Shared interactive widgets: Button (`ElevatedButton`/`TextButton`/`OutlinedButton`/`FilledButton`), IconButton/FAB, tappable text/Link, TextField/`TextFormField`, Checkbox, Radio, Switch, Slider, Stepper, Dropdown, Dialog/BottomSheet, Menu, Tab, Chip, custom gesture targets (`GestureDetector`/`InkWell`).
3. Shared display widgets: Image/`SvgPicture`, Icon, `CircleAvatar`, List/`ListView`/`GridView`, Chart, Map, Skeleton/Shimmer, Loading/Progress, Badge, SnackBar/Tooltip.
4. Screen-level patterns: `AppBar`/`SliverAppBar` titles, headings (`Semantics(header:)`), focus/reading order (`sortKey`/`FocusTraversal`), dialog/sheet presentation/dismissal (`BlockSemantics`), errors, status updates (`liveRegion`), localization, text scaling, animations, RTL, contrast, touch targets (48x48).
5. Platform assistive technology behavior: TalkBack (Android), VoiceOver (iOS), Switch Access/Switch Control, Voice Access/Voice Control, keyboard/focus traversal, text scale, bold/high-contrast text, Reduce Motion, and (when in scope) Flutter web/desktop semantics.

## Rules

- User-provided audit documents may be read as inspiration only; do not copy customer data into skill resources.
- Do not modify source code.
- Do not include accessible elements as findings.
- Do not guess contrast, screen-reader/VoiceOver/TalkBack output, focus trap/focus order behavior, touch target size, Dynamic Type/font-scale layout, or runtime state. Mark these `RUNTIME-CHECK`.
- Prefer native HTML fixes for web (including Angular: native elements and `[attr.aria-*]` bindings, with Angular CDK a11y primitives — `cdkTrapFocus`, `cdkAriaLive`, `LiveAnnouncer` — and Angular Material before hand-rolled widgets), React Native primitives/accessibility props for React Native, native SwiftUI/UIKit controls/APIs for iOS, native Compose/Material semantics or Android View accessibility APIs (`contentDescription`, `Modifier.semantics`, `labelFor`, `AccessibilityDelegate`) for native Android, and native Material/Cupertino widgets or Flutter semantics (`Semantics`, `semanticLabel`, `MergeSemantics`/`ExcludeSemantics`, `tooltip`) for Flutter.
- Do not claim compliance; report verified findings and residual risk only.
- If the map has blind spots, carry them into the audit summary.
- Never present a partially-read file as audited. Read every in-scope file to EOF (large files in paged offset chunks), and record any file or region left unread as an explicit coverage gap in the report (see "Coverage").
