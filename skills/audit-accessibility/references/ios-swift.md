# iOS Swift Accessibility Audit Notes

Use this reference only for iOS applications written in SwiftUI, UIKit, or a mixed SwiftUI/UIKit architecture. Pair it with the selected Binclusive project map and the iOS pattern catalog when available. The auditor observes and documents only; it never edits source code.

## Privacy Boundary

User-provided audit documents may be read as inspiration during skill creation only. Do not copy customer data into skill resources. Store only anonymized, reusable patterns. Do not persist real customer names, bundle identifiers, domains, internal URLs, proprietary screen names, ticket IDs, business copy, screenshots, or exact customer source paths from customer artifacts.

## Required Input

Read a selected `Binclusive-auditing/*_project-map.md` first. It is the source of truth for scope. If no map exists, stop and ask the user to run `map-project` first.

Audit only the mapped iOS screens, flows, components, storyboards/xibs, and platform features. If the map marks an area as runtime-only, carry that limitation into the finding or summary.

## Audit Order

1. Inline interactive UI in mapped SwiftUI views, UIKit controllers, cells, and storyboard/xib scenes.
2. Shared interactive components: Button, Link/NavigationLink, TextField, Picker, Toggle, Slider, Stepper, Sheet/Dialog, Menu, Tab, custom gesture targets, custom UIControls.
3. Shared display components: Image, Icon/SF Symbol, Avatar, List, Table, Collection/Grid, Chart, Map, Skeleton, Loading, Badge, Toast/Banner.
4. Screen-level patterns: navigation titles, headings, focus order, modal presentation/dismissal, errors, status updates, localization, Dynamic Type, Reduce Motion, RTL, contrast, touch targets.
5. Platform assistive technology support: VoiceOver, Switch Control, Voice Control, Full Keyboard Access, Dynamic Type, Bold Text, Button Shapes, Increase Contrast, Differentiate Without Color, Reduce Transparency, Reduce Motion.

## SwiftUI Checklist

### Semantics and Activation

- Custom `onTapGesture` or `gesture` used as a control without a native `Button`, `NavigationLink`, `Toggle`, or equivalent accessibility role/traits.
- Icon-only `Button`, toolbar item, swipe action, menu item, or custom control without a meaningful localized accessible name.
- Decorative images/SF Symbols exposed to VoiceOver, or informative images hidden without an equivalent label.
- Combined visual groups missing an intentional accessibility grouping strategy, such as `.accessibilityElement(children: .combine)` or `.contain` where appropriate.
- Over-combined groups that hide separately actionable controls or important values.
- State not exposed for selected, expanded, checked, disabled, loading, progress, or current item states.
- Custom actions or swipe/context actions not reachable through VoiceOver custom actions when the visual gesture is not enough.

### Names, Hints, Values, and Localization

- `TextField`, `SecureField`, `TextEditor`, picker, search, or form field without a visible/programmatic label.
- Placeholder-only field names or labels that disappear after entry.
- Error/help text not connected through nearby text, announcement, focus movement, or clear field context.
- Hardcoded visible strings, `accessibilityLabel`, `accessibilityHint`, `accessibilityValue`, image labels, or navigation titles outside localization resources.
- Hints that repeat the role or visible label instead of explaining non-obvious outcomes.
- Dynamic values, counts, dates, prices, durations, or percentages not localized or not exposed as understandable accessibility values.

### Navigation, Modals, and Dynamic Updates

