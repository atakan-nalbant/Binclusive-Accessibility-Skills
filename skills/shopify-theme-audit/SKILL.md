---
name: shopify-theme-audit
description: Audit Shopify Online Store themes for accessibility from Liquid, JSON templates, sections, snippets, assets, config, and locale files. Use when the user asks for a Shopify theme accessibility audit, Shopify theme TODO/review, Liquid theme accessibility review, Dawn/custom theme audit, "shopify tema erisilebilirlik testi", "shopify accessibility todo cikar", or wants an evidence-based Binclusive accessibility TODO report for any Shopify theme structure.
---

# Shopify Theme Audit

Audit a Shopify theme statically and write an actionable accessibility TODO report. This skill observes and documents only. It never edits source code.

## Start Here

1. Locate the Shopify theme root. Confirm it contains Shopify theme signals such as `layout/theme.liquid`, `sections/`, `snippets/`, `templates/`, `config/settings_schema.json`, `locales/`, or `shopify.theme.toml`.
2. If the target is not clearly a theme root, search one level down for those signals. Ask only if multiple candidate theme roots remain.
3. Create `Binclusive-auditing/` in the theme root if missing.
4. Read `references/shopify-theme-a11y.md`.
5. Inventory the theme before writing findings:
   - layout files and global skip/main/header/footer structure
   - JSON and Liquid templates
   - sections, section groups, app blocks, and blocks when present
   - snippets that render controls, cards, product media, forms, dialogs, drawers, menus, filters, facets, search, cart, checkout entry points, localization, or customer account UI
   - JavaScript custom elements, event handlers, focus management, dynamic rendering, live-region updates, drawers, modals, sliders, carousels, media, predictive search, variants, cart updates, and filters
   - CSS focus, visually hidden, reduced motion, forced colors, zoom/reflow, hidden/display utilities, and target sizing patterns
   - config settings and locale strings that affect headings, CTA links, accessible names, image alt behavior, empty states, and live-region text
6. Audit only code and configuration that was actually read. For merchant-entered content or runtime state that cannot be proven statically, write a `RUNTIME-CHECK` finding instead of guessing.
7. Write:
   - `Binclusive-auditing/accessibility-todo.md`
   - `Binclusive-auditing/accessibility-todo_<YYYY-MM-DD>.md`

## Required Output

Use `references/shopify-accessibility-todo-format.md`. Every finding must include:

- stable task id (`TASK-001`, etc.)
- component, template, section, snippet, or asset
- file path and, when possible, section/template usage context
- severity: Critical, Serious, Moderate, Minor
- fix type: `SAFE`, `VISUAL-IMPACT`, `FUNCTIONAL-RISK`, or `RUNTIME-CHECK`
- exact verified Liquid, JSON, JavaScript, CSS, or HTML snippet
- problem, WCAG/APG/platform impact, correct solution, verification steps
- status: `TODO`

Optionally include a short "Positive patterns observed" section in the summary when the user asks for review notes, but do not turn best practices into TODO tasks.

## Audit Order

1. Global layout: skip link, `<main id>`, landmarks, page title, language/locale/dir, global accessibility messages, focus utilities.
2. Header, navigation, search, localization/currency selectors, account/cart entry points.
3. Product, collection, search, cart, customer account, blog/article, password, gift card, and 404 templates.
4. Shared sections and snippets: buttons/links, product cards, media galleries, variant pickers, quantity selectors, filters/facets, accordions, tabs, drawers, dialogs, popovers, tooltips, sliders/carousels, tables, forms, icons/images, video/model viewers.
5. JavaScript behavior: custom elements, keyboard support, focus trap/restore, Escape handling, route/dynamic updates, live regions, async cart/filter/search updates.
6. CSS behavior: focus visibility, visually hidden utilities, hidden content, reduced motion, forced colors, contrast-related tokens, zoom/reflow and responsive transformations.
7. Theme settings, JSON templates, and locales that can create inaccessible merchant content or missing accessible labels.

## Rules

- Do not modify source code.
- Do not include accessible elements as findings.
- Do not copy customer data, store names, domains, proprietary copy, private paths, screenshots, or merchant-specific text into skill resources.
- Prefer native HTML and Shopify Liquid patterns over ARIA-heavy fixes.
- Treat Shopify merchant content as variable. If a problem depends on admin-entered alt text, heading text, link URL, block order, color setting, app block output, or published content, mark it `RUNTIME-CHECK` or describe it as a content governance task.
- Do not guess contrast, rendered focus order, focus trap behavior in minified/third-party scripts, screen-reader output, touch target size, 200% text resize, 400% reflow, or app embed output.
- For JSON templates, audit the referenced sections/blocks and settings values together. A section setting can make a section accessible or inaccessible.
- For theme app extensions, remote app embeds, and checkout pages outside the theme source, record them as blind spots unless source code is present.
- Do not claim compliance; report verified findings and residual risk only.

## Scope Notes

This skill can run without a prior `map-project` output because Shopify themes have a conventional file structure. If a Binclusive project map exists, use it as extra scope context but still inspect the theme files directly.
