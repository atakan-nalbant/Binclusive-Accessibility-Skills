# Accessibility TODO Format

The active audit output is `Binclusive-auditing/accessibility-todo.md`.

## Header

- Title and date
- Auditor skill name
- App/project name
- Framework/platform and language
- Map file used
- Scope audited
- Read-coverage ledger (in-scope files fully-read / partially-read / unread, plus the explicit list of any partially-read or unread files — see the "Coverage" section of `SKILL.md`)
- Static-only vs runtime-assisted note

## Summary

- Items audited
- Findings total
- Severity counts
- Fix type counts
- Blind spots carried from map

## Summary Table

`| # | Title | Component / Page / Screen | File | Severity | Fix Type | Status |`

## Findings

Group findings by severity: Critical, Serious, Moderate, Minor.

Each finding:

````md
### - [ ] [TASK-001] Short, specific title
- **Component / Page / Screen:**
- **File path:**
- **Used in pages/screens:**
- **Severity:** Critical | Serious | Moderate | Minor
- **Code block in question:**
```jsx
// exact verified snippet, or use swift/xml/html/etc. as appropriate
```
- **Problem (detailed):**
- **Correct solution:**
- **Fix Type:** SAFE | VISUAL-IMPACT | FUNCTIONAL-RISK | RUNTIME-CHECK
- **Verification:**
- **Status:** TODO
````

## Footer

Tell the remediation agent to process by severity, auto-apply only `SAFE` tasks after review, ask before risky tasks, and verify with automated and manual checks.
