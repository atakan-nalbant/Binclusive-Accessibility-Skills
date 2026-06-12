# iOS Swift Pattern Catalog

This catalog contains anonymized, reusable accessibility patterns only. Do not add customer names, bundle identifiers, domains, internal URLs, proprietary screen names, ticket IDs, business copy, screenshots, or exact customer source paths.

## Pattern Entry Template

```md
### PATTERN-IOS-001: Short title
- Platform: iOS
- Framework: SwiftUI | UIKit | Mixed
- Component type: Button | Input | Cell | Sheet | Chart | etc.
- WCAG / Platform: WCAG 2.1.1, 4.1.2, VoiceOver, Dynamic Type, etc.
- Severity default: Critical | Serious | Moderate | Minor
- Fix type default: SAFE | VISUAL-IMPACT | FUNCTIONAL-RISK | RUNTIME-CHECK
- Bad shape: anonymized description of the recurring code/UX problem
- Detection hints: grep/search/static cues
- Correct fix: preferred SwiftUI/UIKit implementation pattern
- Verification: VoiceOver, Switch Control, Voice Control, Dynamic Type, runtime notes
- False positives / exceptions: when not to flag
```

## Seed Patterns

### PATTERN-IOS-001: Gesture-only SwiftUI control
- Platform: iOS
- Framework: SwiftUI
- Component type: Button-like custom control
- WCAG / Platform: WCAG 2.1.1 Keyboard, WCAG 4.1.2 Name/Role/Value, VoiceOver activation
- Severity default: Critical
- Fix type default: FUNCTIONAL-RISK
- Bad shape: A `Text`, `Image`, `HStack`, `VStack`, `ZStack`, or custom view uses `onTapGesture` as an action control without native button/navigation semantics.
- Detection hints: `.onTapGesture` on non-control views; missing `Button`, `NavigationLink`, accessibility label, traits, and activation behavior.
- Correct fix: Prefer `Button` for actions and `NavigationLink` for navigation. If a native control is impossible, expose accurate label, role/traits, state, and custom activation behavior.
- Verification: VoiceOver reaches the element, announces name and role, and activates it with the standard gesture; Full Keyboard Access/Switch Control should also reach it.
- False positives / exceptions: Do not flag passive gesture areas when an inner native control is the actual accessible target and the container gesture is redundant/delegated.

### PATTERN-IOS-002: Icon-only control without accessible name
- Platform: iOS
- Framework: SwiftUI | UIKit
- Component type: Icon button / toolbar item / bar button item / row action
- WCAG / Platform: WCAG 4.1.2 Name/Role/Value, VoiceOver, Voice Control
- Severity default: Serious
- Fix type default: SAFE when adding a localized label; FUNCTIONAL-RISK when changing control structure.
- Bad shape: A button, toolbar item, image-based control, SF Symbol, or custom icon action has no meaningful accessible name.
- Detection hints: `Image(systemName:)` inside `Button`; `UIButton` or `UIBarButtonItem` with only an image; missing `.accessibilityLabel`, `accessibilityLabel`, localized title, or label text.
- Correct fix: Provide a localized accessible name that describes the action or content, and hide decorative icons from assistive technologies when needed.
- Verification: VoiceOver announces the intended action and role; Voice Control can target the control by a meaningful name.
- False positives / exceptions: Do not add an accessibility label that conflicts with visible text; prefer the visible localized title when one exists.

### PATTERN-IOS-003: Field uses placeholder as its only label
- Platform: iOS
- Framework: SwiftUI | UIKit
- Component type: TextField / SecureField / TextEditor / UITextField / UITextView
- WCAG / Platform: WCAG 1.3.1 Info and Relationships, WCAG 3.3.2 Labels or Instructions, VoiceOver forms
- Severity default: Serious
- Fix type default: SAFE
- Bad shape: An input relies on placeholder/prompt text as the only field name, so context may disappear after entry or be unclear in review mode.
- Detection hints: `TextField("Email", text:)` without nearby persistent label in SwiftUI; `UITextField.placeholder` without `accessibilityLabel` or visible label in UIKit.
- Correct fix: Provide a persistent visible label or a programmatic label tied to the field context; connect help/error text through clear nearby text, announcement, or field-level accessibility description where appropriate.
- Verification: VoiceOver announces the field name, value, role, and relevant help/error context before and after text entry.
- False positives / exceptions: Search fields and compact controls can be acceptable when a clear localized programmatic label remains available.

