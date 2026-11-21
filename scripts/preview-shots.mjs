import fs from "node:fs";
import path from "node:path";
import {spawn} from "node:child_process";
import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";
import {
  loadVideoProject,
  parseArgs,
  relativeToRoot,
  root,
} from "./lib/video-project.mjs";

const args = parseArgs();
const selector = args.values.get("project") ?? args.positionals[0];

if (!selector) {
  console.error(
    "Usage: node scripts/preview-shots.mjs --project <id|path> [--section hook,review] [--frames 30,120] [--scale 0.75] [--open]",
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

if (!project.timelinePath) {
  console.error("Project has no timeline. Add a timeline file to the manifest first.");
  process.exit(1);
}

const timeline = JSON.parse(fs.readFileSync(project.timelinePath, "utf8"));
const sections = Array.isArray(timeline.sections) ? timeline.sections : [];

if (sections.length === 0) {
  console.error("Timeline has no sections: " + relativeToRoot(project.timelinePath));
  process.exit(1);
}

const sectionFilter = (args.values.get("section") ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const selected = sectionFilter.length
  ? sections.filter((section) => sectionFilter.includes(section.id))
  : sections;

if (selected.length === 0) {
  console.error(
    "No matching sections. Available: " + sections.map((section) => section.id).join(", "),
  );
  process.exit(1);
}

const scale = Number(args.values.get("scale") ?? 0.75);
if (!Number.isFinite(scale) || scale <= 0 || scale > 1) {
  console.error("--scale must be greater than 0 and at most 1.");
  process.exit(1);
}

const customFrames = args.values.has("frames")
  ? args.values
      .get("frames")
      .split(",")
      .map((value) => Number(value.trim()))
  : null;

if (customFrames && selected.length !== 1) {
  console.error("--frames requires exactly one --section.");
  process.exit(1);
}

if (customFrames && customFrames.some((frame) => !Number.isInteger(frame) || frame < 0)) {
  console.error("--frames must be comma-separated non-negative integers.");
  process.exit(1);
}

const outRoot = path.resolve(
  root,
  args.values.get("out") ?? path.join("local", "preview", project.manifest.id),
);
const shotsDir = path.join(outRoot, "shots");
fs.mkdirSync(shotsDir, {recursive: true});

const framesFor = (section) => {
  const length = section.endFrame - section.startFrame;
  if (customFrames) {
    return customFrames.filter((frame) => frame < length);
  }
  const ratios = length < 90 ? [0.3, 0.6, 0.88] : [0.18, 0.45, 0.72, 0.92];
  return [
    ...new Set(
      ratios.map((ratio) =>
        Math.min(length - 1, Math.max(0, Math.round(length * ratio))),
      ),
    ),
  ];
};

const formatTimecode = (frame, fps) => {
  const seconds = Math.floor(frame / fps);
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  const restFrames = frame % fps;
  return [
    String(minutes).padStart(2, "0"),
    String(restSeconds).padStart(2, "0") + "." + String(restFrames).padStart(2, "0"),
  ].join(":");
};

const runPool = async (items, limit, worker) => {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({length: Math.min(limit, items.length)}, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
};

const tasks = selected.flatMap((section) =>
  framesFor(section).map((frame) => ({section, frame})),
);

console.log("PREVIEW SHOTS / " + project.manifest.id);
console.log("entry:    " + relativeToRoot(project.entryPath));
console.log("sections: " + selected.map((section) => section.id).join(", "));
console.log("frames:   " + tasks.length + " @ scale " + scale);
console.log("output:   " + relativeToRoot(outRoot));

const bundleStartedAt = Date.now();
console.log("\n== Bundle ==");
const serveUrl = await bundle({
  entryPoint: project.entryPath,
  publicDir: project.publicRoot,
});
console.log("Bundle ready in " + ((Date.now() - bundleStartedAt) / 1000).toFixed(1) + "s");

const compositions = new Map();
const compositionStartedAt = Date.now();
for (const section of selected) {
  const id = project.manifest.composition + "-" + section.id;
  try {
    const composition = await selectComposition({
      serveUrl,
      id,
      inputProps: {},
    });
    compositions.set(section.id, composition);
  } catch (error) {
    console.error(
      "\nComposition not found: " + id + "\n" +
        "Register it in the project Root.tsx with SectionRoot, then retry.",
    );
    throw error;
  }
}
console.log(
  "Compositions resolved in " +
    ((Date.now() - compositionStartedAt) / 1000).toFixed(1) +
    "s",
);

console.log("\n== Render stills ==");
let finished = 0;
const shots = await runPool(
  tasks,
  Number(args.values.get("concurrency") ?? 2),
  async ({section, frame}) => {
    const composition = compositions.get(section.id);
    const globalFrame = section.startFrame + frame;
    const fileName =
      section.id + "-" + String(globalFrame).padStart(4, "0") + ".png";
    const output = path.join(shotsDir, fileName);
    const startedAt = Date.now();

    await renderStill({
      composition,
      serveUrl,
      output,
      frame,
      imageFormat: "png",
      scale,
      overwrite: true,
    });

    finished += 1;
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(
      "[" + finished + "/" + tasks.length + "] " +
        section.id + " f" + frame + " -> " + fileName + " (" + elapsed + "s)",
    );

    return {section, frame, globalFrame, fileName};
  },
);

const fps = timeline.fps ?? 30;
const cards = selected
  .map((section) => {
    const sectionShots = shots.filter((shot) => shot.section.id === section.id);
    const figures = sectionShots
      .map(
        (shot) => `
        <figure class="shot">
          <div class="frame">
            <img src="shots/${shot.fileName}" alt="${section.id} frame ${shot.globalFrame}" loading="lazy" />
            <div class="safe" title="字幕安全区参考线"></div>
          </div>
          <figcaption>
            <b>${section.id}</b>
            <span>f${shot.frame}</span>
            <span>${formatTimecode(shot.globalFrame, fps)}</span>
          </figcaption>
        </figure>`,
      )
      .join("");

    return `
      <section>
        <header>
          <h2>${section.id}</h2>
          <p>${formatTimecode(section.startFrame, fps)} – ${formatTimecode(section.endFrame, fps)} · ${section.endFrame - section.startFrame} 帧</p>
        </header>
        <div class="grid">${figures}</div>
      </section>`;
  })
  .join("");

const generatedAt = new Date().toLocaleString("zh-CN", {hour12: false});
const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${project.manifest.id} 关键帧预览</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 40px clamp(20px, 5vw, 64px) 64px;
      background: #0b0b10;
      color: #f2f2f5;
      font-family: "Segoe UI", "Microsoft YaHei", system-ui, sans-serif;
    }
    h1 { margin: 0 0 8px; font-size: 28px; letter-spacing: 0.02em; }
    .meta { margin: 0 0 36px; color: #8d8d99; font-size: 13px; }
    section { margin-bottom: 44px; }
    header { display: flex; align-items: baseline; gap: 16px; margin-bottom: 14px; }
    h2 { margin: 0; font-size: 20px; color: #d8ff5f; }
    header p { margin: 0; color: #8d8d99; font-size: 12px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(420px, 100%), 1fr));
      gap: 18px;
    }
    .shot { margin: 0; }
    .frame { position: relative; border-radius: 10px; overflow: hidden; background: #17171f; }
    .frame img { display: block; width: 100%; height: auto; }
    .safe { position: absolute; inset: 0; pointer-events: none; }
    .safe::before {
      content: "";
      position: absolute;
      left: 8%;
      right: 8%;
      bottom: 0;
      height: 12%;
      border: 1px dashed rgba(255, 92, 92, 0.55);
      border-bottom: 0;
    }
    figcaption {
      display: flex;
      gap: 10px;
      align-items: baseline;
      padding: 8px 2px 0;
      color: #8d8d99;
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
    figcaption b { color: #f2f2f5; font-weight: 600; }
  </style>
</head>
<body>
  <h1>${project.manifest.id} 关键帧预览</h1>
  <p class="meta">${shots.length} 帧 · scale ${scale} · 生成于 ${generatedAt} · 红色虚线为字幕安全区参考（底部 12%）</p>
  ${cards}
</body>
</html>
`;

const galleryPath = path.join(outRoot, "index.html");
fs.writeFileSync(galleryPath, html, "utf8");

console.log("\nPREVIEW READY");
console.log("gallery: " + relativeToRoot(galleryPath));
console.log("elapsed: " + ((Date.now() - bundleStartedAt) / 1000).toFixed(1) + "s");

if (args.flags.has("open")) {
  if (process.platform === "win32") {
    spawn("cmd.exe", ["/c", "start", "", galleryPath], {
      detached: true,
      stdio: "ignore",
    }).unref();
  } else {
    spawn(process.platform === "darwin" ? "open" : "xdg-open", [galleryPath], {
      detached: true,
      stdio: "ignore",
    }).unref();
  }
}
