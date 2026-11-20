import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packsRoot = path.join(root, "src", "packs");
const libraryPath = path.join(root, "src", "library", "original-packs.json");
const compositionPath = path.join(root, "src", "Composition.tsx");

const results = [];
const record = (ok, name, detail, severity = "FAIL") => {
  results.push({ok, name, detail, severity: ok ? "PASS" : severity});
};

const relative = (filePath) => path.relative(root, filePath).split(path.sep).join("/");
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const isInside = (parent, child) => {
  const base = path.resolve(parent) + path.sep;
  return path.resolve(child).startsWith(base);
};

const walk = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
};

const requiredFields = [
  "id",
  "name",
  "version",
  "status",
  "entry",
  "previewComposition",
  "palette",
  "description",
  "bestFor",
  "tags",
  "components",
];
const allowedStatus = new Set(["stable", "beta", "draft"]);
const colorRoles = ["bg", "surface", "ink", "sub", "accent", "accent2"];
const mediaExtensions = new Set([
  ".wav",
  ".mp3",
  ".m4a",
  ".aac",
  ".flac",
  ".mp4",
  ".mov",
  ".webm",
  ".mkv",
]);
const privatePatterns = [
  [/\blocal\//, "local/ path"],
  [/\bpublic\/projects\//, "public/projects path"],
  [/staticFile\(\s*["'`]projects\//, "staticFile('projects/...')"],
];

if (!fs.existsSync(packsRoot)) {
  console.error("FAIL: src/packs does not exist");
  process.exit(1);
}
if (!fs.existsSync(libraryPath)) {
  console.error("FAIL: src/library/original-packs.json does not exist");
  process.exit(1);
}
if (!fs.existsSync(compositionPath)) {
  console.error("FAIL: src/Composition.tsx does not exist");
  process.exit(1);
}

const library = readJson(libraryPath);
const compositionSource = fs.readFileSync(compositionPath, "utf8");
const registeredCompositions = new Set(
  [...compositionSource.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]),
);
const libraryPacks = new Map((library.packs ?? []).map((pack) => [pack.id, pack]));
const libraryPalettes = new Map((library.palettes ?? []).map((palette) => [palette.id, palette]));
const libraryStyles = new Map((library.styles ?? []).map((style) => [style.id, style]));

const packDirs = fs
  .readdirSync(packsRoot, {withFileTypes: true})
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  .map((entry) => path.join(packsRoot, entry.name));

if (packDirs.length === 0) {
  console.error("FAIL: no style packs found under src/packs");
  process.exit(1);
}

const seenIds = new Map();
const seenPalettes = new Set();
const seenStyles = new Set();
let checks = 0;

const check = (ok, name, detail, severity = "FAIL") => {
  checks += 1;
  record(ok, name, detail, severity);
};

for (const packDir of packDirs) {
  const manifestPath = path.join(packDir, "pack.json");
  const folder = path.basename(packDir);

  if (!fs.existsSync(manifestPath)) {
    check(false, folder, "missing pack.json");
    continue;
  }

  let manifest;
  try {
    manifest = readJson(manifestPath);
  } catch (error) {
    check(false, folder, `invalid pack.json: ${error.message}`);
    continue;
  }

  check(typeof manifest.id === "string" && manifest.id.length > 0, folder, "pack id");
  check(manifest.id === folder, folder, `folder name matches id (${manifest.id})`);

  if (seenIds.has(manifest.id)) {
    check(false, folder, `duplicate pack id, also used by ${seenIds.get(manifest.id)}`);
  } else {
    seenIds.set(manifest.id, folder);
  }

  for (const field of requiredFields) {
    const value = manifest[field];
    const valid =
      Array.isArray(value)
        ? value.length > 0
        : typeof value === "string"
          ? value.trim().length > 0
          : value !== undefined && value !== null;
    check(valid, folder, `manifest field ${field}`);
  }

  check(allowedStatus.has(manifest.status), folder, `status is stable/beta/draft (${manifest.status})`);

  const entryPath = manifest.entry ? path.resolve(packDir, manifest.entry) : "";
  check(Boolean(entryPath) && isInside(packDir, entryPath), folder, "entry stays inside pack");
  check(Boolean(entryPath) && fs.existsSync(entryPath), folder, `entry exists (${manifest.entry})`);
  check(/\.(ts|tsx)$/.test(String(manifest.entry ?? "")), folder, "entry is TypeScript");

  check(
    registeredCompositions.has(manifest.previewComposition),
    folder,
    `preview composition registered (${manifest.previewComposition})`,
  );

  const libraryPack = libraryPacks.get(manifest.id);
  check(Boolean(libraryPack), folder, "registered in original-packs.json packs");
  if (libraryPack) {
    check(libraryPack.manifest === relative(manifestPath), folder, "library manifest path matches");
    check(libraryPack.entry === relative(entryPath), folder, "library entry path matches");
    check(libraryPack.previewComposition === manifest.previewComposition, folder, "library preview matches");
    check(libraryPack.palette === manifest.palette, folder, "library palette matches");
    check(libraryPack.status === manifest.status, folder, "library status matches");
  }

  const palette = libraryPalettes.get(manifest.palette);
  check(Boolean(palette), folder, `palette registered (${manifest.palette})`);
  if (palette) {
    if (seenPalettes.has(palette.id)) {
      check(false, folder, `duplicate palette id (${palette.id})`);
    } else {
      seenPalettes.add(palette.id);
    }
    const colors = colorRoles.map((role) => palette.colors?.[role]);
    check(
      colors.every((color) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color)),
      folder,
      "palette defines six hex colors",
    );
  }

  const style = [...libraryStyles.values()].find(
    (candidate) =>
      candidate.family === "original" &&
      (candidate.demo === manifest.previewComposition ||
        candidate.id === `pack-${manifest.id}` ||
        String(candidate.source ?? "").includes(manifest.id)),
  );
  check(Boolean(style), folder, "original style registered in original-packs.json");
  if (style) {
    if (seenStyles.has(style.id)) {
      check(false, folder, `duplicate style id (${style.id})`);
    } else {
      seenStyles.add(style.id);
    }
    check(style.palette === manifest.palette, folder, `style uses palette ${manifest.palette}`);
    check(style.demo === manifest.previewComposition, folder, "style demo matches preview composition");
  }

  const packFiles = walk(packDir);
  const codeFiles = packFiles.filter((file) => /\.(ts|tsx)$/.test(file));
  const source = codeFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  const exported = new Set();
  for (const match of source.matchAll(
    /export\s+(?:const|function|class|type|interface)\s+([A-Za-z0-9_]+)/g,
  )) {
    exported.add(match[1]);
  }
  for (const match of source.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of match[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop();
      if (name) exported.add(name);
    }
  }

  for (const component of manifest.components ?? []) {
    check(exported.has(component), folder, `component exported (${component})`);
  }

  const mediaFiles = packFiles.filter((file) =>
    mediaExtensions.has(path.extname(file).toLowerCase()),
  );
  check(
    mediaFiles.length === 0,
    folder,
    `no private media (${mediaFiles.map(relative).join(", ") || "0 files"})`,
  );

  const privateRefs = [];
  for (const file of codeFiles) {
    const content = fs.readFileSync(file, "utf8");
    for (const [pattern, label] of privatePatterns) {
      if (pattern.test(content)) privateRefs.push(`${label} in ${relative(file)}`);
    }
  }
  check(
    privateRefs.length === 0,
    folder,
    `no private code references (${privateRefs.join("; ") || "0 hits"})`,
  );

  check(
    fs.existsSync(path.join(packDir, "README.md")),
    folder,
    "README.md present",
    "WARN",
  );
}

for (const pack of library.packs ?? []) {
  const manifestPath = path.resolve(root, pack.manifest);
  check(fs.existsSync(manifestPath), pack.id, "library pack manifest exists");
  if (fs.existsSync(manifestPath)) {
    const manifest = readJson(manifestPath);
    check(manifest.id === pack.id, pack.id, "library pack id matches manifest");
  }
}

const failures = results.filter((item) => !item.ok && item.severity === "FAIL");
const warnings = results.filter((item) => !item.ok && item.severity === "WARN");
const labels = results.filter((item) => item.ok);
const width = Math.max(...results.map((item) => item.name.length), 12);

console.log("STYLE PACK CHECK");
console.log("");
for (const item of labels) {
  console.log(`  PASS  ${item.name.padEnd(width)}  ${item.detail}`);
}
for (const item of warnings) {
  console.log(`  WARN  ${item.name.padEnd(width)}  ${item.detail}`);
}
for (const item of failures) {
  console.log(`  FAIL  ${item.name.padEnd(width)}  ${item.detail}`);
}

console.log("");
console.log(
  `${failures.length === 0 ? "PASS" : "FAIL"}: ${packDirs.length} pack(s), ${checks} check(s), ` +
    `${warnings.length} warning(s), ${failures.length} failure(s).`,
);

if (failures.length > 0) {
  process.exit(1);
}
