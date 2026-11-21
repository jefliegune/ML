import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "local", "reference", "huashu-art-motion");
const docsRoot = path.join(root, "docs", "reference", "huashu");
const stylesRoot = path.join(docsRoot, "风格配方");
const grammarsRoot = path.join(docsRoot, "动画语法");
const optionalRoot = path.join(docsRoot, "optional");
const fontsRoot = path.join(root, "public", "fonts", "huashu");
const manifestPath = path.join(root, "src", "library", "huashu.json");
const catalogPath = path.join(root, "src", "library", "catalog.json");

const METHOD_FILES = [
  "01-拆解.md",
  "02-机制.md",
  "03-一帧先行四条路线.md",
  "04-纯代码绘制.md",
  "05-节奏与配乐.md",
  "06-口播驱动的艺术短片.md",
  "07-正面经验.md",
  "08-风格作者规范.md",
  "09-视频动画语法.md",
  "10-角色.md",
  "11-长卷穿越片.md",
  "12-口播整片与经验回流.md",
  "13-口播与语音复刻.md",
  "15-跨场景风格提炼.md",
  "16-风格演示95分协议.md",
  "18-媒介层与角色入画.md",
  "镜头语言.md",
  "镜头表模板.md",
  "角色精细度.md",
  "_转场_迁移测试.md",
  "_音轨_艺术史速通.md",
  "_重做进度.md",
];

const OPTIONAL_FILES = [
  "capabilities.md",
  "images.md",
  "compatibility.md",
  "口播API.md",
];

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const collapse = (value) => value.replace(/\s+/g, " ").trim();
const stripLink = (value) => value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
const relative = (filePath) =>
  path.relative(root, filePath).split(path.sep).join("/");