### PATTERN-IOS-004: Dynamic Type clipping risk
- Platform: iOS
- Framework: SwiftUI | UIKit
- Component type: Text / Button / Cell / Card / Form row
- WCAG / Platform: WCAG 1.4.4 Resize Text, Dynamic Type
- Severity default: Serious
- Fix type default: RUNTIME-CHECK by default; VISUAL-IMPACT when layout changes are required.
- Bad shape: Text or controls use fixed heights, clipped containers, absolute/manual positioning, one-line assumptions, truncation, dense horizontal layouts, or custom fonts that may not scale at accessibility text sizes.
- Detection hints: SwiftUI `.frame(height:)`, `.frame(width:)`, `.lineLimit(1)`, `.truncationMode(...)`, `.clipped()`, `.clipShape(...)`, `.overlay`, `ZStack`, `.offset`, `.position`, `.minimumScaleFactor(...)`, fixed-height rows/cards/toolbars, dense `HStack` text/icon/button combinations, `.font(.system(size:))`, and `.font(.custom(...))` without a scalable text-style strategy. UIKit `UILabel.numberOfLines = 1`, `lineBreakMode = .byTruncatingTail`/`.byClipping`, `heightAnchor.constraint(equalToConstant:)`, fixed cell/header/footer heights, manual `CGRect`/`frame` layout, `adjustsFontForContentSizeCategory = false`, custom fonts without `UIFontMetrics`, constraints that prevent label growth, reused cells with fixed sizing, and storyboard/xib fixed-height single-line labels.
- Correct fix: Use scalable text styles, `UIFontMetrics` or equivalent design-system scaling, flexible layout, multiline support, vertical fallback for dense rows, enough compression resistance/hugging behavior, and minimum scale only as a last resort for nonessential text.
- Verification: Runtime check with large accessibility Dynamic Type sizes confirms text, controls, row/card contents, and focus outlines remain usable without clipping or overlap.
- False positives / exceptions: Do not flag fixed-size decorative text that is not user-facing or accessibility-relevant. Do not state that overlap is confirmed unless a runtime screenshot, simulator/device check, or rendered output proves it.

### PATTERN-IOS-005: List or collection cell has unclear VoiceOver summary
- Platform: iOS
- Framework: SwiftUI | UIKit
- Component type: List row / UITableViewCell / UICollectionViewCell / Card
- WCAG / Platform: WCAG 1.3.1 Info and Relationships, WCAG 2.4.6 Headings and Labels, VoiceOver reading order
- Severity default: Moderate
- Fix type default: RUNTIME-CHECK when final cell output is dynamic; SAFE when label/value composition is obvious.
- Bad shape: A row/card contains multiple visual labels, values, icons, and actions, but the accessible order or summary is fragmented, missing important values, or hides available actions.
- Detection hints: custom cells, nested SwiftUI stacks in `List`, `accessibilityElement(children: .combine)`, reused cells, row swipe/context actions.
- Correct fix: Provide a coherent row label/value strategy, expose separate interactive children when needed, and add custom actions for row actions that are otherwise gesture-only.
- Verification: VoiceOver reads representative cells in a meaningful order and exposes all actions without requiring visual gestures.
- False positives / exceptions: Do not over-combine cells that contain multiple independent controls; preserve separate controls when each has its own action.

### PATTERN-IOS-006: Color-only state or status
- Platform: iOS
- Framework: SwiftUI | UIKit
- Component type: Badge / Status / Validation / Chart / Selection
- WCAG / Platform: WCAG 1.4.1 Use of Color, Differentiate Without Color, Increase Contrast
- Severity default: Serious
- Fix type default: VISUAL-IMPACT
- Bad shape: Status, selection, validation, chart categories, or availability are communicated only through color.
- Detection hints: color-coded badges, `.foregroundColor(.red)` errors without text/icon, chart legends by color only, selected state shown only by tint.
- Correct fix: Add text, icon shape, pattern, state, or accessible value that communicates the same information without relying on color alone.
- Verification: Inspect visually with Differentiate Without Color/Increase Contrast where applicable and verify VoiceOver announces the state.
- False positives / exceptions: Color can remain as redundant reinforcement when text, icon shape, or accessible state already communicates the meaning.
