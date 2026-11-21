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
const sectionId = args.values.get("section") ?? args.positionals[1];

if (!selector || !sectionId) {
  console.error(
    "Usage: node scripts/preview-section.mjs --project <id|path> --section <id> [--draft] [--scale 0.5] [--crf 28]",
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
const section = sections.find((item) => item.id === sectionId);

if (!section) {
  console.error(
    "Unknown section: " + sectionId + "\nAvailable: " +
      sections.map((item) => item.id).join(", "),
  );
  process.exit(1);
}

const draft = args.flags.has("draft");
const scale = Number(args.values.get("scale") ?? (draft ? 0.5 : 1));
const crf = Number(args.values.get("crf") ?? (draft ? 28 : project.render.crf));

if (!Number.isFinite(scale) || scale <= 0 || scale > 1) {
  console.error("--scale must be greater than 0 and at most 1.");
  process.exit(1);
}
if (!Number.isInteger(crf) || crf < 0 || crf > 51) {
  console.error("--crf must be an integer from 0 to 51.");
  process.exit(1);
}

const outputPath = path.resolve(
  root,
  args.values.get("out") ??
    path.join(
      "local",
      "preview",
      project.manifest.id,
      "sections",
      section.id + ".mp4",
    ),
);
fs.mkdirSync(path.dirname(outputPath), {recursive: true});

const compositionId = project.manifest.composition + "-" + section.id;

console.log("PREVIEW SECTION / " + project.manifest.id + " / " + section.id);
console.log("entry:       " + relativeToRoot(project.entryPath));
console.log("composition: " + compositionId);
console.log(
  "range:       " + section.startFrame + "–" + (section.endFrame - 1) +
    " (" + (section.endFrame - section.startFrame) + " frames)",
);
console.log("scale:       " + scale + " · crf " + crf);
console.log("output:      " + relativeToRoot(outputPath));

const startedAt = Date.now();
console.log("\n== Bundle ==");
const serveUrl = await bundle({
  entryPoint: project.entryPath,
  publicDir: project.publicRoot,
});
console.log("Bundle ready in " + ((Date.now() - startedAt) / 1000).toFixed(1) + "s");

let composition;
try {
  composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps: {},
  });
} catch (error) {
  console.error(
    "\nComposition not found: " + compositionId + "\n" +
      "Register it in the project Root.tsx with SectionRoot, then retry.",
  );
  throw error;
}

let lastReported = -1;
console.log("\n== Render ==");
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: outputPath,
  crf,
  pixelFormat: "yuv420p",
  audioCodec: "aac",
  audioBitrate: "192k",
  concurrency: Number(
    args.values.get("concurrency") ?? project.render.concurrency,
  ),
  scale,
  overwrite: true,
  onProgress: ({progress}) => {
    const percent = Math.floor(progress * 10) * 10;
    if (percent > lastReported) {
      lastReported = percent;
      console.log("  " + percent + "%");
    }
  },
});

const bytes = fs.statSync(outputPath).size;
console.log("\nSECTION READY");
console.log("file:    " + relativeToRoot(outputPath));
console.log("size:    " + (bytes / 1024 / 1024).toFixed(2) + " MB");
console.log("elapsed: " + ((Date.now() - startedAt) / 1000).toFixed(1) + "s");
