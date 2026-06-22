# Shopify Accessibility TODO Format

The active audit output is `Binclusive-auditing/accessibility-todo.md`.

## Header

- Title and date
- Auditor skill name: `shopify-theme-audit`
- Theme/project name
- Shopify theme type if known: Dawn-derived, custom Online Store 2.0, vintage Liquid theme, headless-adjacent theme, or unknown
- Scope audited
- Static-only vs runtime-assisted note
- Theme files/directories inspected

## Summary

- Items audited
- Findings total
- Severity counts
- Fix type counts
- Runtime/content-governance checks
- Blind spots such as app embeds, merchant content, checkout, or third-party scripts
- Optional positive patterns observed when useful

## Summary Table

`| # | Title | Theme Area | File | Severity | Fix Type | Status |`

## Findings

Group findings by severity: Critical, Serious, Moderate, Minor.

Each finding:

````md
### - [ ] [TASK-001] Short, specific title
- **Theme area:** template | section | snippet | asset | layout | config | locale
- **Component / Section / Snippet:**
- **File path:**
- **Used in templates/sections:** 
- **Severity:** Critical | Serious | Moderate | Minor
- **Code block in question:**
```liquid
<!-- exact verified snippet, or use json/javascript/css/html as appropriate -->
```
- **Problem (detailed):**
- **Correct solution:**
- **Fix Type:** SAFE | VISUAL-IMPACT | FUNCTIONAL-RISK | RUNTIME-CHECK
- **Verification:**
- **Status:** TODO
````

## Footer

Tell the remediation agent to process by severity, review Shopify theme settings/content dependencies before editing, auto-apply only reviewed `SAFE` tasks, ask before visual/functional changes, and verify in the storefront with keyboard, screen reader, zoom/reflow, reduced motion, and representative merchant content.