- Screen lacks a clear navigation title or first meaningful heading.
- Custom back/close controls lack accessible names or expected activation behavior.
- Sheet, alert, confirmation dialog, popover, or custom modal lacks focus/announcement strategy after presentation or dismissal.
- For a custom sheet, popover, or overlay specifically, name the modal strategy: move VoiceOver focus into the modal on open (`AccessibilityFocusState` in SwiftUI), mark the container so the background is unreachable (`accessibilityViewIsModal` in UIKit), and return focus to the trigger on dismiss. Native `Alert` and `confirmationDialog` already manage focus — do not flag them.
- Source order that does not match the intended reading order without `.accessibilitySortPriority` (SwiftUI) or an explicit `accessibilityElements` ordering (UIKit). The rendered order is runtime-only, but a clearly mis-ordered source is a static finding.
- Async loading, success, failure, validation, or toast/banner updates lack an announcement strategy.
- Programmatic navigation or content replacement leaves VoiceOver focus in stale or confusing context.
- Lists, grids, and collection-like layouts have unclear row/card labels, missing actions, or poor reading order.

### Dynamic Type, Layout, and Visual Settings

- Fixed frames, clipped text, single-line assumptions, or overlays likely to break with larger Dynamic Type sizes.
- Custom fonts not using scalable text styles or not respecting Dynamic Type.
- Touch targets likely smaller than platform guidance, especially icon-only controls and dense rows.
- Color alone used to communicate status, required/error state, selection, chart segments, or availability.
- Motion/animation without Reduce Motion consideration.
- Custom contrast, disabled state, placeholder, chart, or dark mode colors requiring runtime contrast verification.
- RTL-sensitive layouts using left/right instead of leading/trailing, or directional icons not considered for mirroring.

### Dynamic Type Static Risk Signals

Flag these as Dynamic Type clipping/overlap risks when they affect user-facing text, controls, rows, cards, or form content. Do not claim the UI definitely overlaps from static code alone; phrase findings as "Large Dynamic Type sizes may cause clipping or overlap" and use `RUNTIME-CHECK` unless the required fix clearly changes visual layout, in which case use `VISUAL-IMPACT`.

SwiftUI risk signals:

- `.frame(height:)`, `.frame(width:)`, fixed min/max dimensions, or small fixed-size containers around `Text`, `Button`, `Label`, form rows, cards, list rows, toolbar items, or badges.
- `.lineLimit(1)`, aggressive `.truncationMode(...)`, or compact text-only layouts where the full value is important.
- `.clipped()`, `.clipShape(...)`, masks, fixed overlays, or clipped scroll/card containers that can hide enlarged text or focus outlines.
- `.overlay`, `ZStack`, `.offset`, or `.position` used to visually stack text, badges, icons, buttons, or controls without flexible layout space.
- `.minimumScaleFactor(...)` used as the primary strategy for fitting important text instead of allowing wrapping or layout growth.
- Custom `.font(.system(size:))`, `.font(.custom(...))`, or design-system font wrappers that do not map to scalable text styles or otherwise respect Dynamic Type.
- Dense `HStack`, card, row, or toolbar compositions that combine multiple `Text` values, icons, badges, and buttons without wrapping, priority, or vertical fallback.
- Fixed-height list rows, cards, toolbars, headers, footers, or form rows that contain localized or dynamic text.

UIKit risk signals:

- `UILabel.numberOfLines = 1` or equivalent single-line configuration on labels that can receive localized, user, server, or dynamic content.
- `lineBreakMode = .byTruncatingTail`, `.byTruncatingMiddle`, `.byClipping`, or similar truncation where the full text is important.
- `heightAnchor.constraint(equalToConstant:)`, fixed cell/header/footer heights, or fixed container constraints around labels and controls.
- Manual `CGRect`, `frame`, `bounds`, or layout calculations used for text-bearing views instead of constraints that can grow.
- `adjustsFontForContentSizeCategory = false`, missing `adjustsFontForContentSizeCategory`, or custom fonts without `UIFontMetrics` or text styles.
- Auto Layout constraints that prevent labels from expanding, such as fixed height plus top/bottom constraints, low vertical hugging/resistance mistakes, or required constraints between adjacent labels that can collide.
- `UITableViewCell` or `UICollectionViewCell` reuse paths that update text but do not update layout/accessibility state or rely on fixed row/item sizes.
- Storyboard/xib combinations of fixed height, single-line labels, custom fonts, compression resistance overrides, or clipped containers.

