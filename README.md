# Binclusive Accessibility Skills

Reusable Agent Skills for mapping, auditing, and fixing accessibility issues in React, Next.js, Angular, React Native, Expo, ASP.NET, ASPX/Web Forms, Shopify themes, SwiftUI, UIKit, native Android (Kotlin/Java, Jetpack Compose, Android Views/XML), and Flutter (Dart, Material/Cupertino) projects.

This repository keeps one canonical skill source and uses small adapters for Codex, Claude Code, GitHub Copilot, and Cursor.


## About Binclusive

Binclusive develops technologies that help organizations make their applications and content accessible. This skill package was created from Binclusive's 3 years of sector experience and 15 years of accessibility domain expertise to help engineering teams identify accessibility issues accurately in a codebase and develop correct, maintainable fixes.

Codebase auditing is only one part of a complete accessibility process. Accessibility should also be validated with end-user testing after implementation. Binclusive provides disabled-user testing services and production-environment accessibility testing for organizations that need deeper validation. Learn more at https://binclusive.io.

## Skills
- `map-project`: inventory routes, screens, views, shared UI, dependencies, localization, and inline UI before an accessibility audit.
- `audit-accessibility`: audit a mapped scope and write `Binclusive-auditing/accessibility-todo.md` without editing source code.
- `shopify-theme-audit`: audit Shopify theme Liquid, JSON templates, sections, snippets, assets, config, and locales without editing source code.
- `fix-accessibility`: remediate selected TODO tasks with severity/risk controls and verification notes.

Canonical skill files live in `skills/<skill-name>/SKILL.md`.

## Supported Audit Targets

- React and Next.js web applications.
- Angular (2+) web applications, including standalone-components and NgModule apps, the Angular router, Angular CDK a11y (`LiveAnnouncer`, `cdkAriaLive`, `cdkTrapFocus`/`cdkFocusInitial`), and Angular Material.
- Shopify Online Store themes, including Dawn-derived and custom Liquid/JSON theme structures.
- React Native and Expo mobile applications.
- ASP.NET MVC/Razor, Razor Pages, and ASPX/Web Forms applications.
- iOS apps built with SwiftUI, UIKit, or mixed SwiftUI/UIKit architecture.
- Native Android apps (Kotlin/Java) built with Jetpack Compose, the Android View system (XML layouts), or a mixed Compose/View architecture.
- Flutter apps (Dart) built with Material, Cupertino, or the base Widgets library, audited against the Flutter `Semantics` model.

React Native Android behavior is covered by the React Native/Expo references; the native Android references are for Kotlin/Java + Compose/View apps. For a project that ships both, map by the primary UI stack and keep platform sections separate.

Flutter apps are mapped and audited with the Flutter references (Dart + Material/Cupertino). A Flutter app ships `android/` and `ios/` host folders, so the inspector may also report native signals — map the Flutter UI with the Flutter references and use the native Android/iOS references only for genuinely native Kotlin/Java or Swift UI.

## Install

### Windows PowerShell

```powershell
scripts/install.ps1 -Target all
```

### macOS/Linux

```bash
chmod +x scripts/install.sh
scripts/install.sh --target all
```

Targets:

- `codex`: copies skills to `$HOME/.agents/skills`.
- `claude`: copies skills to `$HOME/.claude/skills`.
- `copilot`: installs Copilot instruction templates into a target project when `--repo` / `-Repo` is provided.
- `cursor`: installs the Cursor project-rules file into a target project when `--repo` / `-Repo` is provided.
- `all`: installs Codex and Claude skills, and prints Copilot and Cursor template guidance unless a repo is provided.

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

## Cursor Adapter

Install the Cursor project rules into a target project:

```powershell
scripts/install.ps1 -Target cursor -Repo C:\path\to\project
```

```bash
scripts/install.sh --target cursor --repo /path/to/project
```

This writes or updates:

- `.cursor/rules/binclusive-accessibility.mdc`

The rules file is `alwaysApply: true`, so Cursor loads the Binclusive accessibility workflow as project rules that point back to the canonical `skills/<skill-name>/SKILL.md` sources. Shard Mode fan-out is capability-detected: when the Cursor runtime can dispatch parallel sub-tasks/agents the audit fans out one worker per shard, otherwise it runs single-agent — the read-coverage ledger keeps either path honest.

## Usage

### Codex

Invoke skills explicitly with:

```text
$map-project
$audit-accessibility
$shopify-theme-audit
$fix-accessibility
```

### Claude Code

Invoke skills explicitly with:

```text
/map-project
/audit-accessibility
/shopify-theme-audit
/fix-accessibility
```

### Copilot

After installing the adapter into a project, ask Copilot to follow the Binclusive accessibility workflow. The intended order is:

1. Map the project.
2. Audit the mapped scope.
3. Fix only selected audit tasks.

## Audit Reliability: Coverage & Shard Mode

The `audit-accessibility` skill has two mechanisms that keep large audits honest and complete: a read-coverage ledger that makes skipped files visible, and an optional Shard Mode that fans the audit out across subagents.

### Read-coverage ledger

The audit reads **every in-scope file end to end** — when a file is larger than a single read, it is read in paged offset chunks until it reaches EOF — and never audits a file it has only partially read. It tracks each in-scope file as **fully-read / partially-read / unread** in a read-coverage ledger carried in the report header, and reconciles that ledger against the scope the map handed it. Any file or region it could not read in full is surfaced as an explicit **coverage gap**, so "no findings here" is never confused with "not looked at here." This applies to **every** audit run.

### Shard Mode — subagent fan-out for large maps

For large maps, the audit can shard across subagents — one per slice of the map — so each slice is audited to completion rather than a single agent running low on attention and disclosing a long unread-gap list. Fan-out is an **optimization layered on top of the single-agent audit, never a replacement for it**: because the read-coverage ledger keeps reporting honest in either mode, opting out of fan-out degrades *throughput*, not *correctness*.

Shard Mode has three states:

- **Auto (default)** — shard only when the full-scope worklist is large enough to benefit: more than ~25 in-scope files, or more than ~6 shard groups (top-level mapped folders / route-groups). Below that, run single-agent, since fan-out on a small map is pure overhead.
- **Force on (`--shard`)** — fan out regardless of size, as long as the harness is capable (or ask to "fan out" / "shard" the audit).
- **Force off (`--no-shard`)** — always run single-agent, for cost control, reproducibility, or an unsupported harness (or ask to keep it single-agent).

**Harness-capability fallback.** Subagent fan-out requires a harness that can spawn parallel subagents (the Claude Code `Task` tool). The Copilot, Codex, and OpenAI adapters cannot. On any harness without that capability, the audit **runs single-agent regardless of mode — including `--shard` — and produces the same report shape, with no error**; if `--shard` was requested it notes the fallback in the audit summary rather than failing the run (see [#21](https://github.com/Binclusive/Binclusive-Accessibility-Skills/issues/21)). Narrowed / single-target scopes and CI / Diff Mode never shard either — that scope is already small.

See [`skills/audit-accessibility/SKILL.md`](skills/audit-accessibility/SKILL.md) for the full Coverage and Shard Mode rules, including the deterministic merge and the 100% worklist-coverage assertion.

## CI/CD Accessibility Gate

The audit skill has a non-interactive **diff mode** for pull-request checks: it inspects git history first and audits only what the change touched, then fails the build on serious findings. No source code is modified in CI.

```
git-diff-scope.mjs   ->  audit (diff mode)   ->  gate.mjs
   changed files          write TODO for the      exit non-zero on open
   + line ranges          changed scope only       Critical/Serious findings
```

- **Scope** — `node skills/audit-accessibility/scripts/git-diff-scope.mjs .` returns the auditable files changed between the base ref and HEAD, with per-file changed line ranges, and points at any committed baseline map. Default scope is committed history (`base...HEAD`); add `--include-working` for local pre-commit runs that include uncommitted/untracked edits.
- **Audit** — run the audit skill in diff mode (`/auditaccessibility --diff`, or set `BINCLUSIVE_CI=1`); it scopes to the changed targets and writes `Binclusive-auditing/accessibility-todo.md`.
- **Gate** — `node skills/audit-accessibility/scripts/gate.mjs Binclusive-auditing/accessibility-todo.md --max-severity=serious` exits non-zero when any open finding is at/above the threshold, which fails the PR check.

Key settings: `BINCLUSIVE_BASE_REF` (diff base, defaults to `GITHUB_BASE_REF` then `origin/main`), `BINCLUSIVE_CI` (forces non-interactive mode), and `--max-severity` (`critical|serious|moderate|minor`). The `fix-accessibility` skill is intentionally **not** part of the gate — remediation stays a human-reviewed step.

See [`skills/audit-accessibility/references/ci-cd.md`](skills/audit-accessibility/references/ci-cd.md) for the full pipeline, a ready-to-use GitHub Actions workflow, and the committed-vs-working-tree scope rules.

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
  cursor/
scripts/
  install.ps1
  install.sh
```