const ensureDir = (directory) => fs.mkdirSync(directory, {recursive: true});
const copyFile = (from, to) => {
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
};
const writeGenerated = (filePath, contents) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${contents.trim()}\n`, "utf8");
};

if (!fs.existsSync(sourceRoot)) {
  console.error(
    `Missing Huashu source: ${relative(sourceRoot)}\n` +
      "Place a clone at local/reference/huashu-art-motion, then rerun npm run library:huashu.",
  );
  process.exit(1);
}

const catalog = JSON.parse(read(catalogPath));

const git = (args) => {
  try {
    return execFileSync("git", ["-C", sourceRoot, ...args], {
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
};

const commit = git(["rev-parse", "HEAD"]);
const commitMeta = git(["log", "-1", "--format=%cI%n%s"]).split(/\r?\n/);
const commitDate = commitMeta[0] ?? "";
const commitSubject = commitMeta.slice(1).join(" ").trim();

const indexMarkdown = read(
  path.join(sourceRoot, "references", "风格配方", "INDEX.md"),
);
const styleRows = [];
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
  styleRows.push({
    cardId: idMatch[1],
    name: stripLink(cells[1]),
    quality,
    technique: collapse(cells[2]),
  });
}

if (styleRows.length !== 36) {
  console.error(
    `Expected 36 implemented Huashu style cards, found ${styleRows.length}.`,
  );
  process.exit(1);
}

ensureDir(stylesRoot);
ensureDir(grammarsRoot);
ensureDir(optionalRoot);
ensureDir(fontsRoot);

const styles = styleRows.map((row) => {
  const source = path.join(
    sourceRoot,
    "references",
    "风格配方",
    `${row.cardId}.md`,
  );
  const destination = path.join(stylesRoot, `${row.cardId}.md`);
  copyFile(source, destination);
  const id = `hs-${row.cardId.replace(/_/g, "-")}`;
  const catalogStyle = catalog.styles.find((style) => style.id === id);
  return {
    id,
    cardId: row.cardId,
    name: row.name,
    quality: row.quality,
    technique: row.technique,
    palette: catalogStyle?.palette ?? null,
    card: relative(destination),
    source: `huashu-art-motion/references/风格配方/${row.cardId}.md`,
  };
});

const grammarFiles = fs
  .readdirSync(path.join(sourceRoot, "references", "动画语法"))
  .filter((file) => file.endsWith(".md"))
  .sort();

const grammars = grammarFiles.map((file) => {
  const source = path.join(sourceRoot, "references", "动画语法", file);
  const destination = path.join(grammarsRoot, file);
  copyFile(source, destination);
  const catalogGrammar = catalog.grammars.find((grammar) =>
    grammar.source.endsWith(`/${file}`),
  );
  return {
    id: catalogGrammar?.id ?? file.replace(/\.md$/, "").replace(/_/g, "-"),
    name: catalogGrammar?.name ?? file.replace(/\.md$/, ""),
    oneLiner: catalogGrammar?.oneLiner ?? "",
    card: relative(destination),
    source: `huashu-art-motion/references/动画语法/${file}`,
  };
});

const paletteDoc = path.join(sourceRoot, "references", "色板.md");
const paletteDocDestination = path.join(docsRoot, "色板.md");
copyFile(paletteDoc, paletteDocDestination);

const palettes = catalog.palettes.map((palette) => ({
  ...palette,
  doc: relative(paletteDocDestination),
}));

const methods = [];
for (const file of METHOD_FILES) {
  const source = path.join(sourceRoot, "references", file);
  if (!fs.existsSync(source)) continue;
  const destination = path.join(docsRoot, file);
  copyFile(source, destination);
  const markdown = read(source);
  const heading =
    markdown.split(/\r?\n/).find((line) => line.startsWith("# "))?.slice(2) ??
    file.replace(/\.md$/, "");
  methods.push({
    id: file.replace(/\.md$/, ""),
    title: heading.trim(),
    file: relative(destination),
    source: `huashu-art-motion/references/${file}`,
  });
}

const optional = [];
for (const file of OPTIONAL_FILES) {
  const source = path.join(sourceRoot, "references", file);
  if (!fs.existsSync(source)) continue;
  const destination = path.join(optionalRoot, file);
  copyFile(source, destination);
  const markdown = read(source);
  const heading =
    markdown.split(/\r?\n/).find((line) => line.startsWith("# "))?.slice(2) ??
    file.replace(/\.md$/, "");
  optional.push({
    id: file.replace(/\.md$/, ""),
    title: heading.trim(),
    file: relative(destination),
    source: `huashu-art-motion/references/${file}`,
  });
}

copyFile(
  path.join(sourceRoot, "LICENSE"),
  path.join(docsRoot, "LICENSE-MIT.txt"),
);

const sourceFontsRoot = path.join(
  sourceRoot,
  "scripts",
  "engine",
  "lib",
  "fonts",
);
const fontIndex = JSON.parse(
  read(path.join(sourceFontsRoot, "index.json")),
);
const fontFiles = fs
  .readdirSync(sourceFontsRoot)
  .filter((file) => file.endsWith(".woff"))
  .sort();

for (const file of fontFiles) {
  copyFile(path.join(sourceFontsRoot, file), path.join(fontsRoot, file));
}
for (const file of ["index.json", "LICENSES.md", "OFL.txt"]) {
  copyFile(path.join(sourceFontsRoot, file), path.join(fontsRoot, file));
}

const fontMeta = new Map(
  fontIndex.map(([file, family, style, weight]) => [
    file,
    {family, style, weight},
  ]),
);

const FONT_FALLBACKS = {
  "cmunrm.woff": {family: "CMU Serif", style: "normal", weight: "400"},
  "cmunti.woff": {family: "CMU Serif", style: "italic", weight: "400"},
  "Inter-var.woff": {family: "Inter", style: "normal", weight: "400"},
  "LXGWWenKai-500.woff": {family: "LXGW WenKai", style: "normal", weight: "500"},
  "NotoSansSC-500.woff": {family: "Noto Sans SC", style: "normal", weight: "500"},
  "NotoSansSC-700.woff": {family: "Noto Sans SC", style: "normal", weight: "700"},
  "NotoSansSC-800.woff": {family: "Noto Sans SC", style: "normal", weight: "800"},
  "NotoSansSC-900.woff": {family: "Noto Sans SC", style: "normal", weight: "900"},
  "NotoSansSC-sub.woff": {family: "Noto Sans SC", style: "normal", weight: "400"},
  "NotoSerifSC-sub.woff": {family: "Noto Serif SC", style: "normal", weight: "400"},
  "RobotoCondensed-var.woff": {
    family: "Roboto Condensed",
    style: "normal",
    weight: "400",
  },
};

const fonts = fontFiles.map((file) => {
  const meta = fontMeta.get(file) ?? FONT_FALLBACKS[file] ?? {
    family: file.replace(/\.woff$/, ""),
    style: "normal",
    weight: "400",
  };
  return {
    file,
    family: meta.family,
    style: meta.style,
    weight: meta.weight,
    url: `fonts/huashu/${file}`,
    license: "SIL OFL 1.1",
  };
});

const manifest = {
  version: 1,
  importedAt: new Date().toLocaleDateString("en-CA"),
  source: {
    id: "huashu-art-motion",
    name: "Huashu Art Motion",
    author: "alchaincyf (花叔)",
    repo: "https://github.com/alchaincyf/huashu-art-motion",
    commit,
    commitDate,
    commitSubject,
    license: "MIT",
    fontLicense: "SIL OFL 1.1",
    note:
      "Full MIT-licensed style cards, grammar cards and method documents are imported. Character artwork, overview images, showcase GIFs and demo videos are intentionally excluded.",
  },
  counts: {
    styles: styles.length,
    grammars: grammars.length,
    palettes: palettes.length,
    methods: methods.length,
    optional: optional.length,
    fonts: fonts.length,
  },
  styles,
  grammars,
  palettes,
  methods,
  optional,
  fonts,
  excluded: [
    {
      path: "assets/角色/",
      reason: "Character artwork is demo-only and is not covered by MIT.",
    },
    {
      path: "assets/动画语法/ and assets/全风格总览.jpg",
      reason:
        "Overview images contain the Huashu character and are demo-only.",
    },
    {
      path: "assets/showcase/",
      reason: "Showcase GIFs and films are demo-only or contain third-party characters.",
    },
    {
      path: "scripts/engine/",
      reason:
        "Canvas runtime depends on Huashu globals U/MO/CAM and is not a drop-in Remotion module.",
    },
    {
      path: "references/风格配方/38-55",
      reason:
        "Research recipes are explicitly not production-ready and are not part of the 36 implemented cards.",
    },
  ],
};

writeGenerated(manifestPath, JSON.stringify(manifest, null, 2));

const styleIndex = [
  "# Huashu 风格配方完整卡",
  "",
  `来源：Huashu Art Motion @ \`${commit.slice(0, 12)}\`，MIT。`,
  "",
  "| ID | 名称 | 质量 | 色板 | 完整卡 |",
  "|---|---|---:|---|---|",
  ...styles.map(
    (style) =>
      `| \`${style.id}\` | ${style.name} | ${"★".repeat(style.quality)} | ${style.palette ?? "-"} | [${style.cardId}.md](./${style.cardId}.md) |`,
  ),
].join("\n");
writeGenerated(path.join(stylesRoot, "INDEX.md"), styleIndex);

