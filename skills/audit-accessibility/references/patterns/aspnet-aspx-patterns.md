# ASP.NET / ASPX Pattern Catalog

This catalog contains anonymized, reusable accessibility patterns only. Do not add customer names, project names, domains, internal URLs, proprietary component names, ticket IDs, business copy, screenshots, or exact customer source paths.

## Pattern Entry Template

```md
### PATTERN-ASPNET-001: Short title
- Platform: Web
- Framework: ASP.NET MVC | Razor Pages | ASPX Web Forms
- Component type: Button | Link | Input | Validator | Grid | Dialog | etc.
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

### PATTERN-ASPNET-001: Server label is not associated with input
- Platform: Web
- Framework: ASP.NET / ASPX
- Component type: Input / Select / Server control
- WCAG / APG: WCAG 1.3.1 Info and Relationships, WCAG 3.3.2 Labels or Instructions
- Severity default: Serious
- Fix type default: SAFE
- Bad shape: Visible label text is rendered separately from an `asp:TextBox`, `asp:DropDownList`, or equivalent control, with no `AssociatedControlID`, `<label for>`, or valid ARIA relationship.
- Detection hints: `<asp:Label>` without `AssociatedControlID`; adjacent text before input controls; placeholder-only fields.
- Correct fix: Use `AssociatedControlID` or a native `<label for>` that resolves to the rendered input ID; associate help/error text with `aria-describedby` when needed.
- Verification: Rendered accessibility tree exposes the intended name and description.
- False positives / exceptions: Do not flag fieldsets, legends, or composite controls that provide an equivalent accessible name after rendering.

### PATTERN-ASPNET-002: LinkButton used for an action without button semantics
- Platform: Web
- Framework: ASP.NET Web Forms
- Component type: LinkButton / command action
- WCAG / APG: WCAG 2.1.1 Keyboard, WCAG 4.1.2 Name/Role/Value
- Severity default: Moderate
- Fix type default: FUNCTIONAL-RISK
- Bad shape: An `asp:LinkButton` triggers a state-changing command but renders as a link, causing assistive technology users to expect navigation.
- Detection hints: `<asp:LinkButton>` with `CommandName`, `OnClick`, delete/save/submit actions, or JavaScript postback.
- Correct fix: Prefer `asp:Button`, native `<button>`, or a rendered element with accurate role and keyboard behavior when the visual/API contract allows.
- Verification: Control announces the correct role and action; Enter/Space behavior matches the role.
- False positives / exceptions: Do not flag true navigation links that have valid destinations and meaningful text.

### PATTERN-ASPNET-003: AJAX update is silent after partial postback
- Platform: Web
- Framework: ASP.NET Web Forms / MVC
- Component type: UpdatePanel / async validation / dynamic status
- WCAG / APG: WCAG 4.1.3 Status Messages, WCAG 2.4.3 Focus Order
- Severity default: Serious
- Fix type default: RUNTIME-CHECK
- Bad shape: An `UpdatePanel`, AJAX callback, or dynamic validation area updates results or errors without focus movement, live region, or status announcement strategy.
- Detection hints: `UpdatePanel`, `ScriptManager`, `PageRequestManager`, jQuery AJAX success handlers, dynamic `.html()` updates.
- Correct fix: Move focus to a meaningful heading/error summary when appropriate, or use `role="status"`/`aria-live` for non-focus-changing updates.
- Verification: Runtime keyboard and screen-reader checks confirm the update is perceivable without losing context.
- False positives / exceptions: Do not force focus for minor background updates that are correctly exposed as passive status messages.

### PATTERN-ASPNET-004: Grid or table lacks semantic headers
- Platform: Web
- Framework: ASP.NET MVC | Razor Pages | ASPX Web Forms
- Component type: Table / GridView / Repeater / ListView / third-party grid
- WCAG / APG: WCAG 1.3.1 Info and Relationships, WCAG 2.4.6 Headings and Labels
- Severity default: Serious
- Fix type default: SAFE for markup-only fixes; RUNTIME-CHECK when final server-control or third-party rendering must be verified.
- Bad shape: A data table or grid lacks `<caption>`, renders header cells as `<td>`, omits `scope`/`headers`, exposes layout tables as data tables, or uses icon-only action headers without accessible text.
- Detection hints: `<table>` without `<caption>`, `<thead>` containing `<td>`, `GridView`, `TemplateField`, `HeaderText`, `Repeater`, `ListView`, Telerik/Kendo/DevExpress grid markup, sortable headers.
- Correct fix: Provide a table name, render semantic `<th>` headers, use `scope` for simple tables, use `id`/`headers` for complex tables, and verify generated HTML from server controls.
- Verification: Rendered output exposes table name and correct row/column headers; sortable headers announce sort state; keyboard users can operate grid controls.
- False positives / exceptions: Do not flag presentational layout tables that are correctly removed from table semantics, but prefer replacing layout tables with CSS when feasible.
