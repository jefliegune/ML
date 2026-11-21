import fs from "node:fs";
import path from "node:path";
import { relativeToRoot, root } from "./lib/video-project.mjs";

const srcRoot = path.join(root, "src");
const codeExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const patterns = [
  { label: "private local path", regex: /\blocal[\\/]/ },
  { label: "private public project path", regex: /public[\\/]projects[\\/]/ },
  {
    label: "staticFile projects path",
    regex: /staticFile\(\s*["'`]projects[\\/]/,
  },
  { label: "generated private timeline", regex: /timeline\.generated/ },
];

const walk = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });

if (!fs.existsSync(srcRoot)) {
  console.error("FAIL: src/ does not exist");
  process.exit(1);
}

const hits = [];
for (const filePath of walk(srcRoot)) {
  if (!codeExtensions.has(path.extname(filePath).toLowerCase())) continue;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    for (const pattern of patterns) {
      if (pattern.regex.test(lines[index])) {
        hits.push({
          file: relativeToRoot(filePath),
          line: index + 1,
          label: pattern.label,
          source: lines[index].trim(),
        });
      }
    }
  }
}

console.log("PUBLIC BOUNDARY CHECK\n");
if (hits.length === 0) {
  console.log("PASS  src/ contains no private project references.");
  console.log("\nRESULT: PASS\n");
  process.exit(0);
}

for (const hit of hits) {
  console.log(`FAIL  ${hit.file}:${hit.line}  ${hit.label}`);
  console.log(`      ${hit.source}`);
}
console.log(`\nRESULT: FAIL (${hits.length} private reference(s))\n`);
process.exit(1);
