# Shopify Theme Accessibility Reference

Use this reference when `shopify-theme-audit` audits a Shopify Online Store theme. The auditor observes and documents only; it never edits source code.

## Privacy Boundary

User-provided audit documents may be read as inspiration during skill creation only. Store only anonymized, reusable patterns. Do not persist real customer names, store names, domains, internal URLs, proprietary component names, merchant copy, screenshots, ticket IDs, or exact source paths from customer artifacts.

## Theme Structure Signals

Audit any combination of these theme files when present:

- `layout/*.liquid`: global HTML shell, skip links, main content, global messages, SEO/title, locale direction, app embeds.
- `templates/*.json` and `templates/*.liquid`: page composition, section ordering, setting values, customer/cart/product/collection/search/blog/password/404 pages.
- `sections/*.liquid`: Online Store 2.0 sections, schema settings, block rendering, merchant-configurable headings, links, media, color schemes, and behavior flags.
- `snippets/*.liquid`: shared controls and markup fragments.
- `assets/*.{js,css,liquid}`: custom elements, focus management, keyboard support, dynamic rendering, live regions, focus styles, visually hidden utilities, reduced motion, responsive behavior.
- `config/settings_schema.json` and `config/settings_data.json`: theme settings that affect colors, headings, social links, checkout/cart behavior, image behavior, labels, and optional features.
- `locales/*.json`: visible strings, aria labels, hidden text, status messages, new-window warnings, error messages, and translation completeness.
- `blocks/`, `customers/`, or app extension files when present.

## High-Risk Shopify Patterns

- CTA links rendered as `<a>` without `href`, or with `role="link" aria-disabled="true"` as a published-state fallback.
- Icon-only cart, search, account, menu, close, quantity, filter, sort, carousel, media, or social controls without localized accessible names.
- Merchant-configurable image, slideshow, banner, collection, and product media that may lose meaning when alt text or nearby text is empty.
- Product cards with duplicate links, inaccessible quick-add buttons, sale/badge text communicated only visually, or hidden product metadata that changes the accessible name.
- Variant pickers, quantity selectors, recipient forms, cart notes, discount fields, and contact/newsletter forms without labels, error association, required state, or autocomplete.
- Facets/filters/sort controls that update result counts without a status/live region or lose focus after AJAX updates.
- Drawers, modals, predictive search, cart notifications, localization popovers, media modals, pickup availability dialogs, and quick-add flows without focus move, trap, Escape close, and focus restore.
- Sliders/carousels without pause control, keyboard-operable controls, reduced-motion handling, or accessible slide names.
- Native `<details>/<summary>` patterns over-customized with roles, click delegation, or state that diverges from the native open state.
- Tooltip/help content available only on pointer hover or hidden with `aria-hidden` while carrying meaningful information.
- CSS utilities such as `.focus-none`, `[hidden]`, `display: none`, `visibility: hidden`, opacity-only hiding, or offscreen techniques that remove focus visibility or expose hidden content incorrectly.
- Dynamic HTML replacement that does not preserve focus, update status text, or reinitialize accessible behavior after cart/filter/search changes.
- App embeds, remote scripts, reviews, subscriptions, chat, loyalty, cookie banners, and personalization widgets that render inaccessible controls outside the theme source.

## Positive Patterns To Recognize

Do not create TODO tasks for accessible patterns. Mention them only in the summary when useful:

- Skip link that becomes visible on focus and targets the main content.
- Robust `.visually-hidden` utility used for table headers, status text, icon labels, and context.
- Visible focus styles with `:focus-visible` and a keyboard fallback.
- Dialog/drawer focus trap, Escape close, and focus restore.
- `role="dialog"`, `aria-modal`, `aria-labelledby`, and a programmatically focusable dialog container.
- Live regions or `role="status"` for cart, product count, search, filtering, slideshow, and validation updates.
- Explicit form labels and `aria-describedby` for help, errors, and page-refresh warnings.
- Product/media image alt values sourced from Shopify media alt fields.
- Decorative SVG/img content hidden with `aria-hidden="true"` or empty `alt`.
- `prefers-reduced-motion` and `forced-colors` support.
- Carousel/slideshow regions with labels, pause/play controls, and meaningful slide grouping.
- Locale-backed accessibility strings for hidden labels and status messages.

## Shopify-Specific Checks

### Layout and Global Shell

