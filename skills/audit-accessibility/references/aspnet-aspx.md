# ASP.NET / ASPX Accessibility Audit Notes

Use this reference only for ASP.NET MVC/Razor, Razor Pages, or ASPX/Web Forms projects.

## Framework-Specific Areas

- Web Forms: audit `.aspx`, `.ascx`, `.master`, `App_Themes`, resource files, validators, `UpdatePanel`, menu/tree controls, grid controls, and code-behind that sets UI text or attributes.
- ASP.NET MVC: audit controllers/routes for view selection, `Views/**/*.cshtml`, `Views/Shared`, layouts, partials, editor/display templates, validation summaries, and unobtrusive validation.
- Razor Pages / ASP.NET Core: audit `Pages/**/*.cshtml`, handlers that set view data, `_Layout`, `_ViewStart`, `_ViewImports`, tag helpers, partials, and endpoint/culture setup.
- Client assets: audit UI-affecting scripts and styles under `Scripts/`, `Content/`, `wwwroot/`, bundles, and third-party component templates.

## High-Risk ASP.NET / ASPX Patterns

- `<asp:LinkButton>` or clickable controls that render as links but perform actions without button semantics.
- server controls with `Text`, `ToolTip`, `HeaderText`, `AlternateText`, or validation messages hardcoded outside resources.
- `ImageButton`, icon links, or template buttons without accessible names.
- labels not associated with rendered inputs through `AssociatedControlID`, `<label for>`, or equivalent.
- validation errors shown visually but not associated with fields or announced after postback/AJAX updates.
- `UpdatePanel`, partial postbacks, or AJAX callbacks that change content without focus management or live-region strategy.
- third-party grids, menus, tabs, date pickers, dialogs, or combo boxes with runtime-only keyboard/focus behavior.
- master/layout pages missing `<html lang>`, `dir`, skip link, landmarks, page title, or stable main content.
- table-based layout exposed as data tables, or real data tables/data grids missing `<caption>`, `<th>`, `scope`, `headers`, or equivalent rendered header associations.
- generated client IDs referenced incorrectly by scripts or ARIA relationships: a `for`, `aria-labelledby`, `aria-describedby`, or `headers` reference pointing at an `asp:` id that ASP.NET rewrites under a naming container, or a partial/template rendered more than once emitting duplicate ids. Prefer `ClientID`-aware references, or `ClientIDMode="Static"` only where the id is guaranteed unique; the final resolution is render-time, so confirm it as a `RUNTIME-CHECK`.

## Web Forms Checks

- Master pages provide document language, title strategy, skip link, landmarks, and content placeholders with stable IDs where needed.
- `.aspx` pages and `.ascx` controls use semantic HTML where possible instead of layout tables or generic server controls.
- `Label.AssociatedControlID` is used for `TextBox`, `DropDownList`, `CheckBoxList`, `RadioButtonList`, and related controls.
- Validators expose errors programmatically; validation summaries receive focus or are announced when appropriate.
- `GridView`, `Repeater`, `ListView`, and templated controls expose table/list semantics, headers, row actions, and accessible names.
- `UpdatePanel` and async postbacks preserve or restore focus and announce changed regions.

## ASP.NET / ASPX Table Checks

- Native `<table>` data tables have a programmatic name, preferably `<caption>`; `aria-label` or `aria-labelledby` is acceptable when no visible caption is appropriate.
- Header cells render as `<th>`, not only styled `<td>` cells or `HeaderText` displayed without semantic header markup.
- Simple data tables use `scope="col"` for column headers and `scope="row"` for row headers where applicable.
- Complex, grouped, or multi-row headers use reliable `id`/`headers` relationships when `scope` is insufficient.
- Empty or icon-only header cells have meaningful accessible text, especially for action columns such as edit, delete, details, select, or expand.
- Sortable headers expose the active sort state with `aria-sort` or an equivalent accessible announcement, and the sort control is keyboard accessible.
- `GridView` output is checked for accessible headers after rendering; when configured in code-behind, look for `UseAccessibleHeader`, `HeaderRow.TableSection`, `HeaderText`, row header setup, and template fields that may remove semantic headers.
- `Repeater`, `ListView`, and custom templates are checked because they can render either valid tables or visually table-like markup without header associations.
- Layout tables are flagged when assistive technology would encounter them as data tables; if layout tables cannot be removed immediately, the recommended fix should avoid disrupting visual layout and use an appropriate presentation strategy.
- Third-party grids such as Telerik, Kendo, DevExpress, or AjaxControlToolkit grids require runtime verification for final rendered `<table>`, keyboard navigation, focus order, header associations, and sort/filter announcements.

## MVC / Razor Checks

- `_Layout.cshtml` or equivalent defines language, title, landmarks, skip link, and main content.
- `LabelFor`, `ValidationMessageFor`, `ValidationSummary`, `EditorFor`, and custom tag helpers render accessible label/error relationships.
- Partial views and editor templates do not duplicate IDs or break `aria-describedby` relationships.
- Action links used for commands are not exposed as navigation when they trigger state changes.
- Anti-forgery or model validation messages are visible and programmatically connected.

## Runtime-Only Checks

Mark as `RUNTIME-CHECK` when not statically provable:

- rendered HTML from server controls, templates, or third-party components
- client ID generation and final ARIA/id relationships
- color contrast and theme contrast
- focus movement after postback, partial postback, modal open/close, or validation failure
- keyboard behavior of third-party grids, menus, date pickers, dialogs, and combo boxes
- rendered table semantics from `GridView`, templated controls, Razor helpers, and third-party grids
- screen-reader announcement order after AJAX updates
- browser zoom/reflow at 200%/400%
- touch target measurements
