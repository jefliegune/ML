import fs from "node:fs";
import path from "node:path";
import {bundle} from "@remotion/bundler";
import {renderMedia, selectComposition} from "@remotion/renderer";
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
    "Usage: node scripts/render-project.mjs --project <id|path> [--frames 0-120] [--scale 0.5] [--out path]",
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

const outputPath = args.values.has("out")
  ? path.resolve(root, args.values.get("out"))
  : project.outputPath;
const frames = args.values.get("frames");
const scale = Number(args.values.get("scale") ?? 1);
const crf = Number(args.values.get("crf") ?? project.render.crf);
const concurrency = Number(
  args.values.get("concurrency") ?? project.render.concurrency,
);

if (!Number.isFinite(scale) || scale <= 0 || scale > 1) {
  console.error("--scale must be greater than 0 and at most 1.");
  process.exit(1);
}
if (!Number.isInteger(crf) || crf < 0 || crf > 51) {
  console.error("--crf must be an integer from 0 to 51.");
  process.exit(1);
}

let frameRange;
if (frames) {
  const match = /^(\d+)-(\d+)$/.exec(frames);
  if (!match) {
    console.error("--frames must look like 0-120.");
    process.exit(1);
  }
  frameRange = [Number(match[1]), Number(match[2])];
}

fs.mkdirSync(path.dirname(outputPath), {recursive: true});

console.log("PROJECT RENDER / " + project.manifest.id);
console.log("entry:       " + relativeToRoot(project.entryPath));
console.log("composition: " + project.manifest.composition);
console.log("output:      " + relativeToRoot(outputPath));
if (frameRange) {
  console.log("frames:      " + frameRange[0] + "-" + frameRange[1]);
}
console.log("scale:       " + scale + " · crf " + crf);

const startedAt = Date.now();
console.log("\n== Bundle ==");
const serveUrl = await bundle({
  entryPoint: project.entryPath,
  publicDir: project.publicRoot,
});
console.log(
  "Bundle ready in " + ((Date.now() - startedAt) / 1000).toFixed(1) + "s",
);

const composition = await selectComposition({
  serveUrl,
  id: project.manifest.composition,
  inputProps: {},
});

let lastReported = -1;
console.log("\n== Render ==");
await renderMedia({
  composition,
  serveUrl,
  codec: project.render.codec,
  outputLocation: outputPath,
  crf,
  pixelFormat: project.render.pixelFormat,
  audioCodec: project.render.audioCodec,
  audioBitrate: project.render.audioBitrate,
  concurrency,
  frameRange,
  scale,
  overwrite: true,
  onProgress: ({progress}) => {
    const percent = Math.floor(progress * 20) * 5;
    if (percent > lastReported) {
      lastReported = percent;
      console.log("  " + percent + "%");
    }
  },
});

const bytes = fs.statSync(outputPath).size;
console.log("\nRENDER READY");
console.log("file:    " + relativeToRoot(outputPath));
console.log("size:    " + (bytes / 1024 / 1024).toFixed(2) + " MB");
console.log("elapsed: " + ((Date.now() - startedAt) / 1000).toFixed(1) + "s");