const grammarIndex = [
  "# Huashu 动画语法完整卡",
  "",
  `来源：Huashu Art Motion @ \`${commit.slice(0, 12)}\`，MIT。`,
  "",
  "| ID | 名称 | 一句话 | 完整卡 |",
  "|---|---|---|---|",
  ...grammars.map(
    (grammar) =>
      `| \`${grammar.id}\` | ${grammar.name} | ${grammar.oneLiner.replace(/\|/g, "\\|")} | [${path.basename(grammar.card)}](./${path.basename(grammar.card)}) |`,
  ),
].join("\n");
writeGenerated(path.join(grammarsRoot, "INDEX.md"), grammarIndex);

const methodIndex = [
  "# Huashu 方法文档",
  "",
  "| ID | 标题 | 文档 |",
  "|---|---|---|",
  ...methods.map(
    (method) =>
      `| \`${method.id}\` | ${method.title} | [${path.basename(method.file)}](./${path.basename(method.file)}) |`,
  ),
  "",
  "## Optional",
  "",
  "| ID | 标题 | 文档 |",
  "|---|---|---|",
  ...optional.map(
    (item) =>
      `| \`${item.id}\` | ${item.title} | [${path.basename(item.file)}](./optional/${path.basename(item.file)}) |`,
  ),
].join("\n");
writeGenerated(path.join(docsRoot, "METHODS.md"), methodIndex);

