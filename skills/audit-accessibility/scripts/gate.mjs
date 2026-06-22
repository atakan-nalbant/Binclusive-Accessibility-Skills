#!/usr/bin/env node
// CI gate: parse a Binclusive accessibility TODO report and exit non-zero when
// it contains open findings at or above a severity threshold. This is the step
// that fails a PR check. Read-only; never edits the report or source.
//
// Usage:
//   node gate.mjs [path-to-accessibility-todo.md] [--max-severity=serious]
// Exit codes:
//   0  no open findings at/above the threshold (PR check passes)
//   1  one or more open findings at/above the threshold (PR check fails)
//   2  report missing/unreadable, or an open finding has no parseable Severity

import { readFileSync } from "node:fs";

const RANK = { critical: 4, serious: 3, moderate: 2, minor: 1 };

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--")) ?? "Binclusive-auditing/accessibility-todo.md";
const maxArg = args.find((a) => a.startsWith("--max-severity="));
const threshold = (maxArg ? maxArg.split("=")[1] : "serious").toLowerCase();
if (!RANK[threshold]) {
  console.error(`Unknown --max-severity="${threshold}". Use critical|serious|moderate|minor.`);
  process.exit(2);
}

let text;
try {
  text = readFileSync(file, "utf8").replace(/^﻿/, "");
} catch {
  console.error(`Gate: report not found at "${file}". Run audit-accessibility in diff mode first.`);
  process.exit(2);
}

// Same task-heading shape parse-todo.mjs uses.
const headingRe = /^#{2,4}\s+-?\s*\[[ xX]?\]\s+\[(TASK-\d+)\]\s+(.+)$/gm;
const headings = [...text.matchAll(headingRe)];
const field = (block, name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = block.match(new RegExp(`^-\\s*\\*\\*${escaped}:\\*\\*\\s*(.+)$`, "m"));
  return m ? m[1].trim() : "";
};

const open = [];
const malformed = [];
for (let i = 0; i < headings.length; i += 1) {
  const start = headings[i].index;
  const end = headings[i + 1]?.index ?? text.length;
  const block = text.slice(start, end);
  const id = headings[i][1];
  const title = headings[i][2].trim();
  const status = (field(block, "Status") || "TODO").toLowerCase();
  if (status.includes("done") || status.includes("resolved") || status.includes("fixed")) continue;
  const severity = field(block, "Severity").toLowerCase().replace(/[^a-z]/g, "");
  const rank = RANK[severity] ?? 0;
  // Strict: an open finding with no parseable Severity must not silently pass the
  // gate by scoring as unknown. Treat it as a malformed report (exit 2).
  if (rank === 0) {
    malformed.push({ id, title, severity: severity || "(missing)" });
    continue;
  }
  if (rank >= RANK[threshold]) open.push({ id, title, severity });
}

if (malformed.length > 0) {
  console.error(`Accessibility gate ERROR — ${malformed.length} open finding(s) with missing/unparseable Severity:`);
  for (const f of malformed) console.error(`  ${f.id} severity=${f.severity} — ${f.title}`);
  console.error('Every open TASK heading must carry a "- **Severity:** Critical|Serious|Moderate|Minor" line.');
  process.exit(2);
}

const counts = open.reduce((acc, f) => ((acc[f.severity] = (acc[f.severity] ?? 0) + 1), acc), {});
const summary = Object.entries(counts).map(([s, n]) => `${n} ${s}`).join(", ") || "none";

if (open.length > 0) {
  console.error(`Accessibility gate FAILED — ${open.length} open finding(s) >= ${threshold} (${summary}):`);
  for (const f of open) console.error(`  ${f.id} [${f.severity}] ${f.title}`);
  process.exit(1);
}
console.log(`Accessibility gate passed — no open findings >= ${threshold}.`);
process.exit(0);
