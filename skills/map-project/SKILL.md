---
name: map-project
description: Map a React, Next.js, Angular, React Native, Expo, ASP.NET, ASPX/Web Forms, SwiftUI, UIKit, native Android (Kotlin/Java, Jetpack Compose, Android Views/XML), or Flutter (Dart, Material/Cupertino) codebase for accessibility auditing. Use when the user says /mapaccessibility, map accessibility, project map, component/view map, iOS accessibility map, SwiftUI accessibility map, UIKit accessibility map, React Native accessibility map, Expo accessibility map, Angular accessibility map, Angular CDK accessibility map, Android accessibility map, Jetpack Compose accessibility map, Kotlin accessibility map, Flutter accessibility map, Dart accessibility map, "binclusive projemi haritala", "projeyi erişilebilirlik için haritala", "accessibility için map çıkar", "proje haritası çıkar", or wants to inventory routes, screens, views, shared components, controls, dependencies, localization, and inline UI before an audit/test.
---

# Map Project

Create an evidence-based project map for a React/Next.js web, Angular web, React Native/Expo, ASP.NET/ASPX, iOS SwiftUI/UIKit, native Android (Jetpack Compose / Android Views/XML), or Flutter (Dart, Material/Cupertino) app. This skill observes and documents only. It never edits source code.

## Start Here

1. Inspect the target repo for existing `Binclusive-auditing/`.
2. If map files already exist, summarize the latest 3 files briefly: filename, date, scope if visible, and ask whether to reuse one or create a new map.
3. Run the read-only inspector when Node is available:
   `node <skill-dir>/scripts/inspect-project.mjs <project-root>`.
   Use its JSON as discovery input, not as a final audit or proof of accessibility.
4. Ask scope questions before scanning unless the user already gave exact scope:
   - Whole project/app, selected routes/screens, selected components/controls, a folder path, or free-form target list?
   - Should localization/hardcoded strings be included? Default: yes.
   - Is this React/Next.js web, Angular web, React Native/Expo, ASP.NET MVC/Razor, ASPX/Web Forms, SwiftUI, UIKit, native Android (Jetpack Compose / Android Views/XML), Flutter (Dart, Material/Cupertino), or mixed mobile/web? If not, state which references are available and continue only if the user wants a best-effort map.
5. Create `Binclusive-auditing/` in the project root if missing.
6. Write one map file named `<project-name>_<YYYY-MM-DD>_project-map.md` inside `Binclusive-auditing/`.

## CI / Diff Mode

Triggered by a `--diff` or `--ci` argument or the `BINCLUSIVE_CI` environment variable. Used in CI/CD to keep a committed baseline map current without a full re-map, non-interactively.

1. Run `node <audit-skill-dir>/scripts/git-diff-scope.mjs <project-root>` (the diff helper ships with `audit-accessibility`) to get `changedFiles` and the existing `baselineMap` path.
2. **Ask no scope questions.** Scope = the changed files only.
3. If a baseline map exists, map the changed files and merge their entries (paths, type, native element/control, usages) into it in place; preserve unrelated sections. If none exists, this step is optional — `audit-accessibility` can run diff-only without a committed map.
4. Do not re-scan or re-map the whole project in this mode. Record in the map which entries were refreshed from the diff and the base ref used.

This step is optional for CI: it only improves cross-file usage context for the audit. The audit can run without it (diff-only mode).

## Coverage — enumerate every in-scope file, never sample silently

On large codebases the failure mode is silent under-coverage: the map omits files that
were never enumerated, and because the omission is invisible, a downstream audit treats
an un-mapped file as a clean one. Guard against it with an explicit, reconciled ledger.

1. **Enumerate the full in-scope file set up front.** Before mapping, list every source
   file the agreed scope covers — don't discover files ad hoc while writing entries. The
   inspector (`scripts/inspect-project.mjs`) already walks the tree and reports per-type
   **counts** (`swiftFileCount`, `kotlinFileCount`, `dartFileCount`, `componentFileCount`,
   etc.); use those counts as the coverage **denominator**. When the inspector is
   unavailable or you need the actual paths, enumerate them directly, e.g.
   `find <scope> \( -name '*.swift' -o -name '*.kt' -o -name '*.dart' -o -name '*.tsx' \) -not -path '*/node_modules/*'`
   for the extensions that match the detected platform.