const fontIndexMarkdown = [
  "# Huashu OFL 字体",
  "",
  "全部字体为 SIL Open Font License 1.1，许可全文与版权清单见同目录 `LICENSES.md` 和 `OFL.txt`。",
  "",
  "| 文件 | Family | Style | Weight |",
  "|---|---|---|---:|",
  ...fonts.map(
    (font) =>
      `| [${font.file}](../../../public/fonts/huashu/${font.file}) | ${font.family} | ${font.style} | ${font.weight} |`,
  ),
].join("\n");
writeGenerated(path.join(docsRoot, "字体.md"), fontIndexMarkdown);

const rootReadme = [
  "# Huashu 通用素材库",
  "",
  "这是从 [Huashu Art Motion](https://github.com/alchaincyf/huashu-art-motion) 导入的完整参考素材，而不是 `catalog.json` 里的一行摘要。",
  "",
  `- 来源提交：\`${commit}\`（${commitDate}）`,
  "- 代码与文档许可：MIT，见 `LICENSE-MIT.txt`",
  "- 字体许可：SIL OFL 1.1，见 `../../../public/fonts/huashu/LICENSES.md`",
  "",
  "## 包含",
  "",
  `- \`风格配方/\`：${styles.length} 张完整风格卡和索引`,
  `- \`动画语法/\`：${grammars.length} 张完整语法卡和索引`,
  `- \`色板.md\`：${palettes.length} 套色板的完整说明`,
  `- \`METHODS.md\`：${methods.length} 份核心方法与 ${optional.length} 份可选能力文档`,
  `- \`字体.md\`：${fonts.length} 个 OFL 字体文件清单`,
  "",
  "## 使用顺序",
  "",
  "1. 先读 `动画语法/INDEX.md`，按题材选一种叙事语法。",
  "2. 再读 `风格配方/INDEX.md`，按画法和质量选一张完整卡。",
  "3. 从 `色板.md` 选一套色板，保持全片一致。",
  "4. 只把选中的卡提炼成 Remotion 组件和参数，不照搬示范构图。",
  "5. 字体通过 `staticFile(\"fonts/huashu/<file>\")` 使用，并保留 OFL 许可。",
  "",
  "## 未导入",
  "",
  "角色图、总览图、示范 GIF/视频、上游 Canvas 引擎和研究配方没有导入。原因见 `NOT_IMPORTED.md`。",
].join("\n");
writeGenerated(path.join(docsRoot, "README.md"), rootReadme);

const notImported = [
  "# 未导入的 Huashu 内容",
  "",
  "这些内容没有进入项目，不是因为文件太大，而是因为授权边界或与 Remotion 不兼容。",
  "",
  "| 内容 | 原因 |",
  "|---|---|",
  "| `assets/角色/` | 花叔角色形象属于示范素材，不随 MIT 授权。 |",
  "| `assets/动画语法/`、`assets/全风格总览.jpg` | 总览图包含角色形象，属于示范用途。 |",
  "| `assets/showcase/` | GIF/视频包含角色或第三方形象，且不能直接作为 Remotion 组件。 |",
  "| `scripts/engine/` | 依赖全局 `U`、`MO`、`CAM` 和 Canvas 运行时，不是可直接引入的 React 模块。 |",
  "| `references/风格配方/38-55` | 上游明确标为研究配方，未达到实做质量门槛。 |",
  "| `demos/` 和工程文件 | 是效果验证，不是通用素材。 |",
  "",
  "如果以后要使用这些内容，需要逐项确认媒体授权，并单独做 Remotion 适配。",
].join("\n");
writeGenerated(path.join(docsRoot, "NOT_IMPORTED.md"), notImported);

console.log(
  `Huashu library: ${styles.length} styles, ${grammars.length} grammars, ` +
    `${palettes.length} palettes, ${methods.length} methods, ${fonts.length} fonts`,
);
