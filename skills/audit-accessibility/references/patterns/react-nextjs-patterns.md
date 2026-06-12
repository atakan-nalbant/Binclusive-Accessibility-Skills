# React / Next.js Pattern Catalog

This catalog contains anonymized, reusable accessibility patterns only. Do not add customer names, project names, domains, internal URLs, proprietary component names, ticket IDs, business copy, screenshots, or exact customer source paths.

## Pattern Entry Template

```md
### PATTERN-REACT-001: Short title
- Platform: Web
- Framework: React / Next.js
- Component type: Button | Link | Input | Dialog | Tabs | Carousel | etc.
- WCAG / APG: WCAG 2.1.1, 4.1.2, APG Dialog Pattern, etc.
- Severity default: Critical | Serious | Moderate | Minor
- Fix type default: SAFE | VISUAL-IMPACT | FUNCTIONAL-RISK | RUNTIME-CHECK
- Bad shape: anonymized description of the recurring code/UX problem
- Detection hints: grep/search/static cues
- Correct fix: preferred implementation pattern
- Verification: keyboard, screen reader, automated, runtime notes
- False positives / exceptions: when not to flag
```

## Seed Patterns

### PATTERN-REACT-001: Non-semantic click target
- Platform: Web
- Framework: React / Next.js
- Component type: Button-like custom control
- WCAG / APG: WCAG 2.1.1 Keyboard, WCAG 4.1.2 Name/Role/Value
- Severity default: Critical
- Fix type default: FUNCTIONAL-RISK
- Bad shape: A `div`, `span`, layout component, or icon wrapper has `onClick` but no native semantics.
- Detection hints: `onClick` on non-interactive JSX elements; missing `role`, `tabIndex`, Enter/Space handler, and accessible name.
- Correct fix: Render a native `<button type="button">` for actions or `<a href>` for navigation. Use ARIA only when native replacement is not feasible.
- Verification: Tab reaches it, Enter/Space activates it, and screen reader announces name, role, and state.
- False positives / exceptions: Do not flag non-interactive containers where the handler is only delegated and an inner native control handles activation.

### PATTERN-REACT-002: Icon-only control without accessible name
- Platform: Web
- Framework: React / Next.js
- Component type: IconButton / close button / carousel arrow / menu trigger
- WCAG / APG: WCAG 4.1.2 Name/Role/Value
- Severity default: Serious
- Fix type default: SAFE when adding a real label; FUNCTIONAL-RISK when changing structure.
- Bad shape: A button or clickable icon contains only SVG/icon content and has no visible text, `aria-label`, or `aria-labelledby`.
- Detection hints: icon children, empty text content, close/search/favorite/menu SVGs.
- Correct fix: Provide a localized accessible name that describes the action, not the icon. Hide decorative SVGs from assistive tech.
- Verification: Screen reader announces the intended action plus role.
- False positives / exceptions: Do not add `aria-label` that conflicts with visible text; prefer visible text or `aria-labelledby` when available.

### PATTERN-REACT-003: Form field label is visual only
- Platform: Web
- Framework: React / Next.js
- Component type: Input / Textarea / Select
- WCAG / APG: WCAG 1.3.1 Info and Relationships, WCAG 3.3.2 Labels or Instructions
- Severity default: Serious
- Fix type default: SAFE
- Bad shape: Visible label text is not programmatically associated with the form control, or placeholder is the only label.
- Detection hints: `<label>` without `htmlFor`, input without `id`, custom label wrapper, placeholder-only fields.
- Correct fix: Use a stable `id` plus `<label htmlFor>`, or `aria-labelledby`; associate help/error text with `aria-describedby`.
- Verification: Accessibility tree exposes the intended name and description.
- False positives / exceptions: A control can be validly named by `aria-label` or `aria-labelledby` when no visible label is appropriate.

### PATTERN-REACT-004: Data table lacks semantic headers or caption
- Platform: Web
- Framework: React / Next.js
- Component type: Table / Data grid
- WCAG / APG: WCAG 1.3.1 Info and Relationships, WCAG 2.4.6 Headings and Labels
- Severity default: Serious
- Fix type default: SAFE when adding caption/header semantics; RUNTIME-CHECK for virtualized or third-party grids.
- Bad shape: A data table renders without `<caption>`, uses `<td>` for headers, omits `scope`/`headers`, or renders a visual table with `<div>` elements and no equivalent grid semantics.
- Detection hints: reusable `Table`, `DataTable`, `Grid`, `columns` configs, `renderHeader`, sortable headers, `<table>` without `<caption>`, `<thead>` containing `<td>`.
- Correct fix: Use native table markup for tabular data; provide a table name, semantic `<th>` headers, `scope` for simple relationships, and `id`/`headers` for complex relationships.
- Verification: Screen reader can identify the table name and announce the correct row/column headers for representative cells.
- False positives / exceptions: Do not require `<caption>` for layout tables that are correctly removed from table semantics; do not force native tables for interactive widgets that correctly implement the ARIA grid pattern.
