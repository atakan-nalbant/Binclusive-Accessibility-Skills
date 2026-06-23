# Auditor Web A11Y Reference

Use this reference when `audit-accessibility` audits a web scope from a prior Binclusive project map. Pair it with the framework-specific reference for React/Next.js, ASP.NET MVC/Razor, or ASPX/Web Forms. The auditor observes and documents only; it never edits source code.

## Privacy Boundary

User-provided audit documents may be read as inspiration during skill creation only. Do not copy customer data into skill resources. Store only anonymized, reusable patterns. Do not persist real customer names, project names, domains, internal URLs, proprietary component names, ticket IDs, business copy, screenshots, or exact source paths from customer artifacts.

## Required Input

Read a selected `Binclusive-auditing/*_project-map.md` first. It is the source of truth for scope. If no map exists, stop and ask the user to run `map-project` first.

## Audit Order

1. Inline interactive UI in pages/views.
2. Shared interactive components: buttons, links, inputs, selects, dialogs, drawers, popovers, menus, tabs, accordions, carousels, toasts.
3. Shared display components: image, icon, avatar, table, chart, skeleton, loading, badge.
4. Page-level patterns: landmarks, headings, skip links, route focus, page title, language, locale, reduced motion, zoom/reflow.

## Checklist

### Semantics and Keyboard

- Non-interactive elements with click handlers used as controls.
- Custom controls missing role, accessible name, state, focusability, or Enter/Space handling.
- Anchors used as buttons or anchors without valid `href`.
- Nested interactive elements.
- Positive `tabIndex` values or non-focusable custom controls.

### Names, Labels, and Forms

- Icon-only controls without accessible names.
- Inputs, textareas, and selects without associated labels.
- Placeholder used as the only label.
- Help/error text not associated with `aria-describedby`.
- Required/error state not exposed through `required`, `aria-required`, `aria-invalid`, or live regions.
- Missing autocomplete tokens for identity/contact/payment fields.
- Related controls not grouped with `fieldset/legend` or equivalent accessible grouping.

### Dialogs, Menus, Popovers, Tabs, Accordions

- Dialogs without accessible name, modal semantics, focus move, focus trap, focus restore, or Escape handling.
- Disclosure/menu/combobox patterns missing `aria-expanded`, `aria-controls`, or APG keyboard behavior.
- Tabs missing tablist/tab/tabpanel semantics and arrow-key behavior.
- Accordions missing button semantics, expanded state, or heading structure.
- Menu roles (`role="menu"` / `role="menuitem"`) applied to plain site navigation. A simple list of links is a `<nav>`, not a menu — reserve menu/menubar semantics for true application menus, otherwise screen-reader users get unexpected menu keyboard semantics on ordinary navigation.

### Images, SVG, Media, Charts

- Informative images missing meaningful alt text.
- Decorative images/SVGs not hidden from assistive tech.
- Informative SVGs without accessible name.
- Video/audio missing captions, transcript, or accessible controls.
- Charts/maps/canvas lacking text alternatives.

### Tables and Data Grids

- Data tables without a programmatic name, preferably `<caption>`; `aria-label` or `aria-labelledby` is acceptable when a visible caption is not appropriate.
- Header cells rendered as `<td>` instead of `<th>`.
- Column and row headers missing correct `scope="col"` or `scope="row"` when the header relationship is simple.
- Complex tables missing reliable `id`/`headers` associations when `scope` is not enough.
- Empty, icon-only, or visually hidden headers that do not provide meaningful accessible header text.
- Sortable columns missing sort state such as `aria-sort`, or using icons/color alone to communicate sort direction.
- Layout tables used for visual positioning without being marked/presented so assistive technology does not treat them as data tables.
- Responsive table transformations that visually detach cells from their headers or require runtime verification of header relationships.

### Dynamic Content and Motion

- Toasts, async result banners, loaders, counters, and validation messages without status/live-region strategy.
- Loading areas without `aria-busy` where appropriate.
- Animations or carousels without reduced-motion support or pause control.

### Layout, Navigation, and Page-Level Checks

- Missing skip link, `<main>`, landmarks, or meaningful heading structure.
- Route changes without focus management or announcement.
- Missing or duplicated page titles.
- Missing `<html lang>` or incorrect locale/`dir` handling.
- Hardcoded locale-sensitive formatting.

### Runtime-Only Checks

Mark `RUNTIME-CHECK` when static code cannot prove the issue:

- color contrast and dark mode contrast
- focus trap/restore in third-party widgets
- actual screen-reader announcement
- touch target size
- 200% text resize and 400% reflow
- SPA route transition focus behavior
- carousel autoplay behavior

## Finding Rules

- Include problems only; do not list accessible elements.
- Every finding must reference code that was actually read.
- Prefer native HTML in recommended fixes.
- Use ARIA only to fill semantic gaps.
- Never recommend placeholder accessible names such as `button`, `image`, `icon`, or `link`.
- Do not claim compliance.

## Output

Write `Binclusive-auditing/accessibility-todo.md` and a dated archive copy. Use `accessibility-todo-format.md` for the exact structure.
