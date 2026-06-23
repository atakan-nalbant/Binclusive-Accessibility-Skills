# Python Accessibility Audit Notes

Use this reference only for Python projects. Python has **no single UI model**: a
`.py` file may be a desktop GUI, a web backend that emits HTML, a CLI/TUI, a docs
generator, or a pure library with no user-facing surface at all. So the first job
is always to **classify the accessibility surface honestly**. Do not assume a UI
exists, and do not fabricate findings where there is nothing to fix. The auditor
observes and documents only; it never edits source code.

## Privacy Boundary

User-provided audit documents may be read as inspiration during skill creation
only. Do not copy customer data into skill resources. Store only anonymized,
reusable patterns. Do not persist real customer names, package identifiers,
domains, internal URLs, proprietary module or screen names, ticket IDs, business
copy, screenshots, or exact customer source paths from customer artifacts.

## Classify the surface first

Read the project — manifests (`pyproject.toml`, `setup.py`, `requirements.txt`),
imports across the dominant modules, and what the code actually renders or prints.
Decide which surfaces are present. A project may have **more than one** (e.g. a
Flask app with a CLI admin tool); audit each present surface with its section
below. State the classification at the top of the audit, with the evidence (which
imports, which files) that decided it.

1. **Desktop GUI** — imports of `tkinter`, `PyQt5`/`PyQt6`, `PySide2`/`PySide6`,
   `wx` (wxPython), `kivy`, or `toga`. The accessibility surface is the widget
   tree. See "Desktop GUI toolkits".
2. **Web backend rendering HTML** — `flask`, `django`, `fastapi` with a template
   engine, `jinja2`, `aiohttp`/`starlette` templates, or any code returning HTML
   strings. The user-facing accessibility lives in the **generated HTML**, not the
   Python. Apply the web checklist to the templates. See "Web backend rendering
   HTML".
3. **CLI / TUI** — `argparse`, `click`, `typer`, `rich`, `textual`, `curses`,
   `blessed`, `prompt_toolkit`, or raw `print()` with ANSI escapes. The surface is
   the terminal output and the screen reader's ability to parse it. See "CLI / TUI
   tools".
4. **Generated user-facing docs / HTML** — Sphinx, MkDocs, `pdoc`, Jinja-built
   static sites, report generators emitting HTML or Markdown. Audit the generated
   output. See "Generated docs / HTML output".
5. **Pure non-UI library / script / data tool** — a package, data pipeline,
   numerical/ML code, or a script whose only output is to files, a database, or a
   return value, with no human-facing presentation layer. **Say so** (see the
   Honesty rule). There is little to no static accessibility surface; do not
   invent one.

## Desktop GUI toolkits

Desktop accessibility is exposed to the OS accessibility API (UIA on Windows,
AT-SPI on Linux, NSAccessibility on macOS). What you can prove statically is
whether each widget has been given a name, a reachable focus path, and an exposed
state. What you **cannot** prove statically — real screen-reader output, actual
focus order at runtime, focus traps in modal dialogs, contrast of themed colours,
hit-target size — is `RUNTIME-CHECK`.

### Accessible name / label

- Every actionable widget (button, checkbox, radio, menu item, slider, entry/text
  field, combobox, list, tab) needs a programmatic accessible name. Visible text
  usually supplies it; an **icon-only** or image-only control does not — it needs
  an explicit name. Flag the unnamed control (`SAFE` — adds semantics only).
- Toolkit specifics for the name:
  - **Qt (PyQt/PySide)**: `widget.setAccessibleName(...)` and, for longer
    description, `widget.setAccessibleDescription(...)`. A `QPushButton` with only
    an icon (`setIcon` and no text) and no `setAccessibleName` is unnamed — flag
    it. Setting visible text via `setText` is the native route.
  - **wxPython**: a control's label normally names it; for custom-drawn or
    icon-only controls, a `wx.Accessible` subclass supplies `GetName`. A
    `wx.BitmapButton` with no `SetName`/label is unnamed.
  - **Kivy / Toga**: accessibility support is partial. Where the toolkit exposes a
    name property, require it on actionable widgets; where it does not, the barrier
    is a runtime/toolkit limitation — record it as `RUNTIME-CHECK` and say the
    platform cannot expose the name.
  - **tkinter**: tkinter has **very limited native accessibility** — most widgets
    do not expose names to the OS API reliably. Do not claim a tkinter widget is
    accessible from static code. Where a label is associated with an input, note
    it; otherwise flag the missing association as `SAFE` only if the toolkit
    supports it, and mark the *screen-reader exposure* itself as `RUNTIME-CHECK`.
