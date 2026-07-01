#!/usr/bin/env bash
set -euo pipefail

TARGET="all"
REPO=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      TARGET="${2:-}"
      shift 2
      ;;
    --repo)
      REPO="${2:-}"
      shift 2
      ;;
    -h|--help)
      echo "Usage: scripts/install.sh [--target all|codex|claude|copilot|cursor] [--repo /path/to/project]"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

case "$TARGET" in
  all|codex|claude|copilot|cursor) ;;
  *)
    echo "Invalid target: $TARGET" >&2
    exit 1
    ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILLS=(map-project audit-accessibility shopify-theme-audit fix-accessibility)

copy_skill_set() {
  local destination_root="$1"
  mkdir -p "$destination_root"
  for name in "${SKILLS[@]}"; do
    local source="$ROOT/skills/$name"
    local destination="$destination_root/$name"
    if [[ ! -d "$source" ]]; then
      echo "Missing skill source: $source" >&2
      exit 1
    fi
    rm -rf "$destination"
    cp -R "$source" "$destination"
    echo "Installed $name -> $destination"
  done
}

install_copilot_adapter() {
  if [[ -z "$REPO" ]]; then
    echo "Copilot adapter templates are available in adapters/copilot/. Pass --repo /path/to/project to install them into a project."
    return
  fi

  local repo_path
  repo_path="$(cd "$REPO" && pwd)"
  local github_dir="$repo_path/.github"
  local instructions_dir="$github_dir/instructions"
  mkdir -p "$instructions_dir"

  local destination_main="$github_dir/copilot-instructions.md"
  local block_start="<!-- BEGIN BINCLUSIVE ACCESSIBILITY SKILLS -->"
  local block_end="<!-- END BINCLUSIVE ACCESSIBILITY SKILLS -->"
  local body
  body="$(cat "$ROOT/adapters/copilot/copilot-instructions.md")"
  local block
  block="$block_start
$body
$block_end"

  if [[ -f "$destination_main" ]] && grep -q "$block_start" "$destination_main"; then
    python3 - "$destination_main" "$block_start" "$block_end" "$block" <<'PY'
import re
import sys
path, start, end, block = sys.argv[1:5]
text = open(path, encoding="utf-8").read()
pattern = re.escape(start) + r".*?" + re.escape(end)
text = re.sub(pattern, block, text, flags=re.S)
open(path, "w", encoding="utf-8").write(text)
PY
  elif [[ -f "$destination_main" ]]; then
    printf '\n\n%s\n' "$block" >> "$destination_main"
  else
    printf '%s\n' "$block" > "$destination_main"
  fi

  cp "$ROOT/adapters/copilot/.github/instructions/binclusive-accessibility.instructions.md" "$instructions_dir/binclusive-accessibility.instructions.md"
  echo "Installed Copilot adapter -> $github_dir"
}

install_cursor_adapter() {
  if [[ -z "$REPO" ]]; then
    echo "Cursor adapter templates are available in adapters/cursor/. Pass --repo /path/to/project to install them into a project."
    return
  fi

  local repo_path
  repo_path="$(cd "$REPO" && pwd)"
  local rules_dir="$repo_path/.cursor/rules"
  mkdir -p "$rules_dir"

  cp "$ROOT/adapters/cursor/.cursor/rules/binclusive-accessibility.mdc" "$rules_dir/binclusive-accessibility.mdc"
  echo "Installed Cursor adapter -> $rules_dir"
}

if [[ "$TARGET" == "all" || "$TARGET" == "codex" ]]; then
  copy_skill_set "$HOME/.agents/skills"
fi

if [[ "$TARGET" == "all" || "$TARGET" == "claude" ]]; then
  copy_skill_set "$HOME/.claude/skills"
fi

if [[ "$TARGET" == "all" || "$TARGET" == "copilot" ]]; then
  install_copilot_adapter
fi

if [[ "$TARGET" == "all" || "$TARGET" == "cursor" ]]; then
  install_cursor_adapter
fi