## UIKit Checklist

### Semantics and Activation

- Custom `UIView`, `UIImageView`, `UILabel`, or container with tap recognizer used as a control without `isAccessibilityElement`, label, traits, activation behavior, and keyboard/assistive support.
- Custom `UIControl` missing accessibility label, value, traits, state updates, or `accessibilityActivate` behavior when needed.
- Buttons, bar button items, tab items, collection/table cells, or image controls without meaningful localized names.
- Incorrect traits, such as action controls not exposed as buttons or selected/current items not exposed as selected.
- Important grouped information not exposed as one coherent element, or interactive children hidden inside an accessibility group.

### Forms, Errors, and Data Entry

- `UITextField`, `UITextView`, `UISearchBar`, picker, segmented control, date picker, or custom input without a persistent label or clear context.
- Placeholder used as the only accessible name.
- Validation errors shown visually but not announced, focused, or associated with the field.
- Missing keyboard type, text content type, autocorrection, secure text entry, or input traits where relevant to accessibility and usability.
- Required/optional state, disabled state, or formatting constraints not communicated.

### Tables, Collections, and Custom Layouts

- `UITableViewCell` or `UICollectionViewCell` has fragmented labels, confusing reading order, hidden values, or missing custom actions for row actions.
- Swipe actions, context menus, reorder/delete actions, or expandable rows are not exposed to VoiceOver users.
- Custom drawing, canvas-like UI, charts, maps, or calendars lack a text alternative, data summary, or accessible interaction model.
- Reused cells do not update accessibility labels, values, hints, traits, or identifiers reliably.

### Storyboards, XIBs, and Generated UI

- Static labels, buttons, image views, cells, and constraints in storyboard/xib files lack localization or accessibility properties.
- Controls rely on visual order that may not match VoiceOver order after runtime layout.
- Prototype cells and custom classes require runtime verification for final labels, traits, and order.

## Runtime-Only Checks

Mark `RUNTIME-CHECK` when static code cannot prove the issue:

- VoiceOver announcement, rotor order, grouping, and custom action behavior.
- Switch Control and Voice Control reachability/name matching.
- Full Keyboard Access focus order and activation.
- Dynamic Type layout at large accessibility sizes.
- touch target measurements and gesture conflict behavior.
- color contrast, dark mode contrast, Increase Contrast, disabled/placeholder contrast.
- Reduce Motion behavior and animation alternatives.
- modal focus/announcement after presentation and dismissal.
- rendered storyboard/xib output, Auto Layout results, reused cell state, and third-party UI behavior.
- charts, maps, web views, media controls, camera/scanner flows, and permission/system dialogs.

## Finding Rules

- Include problems only; do not list accessible elements.
- Every finding must reference code or storyboard/xib markup that was actually read.
- Prefer native SwiftUI/UIKit controls and platform accessibility APIs before custom accessibility workarounds.
- Do not invent VoiceOver output, rendered layout, contrast measurements, touch target dimensions, or confirmed Dynamic Type overlap/clipping.
- When static code shows fixed sizing, truncation, clipping, overlay, absolute positioning, non-scaling fonts, or constrained cells, report it as a Dynamic Type risk and require simulator/device verification at large accessibility text sizes.
- Never recommend placeholder labels such as `button`, `image`, `icon`, or `view`.
- Accessible names must be specific, localized, and action- or content-oriented.
- If a fix may change layout, gestures, navigation, state, or public component API, classify it as `VISUAL-IMPACT` or `FUNCTIONAL-RISK`.
- Do not claim App Store, WCAG, or platform compliance; report verified findings and residual risk only.

## Output

Write `Binclusive-auditing/accessibility-todo.md` and a dated archive copy. Use `accessibility-todo-format.md` for the exact structure. In the platform impact field or problem text, connect findings to relevant WCAG principles and iOS platform behavior such as VoiceOver, Switch Control, Voice Control, Dynamic Type, Reduce Motion, or localization.