- An `Entry`/text field needs an associated, programmatically linked label — not
  merely a `Label` placed nearby. A field whose only "label" is adjacent placement
  is unnamed to assistive technology (`SAFE` where the toolkit links labels;
  otherwise `RUNTIME-CHECK`).

### Keyboard operability and focus order

- Every control a mouse can operate must be reachable and operable by keyboard
  (Tab to it, Space/Enter to activate). Custom widgets that bind only mouse events
  (`<Button-1>`, `mousePressEvent`, `Bind(wx.EVT_LEFT_DOWN, ...)`) with no keyboard
  binding are keyboard-inaccessible — flag (`FUNCTIONAL-RISK`; it adds a handler /
  changes behaviour).
- Widgets explicitly removed from the tab order (`setFocusPolicy(Qt.NoFocus)`,
  `takefocus=0`, disabled `AcceptsFocus`) while still being interactive are a
  barrier — flag.
- **Actual focus order** and whether a modal dialog **traps** focus correctly
  cannot be read from static code — that is `RUNTIME-CHECK`. Provide the manual
  steps (Tab through the dialog with a screen reader; confirm focus stays inside
  and returns to the opener on close).

### Exposed state

- Toggle/selection state must be exposed, not just painted. A custom toggle that
  changes only its colour or icon to show on/off, with no state property set
  (`setChecked`, a state update, an accessible state), is a barrier — flag (`SAFE`
  if the fix only sets a state property; `FUNCTIONAL-RISK` if it restructures the
  widget).
- Disabled, expanded/collapsed, and busy states should use the toolkit's native
  state (`setEnabled(False)`, expanded properties) so assistive technology
  announces them.

### Images / icons / text alternatives

- A meaningful image or icon needs a text alternative (the toolkit's accessible
  name/description). A **decorative** image should be hidden from assistive
  technology where the toolkit allows it, not given a fake name — do not invent a
  label like "image".

### Runtime-only for GUI (always `RUNTIME-CHECK`)

- Colour contrast of themed text/controls; visible focus indicator; real
  screen-reader announcement order; focus return after dialogs; hit-target size;
  reflow/zoom behaviour. Write the verification steps; never guess these.

## CLI / TUI tools

A terminal program is accessible when a screen reader can read its output as plain,
structured, labelled text — and when nothing essential is conveyed by colour,
emoji, box-drawing, or animation **alone**. Map these to general usability /
terminal accessibility (there is no WCAG number for a TTY), and use WCAG only where
the tool also emits HTML or docs.

### Meaning must not depend on colour / emoji / glyphs alone

- Status conveyed only by colour (red text == error, green == ok) with no word is
  invisible to a screen reader and to colour-blind users. Pair it with text:
  `Error: ...` / `OK: ...`. Flag a colour-only status (`VISUAL-IMPACT` if the fix
  adds visible text; `RUNTIME-CHECK` for the contrast of the colour itself).
- Meaning conveyed only by an emoji or a box-drawing glyph (e.g. a bare check mark
  with no word) is unreliable across screen readers — pair the glyph with a word.
  Flag.
- ANSI styling (bold/underline) must not be the **only** carrier of essential
  information — its semantics are not announced.

### Provide a plain / no-colour mode

- A well-behaved CLI offers a `--no-color`/`--plain` flag and/or honours the
  `NO_COLOR` environment variable and `not sys.stdout.isatty()` (auto-disable
  styling when piped or redirected). Code that hardcodes ANSI escapes with no way
  to disable them is a barrier for assistive-technology users who pipe output —
  flag (`FUNCTIONAL-RISK`; it changes output behaviour).

### Structured, labelled output

- Tabular or key/value output should be labelled, not positional-only. A bare grid
  of numbers a screen reader reads as one run is hard to parse; prefer
  `Name: value` lines or a labelled table. `rich.Table` with column headers is
  fine; raw aligned columns with no header row are weaker — note it.
- Errors and prompts should be self-describing text (what failed, what input is
  expected), not just a symbol or a colour change.

### Progress / spinners must be announced, not only animated

- A spinner or progress **bar** that only animates conveys nothing to a screen
  reader; periodic textual progress (`Processing 3/10...`, `Done.`) is needed. Flag
  animation-only progress. Whether a given terminal/AT announces a live region is
  `RUNTIME-CHECK` — give the manual verification.
- Output that overwrites the line with carriage returns can spam or starve a screen
  reader; a `--plain` line-by-line mode mitigates it.

