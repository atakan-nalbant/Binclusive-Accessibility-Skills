# CI/CD Accessibility Gate

Run the Binclusive accessibility audit as a pull-request check that only looks at
what the PR changed and fails the build on serious findings. No source code is
modified in CI.

## Pipeline shape

```
git-diff-scope.mjs   ->  map (optional)  ->  audit (diff mode)  ->  gate.mjs
   changed files          refresh baseline    write TODO for the     exit non-zero on
   + line ranges          map for the diff    diff scope only        open Critical/Serious
```

Steps:

1. **Scope** — `node skills/audit-accessibility/scripts/git-diff-scope.mjs .`
   computes the auditable files changed between the base ref and HEAD, with
   per-file changed line ranges, and points at any committed baseline map.
2. **Map (optional)** — refresh the committed `*_project-map.md` for the changed
   files so the audit has cross-file usage context. Skippable; the audit runs
   diff-only without it.
3. **Audit** — `audit-accessibility` in diff mode audits only the changed
   targets and writes `Binclusive-auditing/accessibility-todo.md`.
4. **Gate** — `node skills/audit-accessibility/scripts/gate.mjs` parses that
   report and exits non-zero when any open finding is at/above the threshold.

## Configuration

| Variable | Purpose | Default |
| --- | --- | --- |
| `BINCLUSIVE_BASE_REF` | Explicit diff base (branch, SHA, tag) | `GITHUB_BASE_REF`, then `origin/main` |
| `BINCLUSIVE_CI` | Forces non-interactive diff mode in the skills | unset |
| `BINCLUSIVE_INCLUDE_WORKING` / `--include-working` | Include uncommitted (staged, unstaged, untracked) edits in scope | off (committed-only) |
| `--max-severity=` | Gate threshold: `critical\|serious\|moderate\|minor` | `serious` |

### Committed vs working-tree scope

`git-diff-scope.mjs` has two modes:

- **Committed (default)** — `git diff <base>...HEAD`. Correct for CI: a pushed PR
  branch is checked out clean, so committed history *is* the change. If the
  working tree is dirty, the script does **not** audit those edits but emits a
  `note` listing the excluded files so the run is never silently empty.
- **Working-tree (`--include-working`)** — `git diff <base>` plus untracked files,
  i.e. committed branch changes **and** local uncommitted edits. Use this for
  local pre-commit / pre-push runs (`mode: "working-tree"` in the output).
  Untracked new files come back with `status: "U"` and empty `changedLineRanges`,
  meaning audit the whole file.

The audit runs inside Claude Code headless (`claude -p`). The skills are
non-interactive in diff mode; the deterministic pass/fail comes from `gate.mjs`,
not from the model.

## GitHub Actions example

```yaml
name: accessibility
on: pull_request

jobs:
  a11y-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # full history so the base ref is reachable

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      # Make the PR base branch available locally for the diff.
      - run: git fetch origin "$GITHUB_BASE_REF"
      - run: echo "BINCLUSIVE_BASE_REF=origin/$GITHUB_BASE_REF" >> "$GITHUB_ENV"

      # Skip the model run entirely when nothing auditable changed.
      - id: scope
        run: |
          node skills/audit-accessibility/scripts/git-diff-scope.mjs . > scope.json
          echo "count=$(node -p "require('./scope.json').changedFileCount")" >> "$GITHUB_OUTPUT"

      - if: steps.scope.outputs.count != '0'
        env:
          BINCLUSIVE_CI: "1"
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: claude -p "/auditaccessibility --diff"

      - if: steps.scope.outputs.count != '0'
        run: node skills/audit-accessibility/scripts/gate.mjs Binclusive-auditing/accessibility-todo.md --max-severity=serious

      - if: always() && steps.scope.outputs.count != '0'
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-todo
          path: Binclusive-auditing/accessibility-todo*.md
```

Adjust paths if the skills are installed outside the repo (e.g.
`~/.claude/skills/...`). For GitLab CI / Jenkins / Azure Pipelines the shape is
identical: fetch the base branch, export `BINCLUSIVE_BASE_REF`, gate the scope,
run the audit, run the gate, upload the report.

## Notes and limits

- **Diff-only context.** Without a committed baseline map, a changed shared
  component is audited via importer search; deep or dynamic usage can be missed.
  Commit a baseline map for stronger cross-file coverage and refresh it in the
  map step.
- **Line-range focus.** The audit prioritizes changed lines but may still flag an
  unchanged line that the change made newly reachable.
- **Renames/moves** are followed to the new path (`--diff-filter=ACMR`).
- **No base ref** (shallow clone, first commit) falls back to `HEAD~1` and the
  scope output says so — set `fetch-depth: 0` and `BINCLUSIVE_BASE_REF` to avoid
  this.
- The gate counts only **open** findings (Status not done/resolved/fixed).
- **Strict severity:** an open finding with no parseable `- **Severity:**` line is a
  hard error (exit 2), so a malformed report fails the build instead of silently
  passing. Every open TASK heading must carry a Severity line.
