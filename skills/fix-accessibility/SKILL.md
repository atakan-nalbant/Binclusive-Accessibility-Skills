---
name: fix-accessibility
description: Fix accessibility tasks from Binclusive accessibility-todo.md with user-guided selection and verification. Use when the user says /fixaccessibility, fix accessibility, resolve accessibility TODOs, "erişilebilirlik sorunlarını düzelt", "accessibility todo'daki taskları düzelt", "TASK-001'i düzelt", "safe taskları düzelt", or wants to remediate selected TASK IDs from an audit report.
---

# Fix Accessibility

Resolve selected tasks from `Binclusive-auditing/accessibility-todo.md` through a controlled, user-guided remediation loop.

## Start Here

1. Locate `Binclusive-auditing/accessibility-todo.md`.
2. If missing, stop and ask the user to run `audit-accessibility` or `/auditaccessibility` first.
3. Parse the task list and summarize available tasks by severity and fix type.
4. Ask what to fix unless the user already selected:
   - specific TASK IDs
   - all `SAFE` tasks
   - all Critical tasks
   - a component/page/path
   - one task at a time
5. Read the source files for selected tasks before editing.
6. Apply fixes incrementally. Re-check the relevant file/scope after each task when feasible.
7. Write or append `Binclusive-auditing/after-test.md`; also archive `after-test_<YYYY-MM-DD>.md` when a batch completes.

## CI / Diff Mode

This skill is **not** part of the CI/CD gate. CI runs map + audit on the diff and fails the build on open findings (see `audit-accessibility` CI / Diff Mode and `references/ci-cd.md`); it never mutates the branch. Remediation with this skill remains a human-reviewed step run locally or in a follow-up PR, where the developer selects which TASK IDs to fix. Do not wire this skill into a blocking CI check or auto-apply fixes on pull requests.

## Fix Policy

- `SAFE`: may apply after summarizing the intended change.
- `VISUAL-IMPACT`: ask user approval before editing.
- `FUNCTIONAL-RISK`: ask user approval and explain behavior/API risk before editing.
- `RUNTIME-CHECK`: do not mark solved by static code alone; create runtime verification steps and only edit if the needed code change is clear.

## After-Test Report

Use `references/after-test-format.md`. For each task include:

- task id and title
- original problem
- files changed
- exact remediation summary
- re-audit/static check result
- manual test steps
- residual risk or runtime checks

## Rules

- User-provided audit documents may be read as inspiration only; do not copy customer data into skill resources.

- Never fix tasks not selected by the user.
- Never write placeholder accessible names like `button`, `image`, `icon`, or `link`.
- Prefer semantic HTML before ARIA.
- Preserve existing styling and API contracts unless the user approves risk.
- Do not edit the audit TODO as proof of completion; write status in `after-test.md`.
- If a task cannot be grounded in real code, stop and report it as needing human review.