### TUI specifics (textual / curses / prompt_toolkit)

- `textual` exposes more semantics than raw `curses`; still, focus order, keyboard
  reachability of every actionable widget, and a labelled name for each are
  required. Whether the TUI is actually announced by a screen reader is
  `RUNTIME-CHECK` (curses apps are frequently opaque to assistive technology — say
  so).
- Every action must have a keyboard path (TUIs are keyboard-first by nature, so
  verify no action is mouse-only).

## Web backend rendering HTML

If the project serves HTML (Flask/Jinja, Django templates, FastAPI + templates, or
hand-built HTML strings), the user-facing accessibility is in the **rendered
markup**. Apply the web checklist in `auditor-web-a11y.md` to the templates and any
HTML the Python emits:

- Template files: `*.html`, `*.jinja`, `*.j2`, Django `templates/`. Audit heading
  and landmark structure, form `<label>` associations, `alt` on `<img>`, link and
  button text, `<html lang>`, table headers, and ARIA only where native HTML cannot
  do it.
- **Dynamic / string-built HTML in Python**: when Python concatenates or formats
  HTML (`f"<img src={...}>"`, `render_template_string`, building `<a>`/`<button>`
  markup), the web rules apply to that Python line — quote the Python snippet, cite
  its file/line, and map to the WCAG criterion the missing markup breaks (e.g. an
  `<img>` built with no `alt` is `1.1.1`).
- Server-set response headers that affect accessibility (e.g. `Content-Language` /
  the document `lang`) belong here too where the template cannot set them.

Use the web reference's severities, fix types, and WCAG mappings for everything
rendered to the browser; do not re-derive them here.

## Generated docs / HTML output

For Sphinx, MkDocs, `pdoc`, report generators, or any tool whose **output** is HTML
or Markdown for humans, audit the generated artefact (or the templates that produce
it) for:

- Logical heading order (one `<h1>`, no skipped levels), landmarks, and a document
  `lang`.
- `alt` text on content images; empty `alt` for decorative ones.
- Descriptive link text (no bare "click here" / "read more" as the only text).
- Table headers (`<th>` / `scope`) for data tables.
- Map these to WCAG (`1.1.1`, `1.3.1`, `2.4.4`, `2.4.6`, `3.1.1`) since the output
  is web content. Defer to `auditor-web-a11y.md` for the HTML detail.

If only Markdown source exists (not yet rendered), audit structure (headings, alt
text, link text) and note that final conformance depends on the generated HTML —
`RUNTIME-CHECK` for anything you cannot see rendered.

## Honesty rule

This reference exists so the audit behaves sensibly on a **lone `.py` file or a
pure library**, not so it manufactures findings.

- **If the project is a pure non-UI library, a script, or a data/numerical tool
  with no human-facing presentation**, say so plainly: report that the **static
  accessibility surface is limited or absent**, and explain *why* (e.g. "the
  package exposes only functions returning data; there is no GUI, no HTML output,
  and no terminal presentation beyond standard exceptions"). Do **not** flag log
  lines, exception messages, or internal `print` debugging as accessibility
  defects.
- **Still audit any real surface that does exist**: if that same library ships a
  `--help` CLI, a Jinja email template, a localization/HTML asset, or a docs site,
  audit *those* with the relevant section above.
- **Map honestly**: use WCAG where a web/docs/HTML surface exists; use general
  usability where the surface is CLI or GUI (no WCAG number applies to a TTY or a
  native widget tree — say "general usability / terminal accessibility" or the OS
  accessibility-API expectation instead of inventing a WCAG citation).
- **Mark runtime-dependent claims `RUNTIME-CHECK`** and write the manual steps:
  real screen-reader output (NVDA/JAWS/VoiceOver/Orca), actual focus order and
  traps, colour contrast, target size, terminal announcement of live progress.
  Never guess these from static code, and never call the project accessible.

When in doubt, quote less and classify more honestly: a smaller, grounded set of
findings plus an accurate scope statement is correct; a long list of fabricated GUI
findings on a headless library is a failure.

## Output

Write `Binclusive-auditing/accessibility-todo.md` and a dated archive copy. Use
`accessibility-todo-format.md` for the exact structure. In the platform impact field
or problem text, connect findings to the relevant WCAG principle (for web/docs
surfaces) or to the OS accessibility API / general terminal-accessibility
expectation (for GUI/CLI surfaces). Name the assistive technology only when
runtime verification was actually performed; otherwise mark the item as
`RUNTIME-CHECK` and provide manual verification steps.
