import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const huashuRoot = path.join(root, "local", "reference", "huashu-art-motion");
const outputPath = path.join(root, "src", "library", "catalog.json");

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const collapse = (value) => value.replace(/\s+/g, " ").trim();
const stripLink = (value) => value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
const cleanTitle = (value) =>
  collapse(value.replace(/\s+[A-Za-z][A-Za-z0-9/&.\- ]*$/, "")).replace(/[（(]\s*$/, "");

if (!fs.existsSync(huashuRoot)) {
  console.error(
    "Missing Huashu source: local/reference/huashu-art-motion",
  );
  process.exit(1);
}

const sources = [
  {
    id: "huashu-art-motion",
    name: "Huashu Art Motion",
    author: "alchaincyf（花叔）",
    repo: "https://github.com/alchaincyf/huashu-art-motion",
    license: "MIT",
    usage: "styles, palettes, grammars, methods, fonts",
    note:
      "36 种已实做画风、8 套色板、9 种解说动画语法、完整方法文档与 OFL 字体。",
  },
];

const palettes = [];
const paletteMarkdown = read(
  path.join(huashuRoot, "references", "色板.md"),
);
for (const line of paletteMarkdown.split(/\r?\n/)) {
  const match = line.match(
    /^\|\s*`([a-z0-9-]+)`\s*([^|]+)\|\s*([^|]+)\|\s*(#[0-9A-Fa-f]{6})\s*\|\s*(#[0-9A-Fa-f]{6})\s*\|\s*(#[0-9A-Fa-f]{6})\s*\|\s*(#[0-9A-Fa-f]{6})\s*\|\s*(#[0-9A-Fa-f]{6})\s*\|\s*(#[0-9A-Fa-f]{6})\s*\|$/,
  );
  if (!match) continue;
  palettes.push({
    id: match[1],
    name: collapse(match[2]),
    bestFor: collapse(match[3]),
    colors: {
      bg: match[4].toUpperCase(),
      surface: match[5].toUpperCase(),
      ink: match[6].toUpperCase(),
      sub: match[7].toUpperCase(),
      accent: match[8].toUpperCase(),
      accent2: match[9].toUpperCase(),
    },
    docPath: "docs/reference/huashu/色板.md",
    source: "huashu-art-motion/references/色板.md",
  });
}

const styles = [];
const indexMarkdown = read(
  path.join(huashuRoot, "references", "风格配方", "INDEX.md"),
);
for (const line of indexMarkdown.split(/\r?\n/)) {
  if (!line.startsWith("|")) continue;
  const cells = line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
  if (cells.length !== 7) continue;
  const idMatch = cells[0].match(/(\d{2}_[a-z0-9_]+)/);
  if (!idMatch) continue;
  const quality = (cells[5].match(/★/g) ?? []).length;
  if (quality === 0) continue;
  styles.push({
    id: `hs-${idMatch[1].replace(/_/g, "-")}`,
    name: stripLink(cells[1]),
    family: "huashu",
    quality,
    technique: collapse(cells[2]),
    motion: collapse(cells[3]),
    transition: collapse(cells[4]),
    weakness: collapse(cells[6]),
    palette: null,
    cardPath: `docs/reference/huashu/风格配方/${idMatch[1]}.md`,
    source: `huashu-art-motion/references/风格配方/${idMatch[1]}.md`,
  });
}

const grammars = [];
const grammarDir = path.join(huashuRoot, "references", "动画语法");
for (const file of fs
  .readdirSync(grammarDir)
  .filter((name) => name.endsWith(".md"))
  .sort()) {
  const markdown = read(path.join(grammarDir, file));
  const lines = markdown.split(/\r?\n/);
  const heading = lines.find((line) => line.startsWith("# "))?.slice(2) ?? file;
  const [rawId, ...nameParts] = heading.split(" · ");
  const name = cleanTitle(nameParts.join(" · "))
    .replace(/视频动画语法卡$/, "")
    .replace(/：$/, "")
    .trim();
  const explicit = markdown.match(/^\s*一句话[:：]\s*(.+)$/m)?.[1];
  const bolded = markdown.match(/一句话语法[:：]\s*\*\*([\s\S]*?)\*\*/)?.[1];
  const headingIndex = lines.findIndex((line) => line.startsWith("# "));
  const firstParagraph = lines
    .slice(headingIndex + 1)
    .find((line) => line.trim().length > 0 && !line.startsWith(">"));
  const oneLiner = collapse(explicit ?? bolded ?? firstParagraph ?? "").replace(
    /\*\*/g,
    "",
  );
  grammars.push({
    id: rawId.toLowerCase().replace(/_/g, "-"),
    name,
    oneLiner,
    cardPath: `docs/reference/huashu/动画语法/${file}`,
    source: `huashu-art-motion/references/动画语法/${file}`,
  });
}

const catalog = {
  version: 2,
  generatedAt: new Date().toLocaleDateString("en-CA"),
  sources,
  palettes,
  styles,
  grammars,
};

fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

console.log(
  `catalog: ${palettes.length} palettes, ${styles.length} huashu styles, ${grammars.length} grammars`,
);
