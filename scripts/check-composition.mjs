import fs from "node:fs";
import path from "node:path";
import {
  loadVideoProject,
  parseArgs,
  relativeToRoot,
} from "./lib/video-project.mjs";

const args = parseArgs();
const selector = args.values.get("project") ?? args.positionals[0];
const strict = args.flags.has("strict");
const minFontSize = Number(args.values.get("min-font") ?? 36);

if (!selector) {
  console.error(
    "Usage: node scripts/check-composition.mjs --project <id|path> [--strict] [--min-font 36]",
  );
  process.exit(1);
}

let project;
try {
  project = loadVideoProject(selector);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const scenesRoot = path.join(project.projectRoot, "scenes");
const scanRoot = fs.existsSync(scenesRoot) ? scenesRoot : project.projectRoot;

const walk = (directory) => {
  const files = [];
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      files.push(...walk(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }
  return files;
};

const files = walk(scanRoot);
const warnings = [];

const addWarning = (file, line, rule, message) => {
  warnings.push({
    file: relativeToRoot(file),
    line,
    rule,
    message,
  });
};

for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  let textBlocks = 0;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;

    textBlocks += (line.match(/<Text\b/g) ?? []).length;

    const fontMatch = line.match(
      /fontSize:\s*(?:"|')?(\d+(?:\.\d+)?)(?:px)?(?:"|')?/,
    );
    if (fontMatch) {
      const size = Number(fontMatch[1]);
      if (size < minFontSize) {
        addWarning(
          file,
          index + 1,
          "small-font",
          "fontSize " + size + " < " + minFontSize,
        );
      }
    }

    if (
      /\b(REC|PAGE|PAGES|FPS|DURATION|SCENE\s*\d+|EP\s*\d+)\b/.test(trimmed) ||
      /\b\d{1,2}:\d{2}\b/.test(trimmed)
    ) {
      addWarning(
        file,
        index + 1,
        "decorative-meta",
        "可能的录制信息、页码、时长或时间码装饰",
      );
    }
  });

  if (textBlocks > 20) {
    addWarning(
      file,
      1,
      "text-density",
      "<Text> 数量 " + textBlocks + "，确认单帧没有堆叠过多文字",
    );
  }
}

console.log("COMPOSITION CHECK / " + project.manifest.id);
console.log("scanned: " + files.length + " files in " + relativeToRoot(scanRoot));

if (warnings.length === 0) {
  console.log("\nPASS: no layout warnings.");
  process.exit(0);
}

for (const warning of warnings) {
  console.log(
    warning.file + ":" + warning.line + "  [" + warning.rule + "] " + warning.message,
  );
}

console.log(
  "\n" + warnings.length + " warning(s). " +
    (strict ? "Strict mode: failing." : "Not blocking; use --strict to fail."),
);

process.exit(strict ? 1 : 0);
