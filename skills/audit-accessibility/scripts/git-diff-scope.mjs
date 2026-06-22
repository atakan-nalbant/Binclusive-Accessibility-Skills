#!/usr/bin/env node
// Read-only git-diff scoping helper for CI/CD accessibility runs.
// Computes the set of changed, auditable source files between a base ref and
// HEAD, plus the changed line ranges per file, so map/audit can scope to the
// diff instead of the whole repo. Does git only; semantic usage resolution
// (which pages consume a changed shared component) is left to the skill model,
// which reads the baseline map this script points at.
//
// Usage:
//   node git-diff-scope.mjs [project-root]
// Env:
//   BINCLUSIVE_BASE_REF   explicit base ref (e.g. origin/main, a SHA, a tag)
//   GITHUB_BASE_REF       PR base branch (GitHub Actions) -> origin/<branch>
//   GITHUB_SHA / commit   HEAD is used as the tip in all cases

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? process.cwd());

// Extensions we can statically audit. Anything else in the diff is ignored.
const AUDITABLE = new Set([
  ".tsx", ".jsx", ".ts", ".js", ".mjs", ".cjs", ".vue", ".svelte", // web
  ".cshtml", ".vbhtml", ".aspx", ".ascx", ".master", ".razor", // asp.net / aspx
  ".swift", ".storyboard", ".xib", // ios
]);

function git(args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
}

function tryGit(args) {
  try {
    return git(args).trim();
  } catch {
    return null;
  }
}

function isAuditable(file) {
  return AUDITABLE.has(path.extname(file).toLowerCase());
}

function resolveBaseRef() {
  const notes = [];
  const candidates = [];
  if (process.env.BINCLUSIVE_BASE_REF) candidates.push(process.env.BINCLUSIVE_BASE_REF);
  if (process.env.GITHUB_BASE_REF) {
    candidates.push(`origin/${process.env.GITHUB_BASE_REF}`, process.env.GITHUB_BASE_REF);
  }
  candidates.push("origin/main", "origin/master", "main", "master");

  for (const ref of candidates) {
    if (tryGit(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]) !== null) {
      return { ref, notes };
    }
  }
  // Last resort: previous commit. Flag it loudly — this is not a real PR base.
  if (tryGit(["rev-parse", "--verify", "--quiet", "HEAD~1^{commit}"]) !== null) {
    notes.push("No base branch found; fell back to HEAD~1. Set BINCLUSIVE_BASE_REF for reliable diffs.");
    return { ref: "HEAD~1", notes };
  }
  notes.push("No base ref and no HEAD~1 (shallow/first commit?). Diff scope is empty.");
  return { ref: null, notes };
}

// New-file line ranges from `git diff -U0`, parsed from @@ -a,b +c,d @@ headers.
function changedLineRanges(diffSpec, file) {
  const out = tryGit(["diff", "-U0", "--no-color", diffSpec, "--", file]);
  if (!out) return [];
  const ranges = [];
  for (const line of out.split("\n")) {
    const m = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (!m) continue;
    const start = Number(m[1]);
    const count = m[2] === undefined ? 1 : Number(m[2]);
    if (count === 0) continue; // pure deletion, nothing to audit on the new side
    ranges.push([start, start + count - 1]);
  }
  return ranges;
}

function findBaselineMap() {
  const dir = path.join(root, "Binclusive-auditing");
  if (!existsSync(dir)) return null;
  let entries;
  try {
    entries = readdirSync(dir).filter((name) => name.endsWith("_project-map.md"));
  } catch {
    return null;
  }
  if (entries.length === 0) return null;
  // Most recent by lexical date in filename (<name>_<YYYY-MM-DD>_project-map.md).
  entries.sort().reverse();
  return path.join("Binclusive-auditing", entries[0]).replaceAll(path.sep, "/");
}

const inRepo = tryGit(["rev-parse", "--is-inside-work-tree"]) === "true";
if (!inRepo) {
  process.stdout.write(
    `${JSON.stringify({ projectRoot: root, error: "not-a-git-repo", changedFiles: [] }, null, 2)}\n`,
  );
  process.exit(0);
}

// Parse `git diff --name-status` for a spec into auditable changed files.
function collectDiff(diffSpec) {
  const out = [];
  const raw = tryGit(["diff", "--name-status", "--diff-filter=ACMR", "--no-color", diffSpec]);
  if (!raw) return out;
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("\t");
    const status = parts[0][0]; // A/C/M/R
    const file = parts[parts.length - 1]; // for renames, the new path is last
    if (!isAuditable(file)) continue;
    out.push({ file, status, changedLineRanges: changedLineRanges(diffSpec, file) });
  }
  return out;
}

// Untracked (new, never-committed) auditable files — whole-file audit scope.
function collectUntracked() {
  const raw = tryGit(["ls-files", "--others", "--exclude-standard"]);
  if (!raw) return [];
  return raw
    .split("\n")
    .filter(Boolean)
    .filter(isAuditable)
    .map((file) => ({ file, status: "U", changedLineRanges: [] }));
}

const { ref: baseRef, notes } = resolveBaseRef();
const headSha = tryGit(["rev-parse", "HEAD"]);

// Local pre-commit/pre-push runs want uncommitted edits in scope; CI on a pushed
// branch does not (the checkout is clean). Default = committed-only.
const includeWorking =
  process.argv.includes("--include-working") ||
  process.env.BINCLUSIVE_INCLUDE_WORKING === "1" ||
  process.env.BINCLUSIVE_DIFF_MODE === "working";

let changedFiles = [];
let mode = "committed";
if (baseRef) {
  if (includeWorking) {
    // Two-dot `git diff <base>` = working tree vs base: committed branch changes
    // AND uncommitted staged/unstaged edits in one shot. Plus untracked files.
    mode = "working-tree";
    const byFile = new Map();
    for (const f of collectDiff(baseRef)) byFile.set(f.file, f);
    for (const f of collectUntracked()) if (!byFile.has(f.file)) byFile.set(f.file, f);
    changedFiles = [...byFile.values()];
  } else {
    // Three-dot: changes on HEAD since the merge-base with baseRef (committed only).
    changedFiles = collectDiff(`${baseRef}...HEAD`);
    // Don't silently ignore a dirty working tree — tell the caller what's excluded.
    const committed = new Set(changedFiles.map((f) => f.file));
    const uncommitted = [
      ...collectDiff("HEAD").map((f) => f.file),
      ...collectUntracked().map((f) => f.file),
    ].filter((f, i, a) => a.indexOf(f) === i && !committed.has(f));
    if (uncommitted.length > 0) {
      const shown = uncommitted.slice(0, 20).join(", ");
      notes.push(
        `${uncommitted.length} uncommitted auditable file(s) NOT in scope (committed mode). ` +
          `Commit them, or re-run with --include-working to audit local edits: ` +
          `${shown}${uncommitted.length > 20 ? ", …" : ""}`,
      );
    }
  }
}

const baselineMap = findBaselineMap();
if (!baselineMap) {
  notes.push("No baseline *_project-map.md found; audit must resolve usages of changed files via importer search (diff-only mode).");
} else {
  notes.push(`Baseline map found: ${baselineMap}. Resolve changed-file usages against it before auditing.`);
}
if (changedFiles.length === 0 && baseRef) {
  notes.push("No auditable source files changed against the base ref. CI should pass with no audit needed.");
}

const result = {
  projectRoot: root,
  baseRef,
  headSha,
  mode,
  baselineMap,
  changedFileCount: changedFiles.length,
  changedFiles,
  notes,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
