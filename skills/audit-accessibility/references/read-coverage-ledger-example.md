# Read-coverage ledger — worked example

A real read-coverage ledger produced by `audit-accessibility` following the "Coverage"
section of `SKILL.md`, over the same large iOS fixture as the map example (IceCubesApp +
`Account` + `Timeline` packages, **101 Swift files**).

It is the header field that makes "no findings here" distinguishable from "not looked at
here": every in-scope file is accounted for as fully-read / partially-read / unread, and
the count reconciles against the map's scope.

```markdown
### Read-coverage ledger (required)

- Fully read (to EOF): 101 / 101 in-scope files. Partially read: 0. Unread: 0.
- Largest file Timeline/.../TimelineViewModel.swift = 719 lines (fit a single window);
  no file required paged chunking. Reconciled against the map's 101-file scope: no gaps.
- The only "not looked at" surfaces are the out-of-scope shared components listed under
  Blind spots — by design, outside the agreed three trees.
```

When a file **does** exceed a single read window, the same ledger reports it honestly —
e.g. on a 3097-line file a single read returns ~46% of the lines, so the Coverage section
requires paging through to EOF and the ledger would read `Partially read: 1` (with the
file named) until the remaining lines are read. The point is the same either way: a
partially-read file is never silently presented as audited.
