import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "src", "library", "huashu.json");
const results = [];

const check = (pass, name, detail = "") => {
  results.push({pass, name, detail});
};

const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const sizeOf = (relativePath) => {
  const filePath = path.join(root, relativePath);
  return fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
};

if (!exists("src/library/huashu.json")) {
  console.error(
    "Missing src/library/huashu.json. Run npm run library:huashu first.",
  );
  process.exit(1);
}

const manifest = JSON.parse(
  fs.readFileSync(manifestPath, "utf8"),
);

check(manifest.version === 1, "manifest version", String(manifest.version));
check(
  typeof manifest.source?.commit === "string" &&
    manifest.source.commit.length === 40,
  "source commit",
  manifest.source?.commit ?? "missing",
);
check(
  manifest.counts?.styles === 36,
  "style count",
  String(manifest.counts?.styles),
);
check(
  manifest.counts?.grammars === 9,
  "grammar count",
  String(manifest.counts?.grammars),
);
check(
  manifest.counts?.palettes === 8,
  "palette count",
  String(manifest.counts?.palettes),
);
check(
  manifest.counts?.methods >= 15,
  "method count",
  String(manifest.counts?.methods),
);
check(
  manifest.counts?.fonts >= 40,
  "font count",
  String(manifest.counts?.fonts),
);

for (const style of manifest.styles ?? []) {
  check(exists(style.card), `style card ${style.id}`, style.card);
  check(
    sizeOf(style.card) > 500,
    `style content ${style.id}`,
    `${sizeOf(style.card)} bytes`,
  );
}

for (const grammar of manifest.grammars ?? []) {
  check(exists(grammar.card), `grammar card ${grammar.id}`, grammar.card);
  check(
    sizeOf(grammar.card) > 500,
    `grammar content ${grammar.id}`,
    `${sizeOf(grammar.card)} bytes`,
  );
}

for (const palette of manifest.palettes ?? []) {
  check(exists(palette.doc), `palette doc ${palette.id}`, palette.doc);
}

for (const method of manifest.methods ?? []) {
  check(exists(method.file), `method ${method.id}`, method.file);
}

let fontBytes = 0;
for (const font of manifest.fonts ?? []) {
  const relativePath = path.join("public", font.url);
  const bytes = sizeOf(relativePath);
  fontBytes += bytes;
  check(exists(relativePath), `font ${font.file}`, relativePath);
  check(bytes > 0, `font content ${font.file}`, `${bytes} bytes`);
}
check(
  fontBytes > 14 * 1024 * 1024,
  "font payload",
  `${(fontBytes / 1024 / 1024).toFixed(2)} MB`,
);

check(
  !exists("docs/reference/huashu/角色"),
  "character art excluded",
  "no character artwork directory",
);
check(
  !exists("docs/reference/huashu/assets"),
  "showcase media excluded",
  "no upstream assets directory",
);
check(
  !exists("docs/reference/huashu/scripts/engine"),
  "canvas engine excluded",
  "no upstream engine directory",
);
check(
  exists("docs/reference/huashu/LICENSE-MIT.txt"),
  "MIT license file",
  "docs/reference/huashu/LICENSE-MIT.txt",
);
check(
  exists("public/fonts/huashu/LICENSES.md"),
  "font copyright list",
  "public/fonts/huashu/LICENSES.md",
);
check(
  exists("public/fonts/huashu/OFL.txt"),
  "OFL license text",
  "public/fonts/huashu/OFL.txt",
);

const failures = results.filter((item) => !item.pass);
const width = Math.max(...results.map((item) => item.name.length), 20);

console.log("HUASHU LIBRARY CHECK");
if (failures.length === 0) {
  console.log(
    `PASS  ${"styles".padEnd(width)}  ${manifest.counts.styles} full cards`,
  );
  console.log(
    `PASS  ${"grammars".padEnd(width)}  ${manifest.counts.grammars} full cards`,
  );
  console.log(
    `PASS  ${"methods".padEnd(width)}  ${manifest.counts.methods} core documents`,
  );
  console.log(
    `PASS  ${"fonts".padEnd(width)}  ${manifest.counts.fonts} OFL files, ` +
      `${(fontBytes / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log(`PASS  ${"assertions".padEnd(width)}  ${results.length} checks`);
  process.exit(0);
}

for (const failure of failures) {
  console.log(
    `FAIL  ${failure.name.padEnd(width)}  ${failure.detail}`,
  );
}
console.log(`\nRESULT: FAIL (${failures.length} checks)`);
process.exit(1);