2. **Reconcile mapped-vs-total and record the ledger.** Keep a running tally of files
   **mapped / partially-mapped / not-yet-mapped** and reconcile it against the enumerated
   total before writing the map. If the numbers don't match, the difference is an
   un-mapped set you must either map or list explicitly — never let it vanish.
3. **Surface every gap explicitly.** Any in-scope file left un-mapped (size, time,
   ambiguity, or a deliberate scope cut) goes in the map's coverage notes as a named
   gap with a count, so the audit inherits an honest boundary instead of a false-complete
   map. "Mapped 180 of 1203 in-scope files; remaining 1023 not yet mapped (listed below)"
   is correct; silently mapping 180 and presenting the map as whole is the bug.

This is a hard requirement on **every** run, not just CI/Diff Mode — the diff path already
scopes itself, but a full map over a huge tree is exactly where the silent skip happens.

See `references/coverage-ledger-example.md` for a real ledger from a 101-file iOS run
(`101 / 101` reconciled against an enumerated denominator, with the genuine out-of-scope
boundary named) — what an honest map coverage section looks like in practice.

## Source Of Truth

Read the platform-specific mapping reference after scope is clear:

- React/Next.js web: `references/mapper-web.md`
- Angular web: `references/mapper-angular.md`
- React Native/Expo: `references/mapper-react-native.md`
- ASP.NET MVC/Razor or ASPX/Web Forms: `references/mapper-aspnet.md`
- iOS SwiftUI/UIKit: `references/mapper-ios-swift.md`
- Native Android (Jetpack Compose / Android Views/XML): `references/mapper-android.md`
- Flutter (Dart, Material/Cupertino/Widgets): `references/mapper-flutter.md`

Keep these references out of context until after the user confirms mapping scope. For mixed projects, read every reference that matches the selected scope and keep platform sections separate in the map.

Native Android (Kotlin/Java) projects are mapped with `references/mapper-android.md`. React Native/Expo apps that happen to ship an `android/` folder are mapped with `references/mapper-react-native.md`, not the native Android reference — pick the reference by the primary UI stack (Compose/Views vs React Native), and for genuinely mixed native+RN apps read both and keep the sections separate.

Flutter (Dart) projects — a `pubspec.yaml` with a `flutter` SDK dependency and a `lib/` Dart tree — are mapped with `references/mapper-flutter.md`. A Flutter app ships `android/` and `ios/` host folders, so the inspector may also report native-Android/iOS signals; map the Flutter UI with `references/mapper-flutter.md` and use `mapper-android.md` / `mapper-ios-swift.md` only for genuinely native Kotlin/Java or Swift UI.

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
- platform feature notes such as Dynamic Type/font scaling, VoiceOver/TalkBack, Switch Control, Voice Control, reduced motion, contrast, touch targets, and generated/native UI when relevant
- a **coverage ledger**: total in-scope files enumerated, count mapped, count partially-mapped, and the explicit list (or count + pattern) of any in-scope files left un-mapped — reconciled per the "Coverage" section
- coverage notes, blind spots, and runtime-verification needs
- instructions for `audit-accessibility`

## Rules

- User-provided audit documents may be read as inspiration only; do not copy customer data into skill resources.
- Do not modify source code.
- Do not install dependencies.
- Do not invent files, routes, screens, components, controls, or line numbers.
- If framework/platform/routing/navigation is ambiguous, ask instead of guessing.
- If a target cannot be verified statically, mark it `needs runtime verification`.
- If the project is huge, never silently sample a subset and present it as the whole map. Enumerate the full in-scope file set, map what you can, and record every un-mapped file as an explicit coverage gap with a count (see "Coverage"). An honest "mapped X of Y, Z remaining" beats a map that looks complete but isn't.