# Mapper Web Reference: ASP.NET / ASPX

Use this reference when `map-project` is triggered for an ASP.NET MVC/Razor, Razor Pages, or ASPX/Web Forms application. The mapper observes and documents only; it never edits source code.

## Step 0: Establish Context

First, run the read-only project inspector if available:

```bash
node map-project/scripts/inspect-project.mjs /path/to/project
```

Treat the inspector JSON as discovery input, not as proof. Verify signals by reading the actual project files.

Determine these facts before asking the user:

- Application model: ASP.NET Web Forms, ASP.NET MVC, Razor Pages, mixed legacy ASP.NET, or ASP.NET Core.
- Language: C#, VB.NET, Razor, ASPX markup, JavaScript, TypeScript, or mixed.
- Routing model: Web Forms file paths, `RouteConfig`, MVC controllers/actions, Razor Pages routes, endpoint routing, or custom rewrites.
- Layout/master structure: `.master`, `_Layout.cshtml`, shared partials, user controls, themes, and content placeholders.
- Localization: `.resx` resources, `App_GlobalResources`, `App_LocalResources`, culture providers, route culture, and `dir` handling.
- Client-side stack: jQuery, Bootstrap, ASP.NET AJAX, Telerik/Kendo/DevExpress, validation plugins, bundling/minification, or custom scripts.

If the model or routing remains ambiguous after inspection, ask for the app type and the pages/views/components locations.

## User Scope Questions

Ask these when the user did not already provide scope:

1. Should I map the whole project, selected pages/routes, selected controls/components, a folder path, or a free-form target list?
2. Should localization/hardcoded string hotspots be included? Default: yes.
3. Should server-rendered markup plus client-side scripts be mapped together? Default: yes.

## Project and Dependency Analysis

Read relevant manifests and configuration files when present:

- Solution/project files: `.sln`, `.csproj`, `.vbproj`.
- ASP.NET config: `web.config`, `Global.asax`, `Startup.cs`, `Program.cs`, `RouteConfig.cs`, `BundleConfig.cs`, `packages.config`.
- Package manifests: `packages.config`, `PackageReference`, `libman.json`, `bower.json`, `package.json`.

Classify dependencies as:

- `A11Y-RELEVANT`: UI component suites, modal/dialog libraries, date pickers, validation libraries, grids, charts, menus, carousels, media players, AJAX update panels, icon libraries.
- `L10N-RELEVANT`: resource managers, globalization settings, culture providers, formatting helpers, RTL/bidi helpers.
- `NEUTRAL`: unrelated build, data, network, logging, or utility packages.

## Localization Detection

Look for:

- `.resx` files under `App_GlobalResources`, `App_LocalResources`, `Resources`, or feature folders.
- `meta:resourcekey`, `<%$ Resources: ... %>`, `ResourceManager`, strongly typed resource classes, `IStringLocalizer`, and `IHtmlLocalizer`.
- `web.config` globalization settings, culture providers, route culture, and thread culture setup.
- Hardcoded visible strings in `.aspx`, `.ascx`, `.master`, `.cshtml`, `.vbhtml`, `.js`, and server code that sets UI text.

If no localization setup is found, record `NONE - strings appear hardcoded` and flag user-facing literals for later review.

## Route, Page, and View Detection

Enumerate the mapped scope:

- Web Forms: `.aspx` pages, `.ascx` user controls, `.master` master pages, `SiteMap`, `Global.asax`, and custom route registration.
- ASP.NET MVC: `Controllers/**/*Controller.cs`, `Views/**/*.cshtml`, `Views/Shared`, areas, `RouteConfig`, and filters that affect layout/title/culture.
- Razor Pages / ASP.NET Core: `Pages/**/*.cshtml`, `_ViewStart`, `_ViewImports`, `Program.cs`, endpoint routing, and shared partials.
- Static assets that shape UI: `Content/`, `Scripts/`, `wwwroot/`, bundles, themes, and generated client templates.

If no route system is discoverable and no path was provided, ask the user for the pages/views folder.

## Shared UI Inventory

Find likely shared UI roots such as `UserControls/`, `Controls/`, `Views/Shared/`, `Shared/`, `Pages/Shared/`, `App_Code/`, `Components/`, `Content/`, `Scripts/`, and third-party component wrappers.

For each relevant control/component, record:

- Name and verified file path.
- Type: Button, Link, Input, Select, Grid, Dialog, Modal, Menu, Tabs, Accordion, Carousel, Image, Icon, Table, Chart, Validator, UpdatePanel, etc.
- Whether it renders native HTML, ASP.NET server controls, Razor helpers/tag helpers, third-party controls, or custom JavaScript.
- Whether visible text comes from resources, server properties, data binding, or hardcoded markup.
- Which mapped pages/views include or render it, when statically discoverable.

## Inline UI Inventory

For each mapped page/view, record inline markup and scripts:

- ASP.NET server controls and their rendered semantics where inferable.
- Interactive handlers: `OnClick`, `OnClientClick`, JavaScript event binding, postbacks, AJAX callbacks.
- Forms, validators, validation summaries, and error messaging.
- Links/navigation, menus, breadcrumbs, skip links, landmarks, headings, and page titles.
- Modals, popovers, tooltips, tabs, accordions, grids, date pickers, and update panels.
- Images, sprites, icon fonts, SVG, video/audio, canvas/charts.
- Hardcoded visible text and hardcoded `aria-label`, `placeholder`, `title`, `alt`, `ToolTip`, `Text`, and `HeaderText`.

Record file path, approximate line range, element/control type, interactivity, existing a11y props, localization status, and notes.

## Output File

Write one file in project-root `Binclusive-auditing/` named `<project-name>_<YYYY-MM-DD>_project-map.md`.

Required sections:

1. Header: app, date, mapper, scope, framework/model, language, routing, layout/master, styling, localization, directories, totals.
2. Dependencies: table of relevant packages and concerns.
3. Localization setup: resources, cultures, fallback, RTL, lookup mechanism.
4. Pages / Views / Routes: page and route inventory.
5. Shared Controls / Components: control inventory.
6. Inline UI Inventory: per-page inline UI table.
7. Client Script Inventory: UI-affecting JavaScript and event binding hotspots.
8. Coverage and Blind Spots: generated markup, third-party controls, runtime-only concerns, excluded paths.
9. How to Use This File: instructions for `audit-accessibility`.

## Non-Negotiable Rules

- Do not modify source files.
- Do not install dependencies.
- Do not invent paths, package names, controls, line numbers, routes, or rendered output.
- Mark generated/runtime markup as `needs runtime verification` unless rendered output is available.
- Keep customer-provided examples out of the skill package unless they have been anonymized into generic patterns.
