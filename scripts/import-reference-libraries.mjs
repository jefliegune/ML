import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const referenceRoot = path.join(root, "local", "reference");
const huashuRoot = path.join(referenceRoot, "huashu-art-motion");
const mgRoot = path.join(referenceRoot, "mg-notes");
const outputPath = path.join(root, "src", "library", "catalog.json");

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const collapse = (value) => value.replace(/\s+/g, " ").trim();
const stripLink = (value) => value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
const cleanTitle = (value) =>
  collapse(value.replace(/\s+[A-Za-z][A-Za-z0-9/&.\- ]*$/, "")).replace(/[（(]\s*$/, "");

const MG_NAME_OVERRIDE = {
  "04-3d-render": {name: "3D 渲染系", english: "3D Render / CGI Motion Design"},
};

const MG_ORDER = [
  "05-cel-boil",
  "03-isometric",
  "01-flat-vector",
  "02-line-art",
  "04-3d-render",
  "08-morph",
  "19-paperclip",
  "22-hud",
  "06-collage",
  "12-aurora-glass",
  "09-bauhaus",
  "10-synthwave",
  "20-pixel",
  "07-liquid",
  "18-hanazi",
];

const MG_PALETTE = {
  "05-cel-boil": "paper",
  "03-isometric": "snow",
  "01-flat-vector": "bauhaus",
  "02-line-art": "snow",
  "04-3d-render": "ink",
  "08-morph": "chalk",
  "19-paperclip": "snow",
  "22-hud": "navy",
  "06-collage": "paper",
  "12-aurora-glass": "navy",
  "09-bauhaus": "bauhaus",
  "10-synthwave": "ink",
  "20-pixel": "ink",
  "07-liquid": "ink",
  "18-hanazi": "poster",
};

const sources = [
  {
    id: "vibe-knowledge-film",
    name: "Vibe Knowledge Film",
    author: "HeyChengC",
    repo: "https://github.com/HeyChengC/vibe-knowledge-film",
    license: "MIT",
    usage: "method",
    note: "无旁白知识短片的讲解设计方法：句子说到什么，屏上就演出什么。",
  },
  {
    id: "huashu-art-motion",
    name: "Huashu Art Motion",
    author: "alchaincyf（花叔）",
    repo: "https://github.com/alchaincyf/huashu-art-motion",
    license: "MIT",
    usage: "styles, palettes, grammars",
    note: "36 种实做画风、16 种研究配方、8 套色板、9 种解说动画语法与交付门禁。",
  },
  {
    id: "mg-styles-15",
    name: "MG Styles 15",
    author: "Vincentwei1021",
    repo: "https://github.com/Vincentwei1021/mg-styles-15",
    license: "MIT",
    usage: "styles, cue schema",
    note: "15 种 10 秒 MG 风格、完整提示词、cue 时间轴与评审 rubric。",
  },
];

const palettes = [];
const paletteMarkdown = read(path.join(huashuRoot, "references", "色板.md"));
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
    source: "huashu-art-motion/references/色板.md",
  });
}

const huashuStyles = [];
const indexMarkdown = read(path.join(huashuRoot, "references", "风格配方", "INDEX.md"));
for (const line of indexMarkdown.split(/\r?\n/)) {
  if (!line.startsWith("|")) continue;
  const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
  if (cells.length !== 7) continue;
  const idMatch = cells[0].match(/(\d{2}_[a-z0-9_]+)/);
  if (!idMatch) continue;
  const quality = (cells[5].match(/★/g) ?? []).length;
  if (quality === 0) continue;
  huashuStyles.push({
    id: `hs-${idMatch[1].replace(/_/g, "-")}`,
    name: stripLink(cells[1]),
    family: "huashu",
    quality,
    technique: collapse(cells[2]),
    motion: collapse(cells[3]),
    transition: collapse(cells[4]),
    weakness: collapse(cells[6]),
    palette: null,
    source: `huashu-art-motion/references/风格配方/${idMatch[1]}.md`,
  });
}

const mgStyles = [];
const promptDir = path.join(mgRoot, "prompts");
for (const file of fs.readdirSync(promptDir).filter((name) => name.endsWith(".md"))) {
  const id = file.replace(/\.md$/, "");
  if (!MG_ORDER.includes(id)) continue;
  const markdown = read(path.join(promptDir, file));
  const title = markdown.split(/\r?\n/).find((line) => line.startsWith("# "))?.slice(2) ?? file;
  const override = MG_NAME_OVERRIDE[id];
  const name = override?.name ?? cleanTitle(title);
  const english = override?.english ?? collapse(title.slice(name.length)).replace(/^[-/ ]+/, "");
  const original = markdown.match(/\*\*原片\*\*：(.+)/)?.[1]?.trim() ?? "";
  const signature = markdown.split("# Signature features and key techniques")[1] ?? "";
  const body = signature.split("# How to work")[0] ?? "";
  const visual = body.match(/视觉特征\s*([^\n]+)/)?.[1]?.trim() ?? "";
  const techniqueBlock = body.split("关键技法")[1] ?? "";
  const techniques = techniqueBlock
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && !entry.startsWith("#"))
    .slice(0, 4);
  const summary = collapse(body.split("视觉特征")[0] ?? "").slice(0, 220);
  mgStyles.push({
    id: `mg-${id}`,
    name,
    english,
    family: "mg",
    quality: 3,
    order: MG_ORDER.indexOf(id),
    original,
    summary,
    visual: collapse(visual),
    techniques,
    palette: MG_PALETTE[id] ?? null,
    source: `mg-styles-15/prompts/${file}`,
    demo: `mg-styles-15/demos/${id}`,
  });
}
mgStyles.sort((a, b) => a.order - b.order);

const grammars = [];
const grammarDir = path.join(huashuRoot, "references", "动画语法");
for (const file of fs.readdirSync(grammarDir).filter((name) => name.endsWith(".md"))) {
  const markdown = read(path.join(grammarDir, file));
  const lines = markdown.split(/\r?\n/);
  const heading = lines.find((line) => line.startsWith("# "))?.slice(2) ?? file;
  const [rawId, ...nameParts] = heading.split(" · ");
  const name = cleanTitle(nameParts.join(" · ")).replace(/视频动画语法卡$/, "").replace(/：$/, "").trim();
  const explicit = markdown.match(/^\s*一句话[:：]\s*(.+)$/m)?.[1];
  const bolded = markdown.match(/一句话语法[:：]\s*\*\*([\s\S]*?)\*\*/)?.[1];
  const headingIndex = lines.findIndex((line) => line.startsWith("# "));
  const firstParagraph = lines
    .slice(headingIndex + 1)
    .find((line) => line.trim().length > 0 && !line.startsWith(">"));
  const oneLiner = collapse(explicit ?? bolded ?? firstParagraph ?? "").replace(/\*\*/g, "");
  grammars.push({
    id: rawId.toLowerCase().replace(/_/g, "-"),
    name,
    oneLiner,
    source: `huashu-art-motion/references/动画语法/${file}`,
  });
}

const cueExample = JSON.parse(read(path.join(mgRoot, "cues-01.json")));

const catalog = {
  version: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  sources,
  palettes,
  styles: [...mgStyles, ...huashuStyles],
  grammars,
  cueSchema: {
    description:
      "以帧为单位的节拍表：fps、bpm、段落（build/drop/outro）加具名事件帧。场景只读事件帧，不自己算节奏。",
    example: cueExample,
  },
};

fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

console.log(
  `catalog: ${palettes.length} palettes, ${mgStyles.length} MG styles, ${huashuStyles.length} huashu styles, ${grammars.length} grammars`,
);
