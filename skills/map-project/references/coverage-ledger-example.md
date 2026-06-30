# Coverage ledger — worked example

A real coverage ledger produced by `map-project` following the "Coverage" section of
`SKILL.md`, over a **deliberately large iOS fixture**: the IceCubesApp app target plus
the `Account` and `Timeline` Swift packages — **101 Swift files** in the agreed scope.

This is what "enumerate the full in-scope set, reconcile, surface every gap" looks like
in practice. The denominator (101) comes from an up-front `find` enumeration (and matches
the inspector's per-type counts); the ledger reconciles mapped-vs-total so nothing is
silently sampled away.

```markdown
## Coverage and Blind Spots — COVERAGE LEDGER

Enumerated in-scope total: 101 Swift files (denominator), via `find … -name '*.swift'`:
- IceCubesApp/ = 36, Packages/Account/ = 43, Packages/Timeline/ = 22.

Mapped: 101 / 101. Partially-mapped: 0. Not-yet-mapped: 0.
Reconciled: 36 + 43 + 22 = 101 = enumerated total. No silent omissions.

Non-UI files (Package.swift ×2, test files, view models / fetchers / actors / stores /
types) are still enumerated and accounted for — read to confirm they hold no inline UI
surface — not dropped from the count.

Blind spots / runtime-verification needs (carried to the audit):
1. Out-of-scope shared UI consumed but not mapped: StatusRowExternalView, AvatarView,
   StatusEditor, MediaUI controls, … — they live in DesignSystem/StatusKit/MediaUI/Env
   packages, outside the agreed scope. Status-row accessibility is therefore NOT covered.
2. Contrast/color, VoiceOver order, Dynamic Type, touch targets, sheet focus — RUNTIME-CHECK.
3. Package localization fallback (Account/Timeline ship no catalog) — runtime check.
```

The contrast that matters: a run that silently maps a self-selected subset would present
"73 files" as the whole map with no reconciliation. The ledger above instead states
**101 / 101** against an enumerated denominator, so an in-scope file can never be quietly
reclassified as out-of-scope — and the genuine boundary (shared components in *other*
packages) is named explicitly rather than hidden.
