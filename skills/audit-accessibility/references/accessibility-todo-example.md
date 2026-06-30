# Accessibility Audit TODO Example — Synthetic

- **Date:** 2026-06-09
- **Auditor:** AUDITOR-WEB-A11Y
- **App:** `example-web-app`
- **Framework:** Next.js / React
- **Map file used:** `example-web-app_2026-06-09_project-map.md`
- **Scope:** synthetic example components only
- **Read-coverage ledger:** fully-read 3 / 3 · partially-read 0 · unread 0 (no in-scope file exceeded a single read window; nothing left unread)

## Summary

- **Items audited:** 3 synthetic examples
- **Findings:** 3
- **Severity counts:** Critical 1 · Serious 2 · Moderate 0 · Minor 0
- **Fix Type counts:** `SAFE` 1 · `VISUAL-IMPACT` 0 · `FUNCTIONAL-RISK` 1 · `RUNTIME-CHECK` 1

### Summary table

| # | Title | Component / Page | File | Severity | Fix Type | Status |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-001 | Icon-only button has no accessible name | `ExampleIconButton` | `src/components/ExampleIconButton.tsx` | Serious | SAFE | TODO |
| TASK-002 | Custom modal requires runtime focus verification | `ExampleModal` | `src/components/ExampleModal.tsx` | Serious | RUNTIME-CHECK | TODO |
| TASK-003 | Clickable wrapper is not keyboard-accessible | `ExampleInput` | `src/components/ExampleInput.tsx` | Critical | FUNCTIONAL-RISK | TODO |

---

## Findings — Critical

### - [ ] [TASK-003] Clickable wrapper is not keyboard-accessible
- **Component / Page:** `ExampleInput` (shared component)
- **File path:** `src/components/ExampleInput.tsx`
- **Used in pages:** `/example-form`
- **Severity:** Critical
- **Code block in question:**
```jsx
<div className="inputShell" onClick={focusInput}>
  <input id="email" name="email" />
</div>
```
- **Problem (detailed):** The wrapper behaves like an interactive target but is not focusable and has no keyboard activation. This can block keyboard-only users from triggering the same behavior available to pointer users.
- **Correct solution:** Move the behavior to the native input/label relationship or use a real button when a separate control is required.
- **Fix Type:** FUNCTIONAL-RISK
- **Verification:** Keyboard Tab order reaches the real input; clicking the label focuses the input; no extra non-semantic focus target is introduced.
- **Status:** TODO

## Findings — Serious

### - [ ] [TASK-001] Icon-only button has no accessible name
- **Component / Page:** `ExampleIconButton` (shared component)
- **File path:** `src/components/ExampleIconButton.tsx`
- **Used in pages:** `/example-dashboard`
- **Severity:** Serious
- **Code block in question:**
```jsx
<button type="button" onClick={onClose}>
  <CloseIcon />
</button>
```
- **Problem (detailed):** The button has no discernible accessible name. Screen-reader users will hear only a generic button.
- **Correct solution:** Add a localized accessible name describing the action and hide the decorative icon.
```jsx
<button type="button" aria-label={labels.close} onClick={onClose}>
  <CloseIcon aria-hidden="true" focusable="false" />
</button>
```
- **Fix Type:** SAFE
- **Verification:** Accessibility tree exposes the button name as the intended localized close action.
- **Status:** TODO

### - [ ] [TASK-002] Custom modal requires runtime focus verification
- **Component / Page:** `ExampleModal` (shared component)
- **File path:** `src/components/ExampleModal.tsx`
- **Used in pages:** `/example-settings`
- **Severity:** Serious
- **Code block in question:**
```jsx
<div role="dialog" aria-modal="true" aria-labelledby="settings-title">
  <h2 id="settings-title">Settings</h2>
  {children}
</div>
```
- **Problem (detailed):** Static code shows dialog semantics, but focus move, focus trap, Escape close, and focus restore cannot be confirmed without runtime testing.
- **Correct solution:** Verify runtime focus behavior and add focus management if missing.
- **Fix Type:** RUNTIME-CHECK
- **Verification:** Open the modal with keyboard, confirm focus moves inside, Tab/Shift+Tab stay inside, Escape closes, and focus returns to the trigger.
- **Status:** TODO
