import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  loadVideoProject,
  parseArgs,
  relativeToRoot,
  root,
} from "./lib/video-project.mjs";

const args = parseArgs();
const selector = args.values.get("project") ?? args.positionals[0];
const skipRender = args.flags.has("skip-render");
const skipMaster = args.flags.has("skip-master");
const skipVerify = args.flags.has("skip-verify");
const skipCover = args.flags.has("skip-cover");
const dryRun = args.flags.has("dry-run");
const partialRender = args.values.has("frames");
const allowDraftScale = args.flags.has("allow-draft-scale");
const requestedScale = Number(args.values.get("scale") ?? 1);

if (!selector) {
  console.error(
    "Usage: npm run pipeline -- --project <id|path> [--skip-render] [--skip-master] [--skip-verify] [--skip-cover] [--dry-run] [--allow-draft-scale]",
  );
  process.exit(1);
}

if (
  !Number.isFinite(requestedScale) ||
  requestedScale <= 0 ||
  requestedScale > 1
) {
  console.error("--scale must be greater than 0 and at most 1.");
  process.exit(1);
}

if (requestedScale < 1 && !allowDraftScale) {
  console.error(
    "Refusing to run a delivery pipeline with --scale " +
      requestedScale +
      ".\nUse preview:section for drafts, or add --allow-draft-scale and --skip-verify for a temporary QC run.",
  );
  process.exit(1);
}

if (partialRender && !skipVerify && !dryRun) {
  console.error(
    "--frames renders a partial clip. Add --skip-verify, or render the full composition before verifying.",
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

const run = (label, command, commandArgs) =>
  new Promise((resolve, reject) => {
    console.log(`\n== ${label} ==`);
    console.log([command, ...commandArgs].join(" "));
    const child = spawn(command, commandArgs, {
      cwd: root,
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(label + " failed with exit code " + code));
    });
  });

const renderArgs = [
  path.join(root, "scripts", "render-project.mjs"),
  "--project",
  project.manifestPath,
];
if (args.values.has("frames"))
  renderArgs.push("--frames", args.values.get("frames"));
if (args.values.has("scale"))
  renderArgs.push("--scale", args.values.get("scale"));
if (args.values.has("crf"))
  renderArgs.push("--crf", args.values.get("crf"));
if (args.values.has("image-format"))
  renderArgs.push("--image-format", args.values.get("image-format"));
if (args.values.has("jpeg-quality"))
  renderArgs.push("--jpeg-quality", args.values.get("jpeg-quality"));
if (args.values.has("x264-preset"))
  renderArgs.push("--x264-preset", args.values.get("x264-preset"));
if (args.values.has("concurrency"))
  renderArgs.push("--concurrency", args.values.get("concurrency"));
if (requestedScale < 1 && allowDraftScale) {
  renderArgs.push("--allow-draft-scale");
}

const verifyArgs = [
  path.join(root, "scripts", "verify-video.mjs"),
  project.masterPath,
];
if (project.video) {
  verifyArgs.push(
    "--width",
    String(project.video.width),
    "--height",
    String(project.video.height),
    "--fps",
    String(project.video.fps),
    "--frames",
    String(project.video.durationInFrames),
    "--pixel-format",
    project.render.pixelFormat,
    "--color-space",
    project.render.colorSpace,
    "--audio-bitrate",
    project.render.audioBitrate,
  );
}

const steps = [
  {
    label: "Public boundary check",
    command: process.execPath,
    args: [path.join(root, "scripts", "check-boundaries.mjs")],
  },
];
if (project.timelinePath) {
  steps.push({
    label: "Timeline check",
    command: process.execPath,
    args: [
      path.join(root, "scripts", "check-timeline.mjs"),
      "--project",
      project.manifestPath,
    ],
  });
}
steps.push({
  label: "Composition check",
  command: process.execPath,
  args: [
    path.join(root, "scripts", "check-composition.mjs"),
    "--project",
    project.manifestPath,
  ],
});
if (!skipRender) {
  steps.push({ label: "Render", command: process.execPath, args: renderArgs });
}
if (!skipMaster) {
  steps.push({
    label: "Master",
    command: process.execPath,
    args: [
      path.join(root, "scripts", "master-video.mjs"),
      project.outputPath,
      project.masterPath,
      String(project.audio.targetLufs),
      project.render.audioBitrate,
    ],
  });
}
if (!skipVerify) {
  steps.push({ label: "Verify", command: process.execPath, args: verifyArgs });
}
if (project.cover && !skipCover && !partialRender) {
  steps.push({
    label: "Cover",
    command: process.execPath,
    args: [
      path.join(root, "scripts", "render-cover.mjs"),
      "--project",
      project.manifestPath,
    ],
  });
}

console.log(`PROJECT PIPELINE / ${project.manifest.id}`);
console.log(`entry:      ${relativeToRoot(project.entryPath)}`);
console.log(`composition:${project.manifest.composition}`);
console.log(`output:     ${relativeToRoot(project.outputPath)}`);
console.log(`master:     ${relativeToRoot(project.masterPath)}`);
console.log(
  `delivery:   ${project.render.imageFormat} / crf ${project.render.crf} / audio ${project.render.audioBitrate}`,
);
console.log(
  `cover:      ${
    project.cover
      ? relativeToRoot(project.cover.outputPath)
      : "not configured"
  }`,
);
if (!project.cover) {
  console.warn(
    "WARN: cover is not configured; no 3:4 cover will be generated.",
  );
}

if (dryRun) {
  console.log("\nDRY RUN\n");
  for (const step of steps) {
    console.log(`[${step.label}]`);
    console.log([step.command, ...step.args].join(" "));
  }
  console.log("");
  process.exit(0);
}

fs.mkdirSync(path.dirname(project.outputPath), { recursive: true });
fs.mkdirSync(path.dirname(project.masterPath), { recursive: true });
if (project.cover) {
  fs.mkdirSync(path.dirname(project.cover.outputPath), { recursive: true });
}

for (const step of steps) {
  try {
    await run(step.label, step.command, step.args);
  } catch (error) {
    console.error("\n" + error.message);
    process.exit(1);
  }
}

console.log("\nPIPELINE PASS");
console.log("master: " + relativeToRoot(project.masterPath));
if (project.cover && !skipCover && !partialRender) {
  console.log("cover:  " + relativeToRoot(project.cover.outputPath));
}
