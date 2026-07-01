---
id: 0001
title: Shard Mode fan-out is portable across harnesses (capability-detected)
status: accepted
date: 2026-07-01
tags: [skills, audit, portability]
---

# 0001 — Shard Mode Fan-Out Is Portable Across Harnesses

## Context

Shard Mode — subagent fan-out for the audit skill — was added in #19 (commit
`bcfb8e3`). As shipped, its parallelism was gated entirely on the Claude Code `Task` tool:
`skills/audit-accessibility/SKILL.md` ("Harness capability") stated that fan-out "requires
a harness that can spawn parallel subagents (the Claude Code `Task` tool)," and that the
Copilot, Codex, and OpenAI (`agents/openai.yaml`) adapters cannot — so every non-Claude
harness fell back to single-agent even under an explicit `--shard`.

Issue #21 (`type:decision`, p2) framed this as a fork to settle:

- **Option A — build a portable path.** Abstract "spawn a subagent per shard" behind a
  harness-neutral capability check so any runtime that supports parallel sub-tasks can opt
  in, instead of hardcoding the `Task` tool.
- **Option B — accept & document.** Ratify fan-out as an intentional Claude-Code-only
  optimization.

This repository keeps **one canonical skill source** and ships thin adapters for Claude
Code, GitHub Copilot, Codex, and (via `agents/openai.yaml`) OpenAI, with Cursor as a
target runtime. Portability across those harnesses is a first-class product value here — a
capability that only works on one vendor's runtime is a capability the adapters cannot
honestly advertise. Correctness is preserved on every harness either way by the
read-coverage ledger; the open question was whether the *throughput* win should be portable
too.

## Decision

Adopt **Option A**. Shard Mode fan-out is **portable across harnesses by capability
detection, not vendor lock**. Fan-out requires exactly one capability — the ability to
spawn parallel sub-tasks — and the skill maps that capability onto **whatever
parallel-subtask primitive the active harness exposes**:

- **Claude Code** — the `Task` tool.
- **GitHub Copilot** — its parallel agent / sub-task primitive where the runtime exposes
  one.
- **Cursor** — background / parallel agents.
- **Codex / OpenAI (`agents/openai.yaml`)** — concurrent tool-call fan-out.

If the active harness exposes **any** such primitive, the skill fans out through it; the
fan-out procedure and deterministic merge are identical whichever primitive is used. Only a
harness that exposes **no** parallel-subtask primitive at all falls back to single-agent
(same report shape, one-line note), even under an explicit `--shard`. A new harness that
gains a parallel-subtask primitive gets fan-out for free, with no edit to the capability
gate.

This supersedes the Claude-Code-only framing that #19 shipped and that issue #21's Option B
would have ratified.

## Consequences

- **What this makes easier.** Copilot, Cursor, Codex, and OpenAI runs get the same
  large-map throughput win as Claude Code wherever their runtime can run sub-tasks in
  parallel — the runs that most need parallelism no longer silently take the slow path on
  non-Claude harnesses. The value is stated by capability, so the adapters can advertise it
  honestly.
- **What this costs.** The capability gate is now "detect a parallel-subtask primitive,"
  which is a softer contract than naming one tool: each harness's exact primitive (and
  whether it is reliable enough to fan out through) is a per-runtime judgment the skill
  makes at run time. Where a harness's primitive is absent or unreliable, the single-agent
  fallback still applies — so the guarantee is "fan out where the runtime genuinely
  supports it," never "fan out everywhere."
- **Correctness is unchanged.** The read-coverage ledger keeps every run honest on every
  harness (`skills/audit-accessibility/SKILL.md`, "Coverage" and the fan-out merge step):
  fan-out only ever *adds* parallelism to the portable single-agent baseline, so the
  portability change touches wall-clock/attention-budget, never findings.
- **README (#20).** The Shard Mode section, once it lands, must describe fan-out as
  capability-detected and portable — not Claude-Code-only. Called out on #21 so #20 matches
  this ADR.
- **Cursor adapter shipped (#25).** The Cursor entry above was prose-only when this ADR
  landed — named as a target runtime with no adapter surface in the repo. Issue #25 settled
  that gap as **Option A (build the adapter)**: `adapters/cursor/.cursor/rules/binclusive-accessibility.mdc`
  (installed by the `cursor` target in `scripts/install.sh` / `install.ps1`) now backs the
  Cursor claim, so every harness this ADR names is carried by a real adapter that loads the
  canonical `SKILL.md`.
- **When to revisit.** If a targeted harness's parallel-subtask primitive proves
  unreliable enough that fan-out there degrades correctness rather than just throughput,
  narrow the capability gate for that harness (fall back to single-agent) and record it as
  a superseding note here.
