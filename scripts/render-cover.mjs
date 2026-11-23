import fs from "node:fs";
import path from "node:path";
import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";
import {
  COVER_HEIGHT,
  COVER_WIDTH,
  loadVideoProject,
  parseArgs,
  relativeToRoot,
} from "./lib/video-project.mjs";

const args = parseArgs();
const selector = args.values.get("project") ?? args.positionals[0];

if (!selector) {
  console.error("Usage: node scripts/render-cover.mjs --project <id|path>");
  process.exit(1);
}

let project;
try {
  project = loadVideoProject(selector);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

if (!project.cover) {
  console.error(
    "Project has no cover configuration. Add a cover object with a 4:3 cover composition.",
  );
  process.exit(1);
}

console.log("COVER RENDER / " + project.manifest.id);
console.log("entry:       " + relativeToRoot(project.entryPath));
console.log("composition: " + project.cover.composition);
console.log("frame:       " + project.cover.frame);
console.log("size:        " + COVER_WIDTH + "x" + COVER_HEIGHT);
console.log("output:      " + relativeToRoot(project.cover.outputPath));

const serveUrl = await bundle({
  entryPoint: project.entryPath,
  publicDir: project.publicRoot,
});

const composition = await selectComposition({
  serveUrl,
  id: project.cover.composition,
  inputProps: {},
});

if (
  composition.width !== COVER_WIDTH ||
  composition.height !== COVER_HEIGHT
) {
  console.error(
    "Cover composition must be 1440x1080. Found " +
      composition.width +
      "x" +
      composition.height +
      ".",
  );
  process.exit(1);
}

if (project.cover.frame >= composition.durationInFrames) {
  console.error(
    "Cover frame " +
      project.cover.frame +
      " is outside composition duration " +
      composition.durationInFrames +
      ".",
  );
  process.exit(1);
}

fs.mkdirSync(path.dirname(project.cover.outputPath), {recursive: true});

await renderStill({
  composition,
  serveUrl,
  output: project.cover.outputPath,
  frame: project.cover.frame,
  overwrite: true,
});

console.log("COVER READY");
console.log("file: " + relativeToRoot(project.cover.outputPath));