- Verify a skip link exists and targets a real main container.
- Verify one clear `<main>` landmark is present and repeated header/footer/navigation regions are not nested incorrectly.
- Verify `<html lang>` and `dir` or locale direction are set when the theme supports multiple languages or RTL locales.
- Verify global accessibility helper strings exist in locale files and are used for hidden messages such as refresh/new-window notices.
- Check app embed placeholders and third-party script outputs as blind spots when source is unavailable.

### Templates, Sections, and Blocks

- Read JSON templates with the Liquid section files they reference.
- Treat `settings` and `blocks` as part of the audit evidence: empty link, heading, image, label, or accessibility text settings can change the result.
- Verify section schema defaults do not encourage inaccessible published states.
- Check heading level choices for hero/banner/slideshow sections. Mark content architecture concerns as `RUNTIME-CHECK` when final merchant composition determines the issue.
- Verify optional buttons are not rendered as disabled fake links when a URL setting is blank.

### Links, Buttons, and Controls

- Prefer real `<button type="button">` for actions and real `<a href>` for navigation.
- Flag non-semantic clickable elements and anchors used as buttons.
- Verify custom controls expose name, role, state, focusability, and Enter/Space behavior.
- Check quantity, variant, filter, sort, and carousel controls for visible labels or localized accessible names.

### Forms

- Verify labels are programmatically associated with inputs, textareas, selects, checkboxes, and radios.
- Verify error messages connect with `aria-describedby` and invalid state uses `aria-invalid` where applicable.
- Verify required fields, autocomplete tokens, fieldsets/legends, and success/error live regions for customer, newsletter, contact, gift card, cart note, and recipient forms.

### Dynamic UI

- Verify predictive search, cart drawer, quick add, filters, localization selectors, media modals, popovers, and drawers manage focus.
- Verify dynamic updates use `role="status"`, `aria-live`, or an equivalent announcement strategy.
- Verify `aria-expanded`, `aria-controls`, selected/current states, and disabled states are synchronized with rendered state.
- Mark minified or remote behavior as `RUNTIME-CHECK` when static source cannot prove it.

### Media and Visual Content

- Verify informative images have meaningful alt text or nearby text that carries the same meaning.
- Verify decorative images and icons are hidden from assistive technology.
- Treat hero/banner/slideshow alt text as content-governance risk when merchant content determines whether the image is informative.
- Verify video, model viewers, external embeds, and media galleries have accessible controls, captions/transcripts when relevant, and keyboard support.

### CSS, Motion, and Visual States

- Verify focus is visible on interactive controls across theme color schemes.
- Flag utilities that remove outline/box-shadow on focus when used on interactive elements.
- Verify reduced-motion support for animations, drawers, sliders, carousels, parallax, and transitions.
- Verify forced-colors/high-contrast support where CSS custom properties or box shadows carry essential state.
- Mark contrast, zoom/reflow, and touch target measurements as `RUNTIME-CHECK` unless directly measured in a running storefront.

## Severity Guidance

- Critical: issue can block checkout, cart, navigation, product selection, account access, form submission, or keyboard access to core purchase flow.
- Serious: issue significantly impairs a common user path, component family, dialog/drawer, form, media control, or repeated product/collection pattern.
- Moderate: issue affects comprehension, convenience, secondary flows, content governance, or a less common component state.
- Minor: polish, redundant announcements, localized wording quality, isolated non-blocking concerns, or maintainability warnings with accessibility risk.

## Fix Type Guidance

- `SAFE`: localized accessible name, decorative icon hiding, label association, missing `type="button"`, clear status text, or equivalent low-risk semantic correction.
- `VISUAL-IMPACT`: heading strategy, visible labels, focus style changes, layout/spacing changes, control visibility, or content display changes.
- `FUNCTIONAL-RISK`: replacing fake links, changing drawer/modal/filter/search/cart behavior, altering JS state management, or changing section rendering logic.
- `RUNTIME-CHECK`: contrast, merchant content quality, app embed output, minified/third-party behavior, focus trap/restore not provable statically, zoom/reflow, touch target size, screen-reader announcement order, or final storefront configuration.

## Finding Rules

- Include problems only; do not list accessible elements as findings.
- Every finding must reference code or config that was actually read.
- Include the usage path: template -> section -> snippet/asset whenever statically discoverable.
- Distinguish theme-code issues from merchant-content governance issues.
- Do not recommend placeholder accessible names such as `button`, `image`, `icon`, `link`, or untranslated English labels in localized themes.
- Do not claim WCAG conformance.
