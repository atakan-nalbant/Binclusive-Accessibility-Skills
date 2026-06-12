#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? process.cwd());
const MAX_FILES = 20000;
const SKIP_DIRS = new Set([
  ".git",
  ".next",
  ".expo",
  ".turbo",
  ".vercel",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "Pods",
  "DerivedData",
  ".gradle",
]);

function safeRead(file, maxBytes = 200000) {
  try {
    const text = readFileSync(file, "utf8");
    return text.length > maxBytes ? text.slice(0, maxBytes) : text;
  } catch {
    return null;
  }
}

function safeJson(file) {
  const text = safeRead(file);
  if (text === null) return null;
  try {
    return JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}
function stripLineComments(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n");
}

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, "/") || ".";
}

function walk(dir, out = []) {
  if (out.length >= MAX_FILES) return out;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (out.length >= MAX_FILES) break;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function hasDir(relativePath) {
  try {
    return statSync(path.join(root, relativePath)).isDirectory();
  } catch {
    return false;
  }
}

function hasFile(relativePath) {
  return existsSync(path.join(root, relativePath));
}

function depsOf(pkg) {
  return {
    ...pkg?.dependencies,
    ...pkg?.devDependencies,
    ...pkg?.peerDependencies,
    ...pkg?.optionalDependencies,
  };
}

function pickDeps(deps, names) {
  return names
    .filter((name) => deps[name])
    .map((name) => ({ name, version: deps[name] }));
}

function detectPackageManagers(files) {
  const names = new Set(files.map((file) => rel(file)));
  const managers = [];
  if (names.has("pnpm-lock.yaml")) managers.push("pnpm");
  if (names.has("package-lock.json")) managers.push("npm");
  if (names.has("yarn.lock")) managers.push("yarn");
  if (names.has("bun.lockb") || names.has("bun.lock")) managers.push("bun");
  if ([...names].some((name) => name.endsWith("Package.swift") || name.endsWith("Package.resolved"))) {
    managers.push("swift-package-manager");
  }
  if (
    names.has("gradlew") ||
    names.has("gradlew.bat") ||
    [...names].some((name) => /(^|\/)(settings\.gradle|settings\.gradle\.kts|build\.gradle|build\.gradle\.kts)$/.test(name))
  ) {
    managers.push(names.has("gradlew") || names.has("gradlew.bat") ? "gradle-wrapper" : "gradle");
  }
  if (
    [...names].some((name) => /(^|\/)packages\.config$/.test(name)) ||
    [...names].some((name) => /\.(csproj|vbproj|fsproj)$/.test(name))
  ) {
    managers.push("nuget");
  }
  return managers;
}

function detectWeb(files, pkg) {
  const deps = depsOf(pkg);
  const fileSet = new Set(files.map((file) => rel(file)));
  const configFiles = [...fileSet].filter((name) =>
    /^(next|vite|remix|gatsby|tailwind|postcss|tsconfig|jsconfig)\.|\.(babelrc)$/.test(name),
  );

  const framework =
    deps.next || [...fileSet].some((name) => name.startsWith("next.config."))
      ? "next"
      : deps.vite || [...fileSet].some((name) => name.startsWith("vite.config."))
        ? "vite"
        : deps["@remix-run/react"]
          ? "remix"
          : deps.gatsby
            ? "gatsby"
            : deps["react-scripts"]
              ? "create-react-app"
              : deps.react
                ? "react"
              : null;
  const webLikely = framework !== null || Boolean(deps.react) || Boolean(deps["react-dom"]);

  const routingSignals = [];
  if (webLikely) {
    for (const candidate of ["app", "src/app", "pages", "src/pages", "app/routes", "src/routes"]) {
      if (hasDir(candidate)) routingSignals.push({ type: "directory", path: candidate });
    }
  }
  if (deps["react-router-dom"]) {
    routingSignals.push({
      type: "dependency",
      name: "react-router-dom",
      version: deps["react-router-dom"],
    });
  }

  const componentDirCandidates = [
    "components",
    "src/components",
    "app/components",
    "src/ui",
    "src/shared",
    "src/common",
    "packages/ui",
  ].filter(hasDir);

  const i18nDeps = pickDeps(deps, [
    "next-intl",
    "i18next",
    "react-i18next",
    "next-i18next",
    "react-intl",
    "@formatjs/intl",
    "@lingui/react",
  ]);
  const i18nSignals = [
    ...i18nDeps.map((dep) => ({ type: "dependency", ...dep })),
    ...["locales", "src/locales", "messages", "src/messages", "translations", "src/translations", "lang"].filter(hasDir).map((dir) => ({
      type: "directory",
      path: dir,
    })),
    ...[...fileSet]
      .filter((name) => name.includes("[locale]") || /i18n\.(js|ts|mjs|cjs)$/.test(name))
      .slice(0, 50)
      .map((name) => ({ type: "file", path: name })),
  ];

  const stylingSignals = [];
  if (deps.tailwindcss || [...fileSet].some((name) => name.startsWith("tailwind.config."))) {
    stylingSignals.push({ type: "tailwind" });
  }
  if (deps["styled-components"]) stylingSignals.push({ type: "styled-components", version: deps["styled-components"] });
  if (deps["@emotion/react"] || deps["@emotion/styled"]) stylingSignals.push({ type: "emotion" });
  if ([...fileSet].some((name) => name.endsWith(".module.css") || name.endsWith(".module.scss"))) {
    stylingSignals.push({ type: "css-modules" });
  }

  const a11yRelevantDependencies = pickDeps(deps, [
    "@radix-ui/react-dialog",
    "@radix-ui/react-popover",
    "@radix-ui/react-tooltip",
    "@radix-ui/react-select",
    "@headlessui/react",
    "@mui/material",
    "@chakra-ui/react",
    "antd",
    "react-hook-form",
    "formik",
    "framer-motion",
    "react-window",
    "react-virtualized",
    "embla-carousel-react",
    "swiper",
    "recharts",
    "react-icons",
    "lucide-react",
  ]);

  return {
    packageJson: pkg === null ? null : "package.json",
    configFiles,
    framework,
    reactVersion: deps.react ?? null,
    routingSignals,
    componentDirCandidates,
    i18nSignals,
    stylingSignals,
    a11yRelevantDependencies,
  };
}

function detectIos(files) {
  const swiftFiles = files.filter((file) => file.endsWith(".swift"));
  const swiftSample = swiftFiles
    .slice(0, 250)
    .map((file) => ({ file, text: stripLineComments(safeRead(file, 8000) ?? "") }));
  const swiftuiSignals = swiftSample
    .filter(({ text }) => /import\s+SwiftUI|struct\s+\w+\s*:\s*View\b|@main[\s\S]{0,400}App\b/.test(text))
    .slice(0, 50)
    .map(({ file }) => rel(file));
  const swiftAccessibilitySignals = swiftSample
    .filter(({ text }) => /\.accessibility(Label|Hidden|Hint|Value|AddTraits|Element|Action)/.test(text))
    .slice(0, 50)
    .map(({ file }) => rel(file));
  const uikitSignals = swiftSample
    .filter(({ text }) => /import\s+UIKit|UIViewController|UIView\b/.test(text))
    .slice(0, 50)
    .map(({ file }) => rel(file));
  return {
    xcodeProjects: files.filter((file) => file.endsWith(".xcodeproj") || file.endsWith(".xcworkspace")).map(rel),
    swiftPackages: files.filter((file) => path.basename(file) === "Package.swift").map(rel),
    swiftFileCount: swiftFiles.length,
    swiftuiSignals,
    swiftAccessibilitySignals,
    uikitSignals,
    localizationSignals: files
      .filter((file) => /\.(strings|stringsdict|xcstrings)$/.test(file))
      .slice(0, 100)
      .map(rel),
  };
}

function detectAndroid(files) {
  const kotlinFiles = files.filter((file) => file.endsWith(".kt"));
  const javaFiles = files.filter((file) => file.endsWith(".java"));
  const kotlinSample = kotlinFiles.slice(0, 250).map((file) => ({ file, text: safeRead(file, 8000) ?? "" }));
  return {
    gradleFiles: files
      .filter((file) => /(^|[/\\])(settings\.gradle|settings\.gradle\.kts|build\.gradle|build\.gradle\.kts)$/.test(file))
      .map(rel),
    kotlinFileCount: kotlinFiles.length,
    javaFileCount: javaFiles.length,
    composeSignals: kotlinSample
      .filter(({ text }) => /androidx\.compose|@Composable|Modifier\.semantics|contentDescription/.test(text))
      .slice(0, 50)
      .map(({ file }) => rel(file)),
    xmlLayoutSignals: files.filter((file) => /[/\\]res[/\\]layout[^/\\]*[/\\].+\.xml$/.test(file)).slice(0, 100).map(rel),
    localizationSignals: files.filter((file) => /[/\\]res[/\\]values[^/\\]*[/\\]strings\.xml$/.test(file)).slice(0, 100).map(rel),
  };
}

function extractPackageReferences(file) {
  const text = safeRead(file, 200000);
  if (text === null) return [];
  const references = [];
  for (const match of text.matchAll(/<PackageReference\b[^>]*\bInclude=["']([^"']+)["'][^>]*(?:\bVersion=["']([^"']+)["'])?[^>]*>/gi)) {
    references.push({ name: match[1], version: match[2] ?? null, source: rel(file) });
  }
  for (const match of text.matchAll(/<package\b[^>]*\bid=["']([^"']+)["'][^>]*(?:\bversion=["']([^"']+)["'])?[^>]*>/gi)) {
    references.push({ name: match[1], version: match[2] ?? null, source: rel(file) });
  }
  return references;
}

function pickPackageReferences(references, names) {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  return references.filter((reference) => wanted.has(reference.name.toLowerCase()));
}

function detectAspNet(files) {
  const fileSet = new Set(files.map((file) => rel(file)));
  const projectFiles = files.filter((file) => /\.(sln|csproj|vbproj|fsproj)$/.test(file)).map(rel);
  const webConfigFiles = files.filter((file) => /(^|[/\\])web\.config$/i.test(file)).map(rel);
  const globalAsaxFiles = files.filter((file) => /(^|[/\\])Global\.asax(\.(cs|vb))?$/i.test(file)).map(rel);
  const aspxPages = files.filter((file) => /\.aspx$/i.test(file)).map(rel);
  const userControls = files.filter((file) => /\.ascx$/i.test(file)).map(rel);
  const masterPages = files.filter((file) => /\.master$/i.test(file)).map(rel);
  const razorViews = files.filter((file) => /\.(cshtml|vbhtml)$/i.test(file)).map(rel);
  const controllers = files.filter((file) => /(^|[/\\])Controllers[/\\].+Controller\.(cs|vb)$/i.test(file)).map(rel);
  const routeFiles = files
    .filter((file) => /(^|[/\\])(RouteConfig|Startup|Program)\.(cs|vb)$/i.test(file))
    .map(rel);
  const resourceFiles = files.filter((file) => /\.resx$/i.test(file)).slice(0, 100).map(rel);
  const packageReferences = files
    .filter((file) => /\.(csproj|vbproj|fsproj)$/i.test(file) || /(^|[/\\])packages\.config$/i.test(file))
    .flatMap(extractPackageReferences);

  const webFormsLikely = aspxPages.length > 0 || userControls.length > 0 || masterPages.length > 0;
  const mvcLikely = controllers.length > 0 || [...fileSet].some((name) => /(^|\/)Views\/.+\.(cshtml|vbhtml)$/i.test(name));
  const razorPagesLikely = [...fileSet].some((name) => /(^|\/)Pages\/.+\.cshtml$/i.test(name));
  const aspNetCoreLikely =
    [...fileSet].some((name) => /(^|\/)(Program|Startup)\.cs$/i.test(name)) &&
    packageReferences.some((reference) => reference.name.toLowerCase().startsWith("microsoft.aspnetcore"));

  const framework =
    webFormsLikely && mvcLikely
      ? "aspnet-mixed"
      : webFormsLikely
        ? "aspnet-webforms"
        : razorPagesLikely
          ? "aspnet-razor-pages"
          : mvcLikely
            ? aspNetCoreLikely
              ? "aspnet-core-mvc"
              : "aspnet-mvc"
            : aspNetCoreLikely
              ? "aspnet-core"
              : projectFiles.length > 0 || webConfigFiles.length > 0
                ? "aspnet-unknown"
                : null;

  const uiLibraryReferences = pickPackageReferences(packageReferences, [
    "Telerik.UI.for.AspNet.Ajax",
    "Telerik.UI.for.AspNet.Mvc",
    "Kendo.Mvc",
    "DevExpress.Web",
    "AjaxControlToolkit",
    "Microsoft.jQuery.Unobtrusive.Validation",
    "jQuery.Validation",
    "bootstrap",
  ]);

  return {
    framework,
    projectFiles: projectFiles.slice(0, 50),
    webConfigFiles: webConfigFiles.slice(0, 50),
    globalAsaxFiles: globalAsaxFiles.slice(0, 20),
    routeFiles: routeFiles.slice(0, 50),
    webForms: {
      aspxPages: aspxPages.slice(0, 100),
      userControls: userControls.slice(0, 100),
      masterPages: masterPages.slice(0, 50),
    },
    mvc: {
      controllers: controllers.slice(0, 100),
      razorViews: razorViews.slice(0, 150),
      sharedViews: razorViews.filter((name) => /(^|\/)(Views\/Shared|Pages\/Shared)\//i.test(name)).slice(0, 75),
    },
    localizationSignals: resourceFiles,
    a11yRelevantDependencies: uiLibraryReferences,
  };
}

const files = walk(root);
const pkg = safeJson(path.join(root, "package.json"));
const web = detectWeb(files, pkg);
const ios = detectIos(files);
const android = detectAndroid(files);
const aspNet = detectAspNet(files);
const detectedPlatforms = [];
if (web.framework !== null || pkg?.dependencies?.react || pkg?.devDependencies?.react) detectedPlatforms.push("web-react");
if (aspNet.framework !== null) {
  detectedPlatforms.push(
    aspNet.framework === "aspnet-webforms" || aspNet.framework === "aspnet-mixed"
      ? "web-aspnet-aspx"
      : "web-aspnet",
  );
}
if (ios.swiftFileCount > 0 || ios.xcodeProjects.length > 0 || ios.swiftPackages.length > 0) {
  detectedPlatforms.push(ios.swiftuiSignals.length > 0 ? "ios-swiftui" : "ios-swift");
}
if (android.gradleFiles.length > 0 || android.kotlinFileCount > 0 || android.javaFileCount > 0) {
  detectedPlatforms.push(android.composeSignals.length > 0 ? "android-kotlin-compose" : "android");
}

const notes = [];
if (files.length >= MAX_FILES) notes.push(`File scan capped at ${MAX_FILES} files.`);
if (pkg === null && hasFile("package.json")) notes.push("package.json exists but could not be parsed as JSON.");
if (detectedPlatforms.length === 0) notes.push("No supported platform signals detected.");
if (detectedPlatforms.some((platform) => platform.startsWith("ios") || platform.startsWith("android"))) {
  notes.push("Mobile platform support is signal-only in this inspector; detailed mapping references should be added separately.");
}

const result = {
  projectRoot: root,
  projectName: pkg?.name ?? path.basename(root),
  detectedPlatforms,
  packageManagers: detectPackageManagers(files),
  web,
  ios,
  android,
  aspNet,
  notes,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
