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

if (!selector) {
  console.error(
    "Usage: npm run pipeline -- --project <id|path> [--skip-render] [--skip-master] [--skip-verify] [--skip-cover] [--dry-run]",
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

const remotionCli = path.join(
  root,
  "node_modules",
  "@remotion",
  "cli",
  "remotion-cli.js",
);
if (!fs.existsSync(remotionCli)) {
  console.error("Remotion CLI not found. Run npm ci first: " + remotionCli);
  process.exit(1);
}

const renderArgs = [
  remotionCli,
  "render",
  project.entryPath,
  project.manifest.composition,
  project.outputPath,
  "--config",
  project.configPath,
  "--codec",
  project.render.codec,
  "--crf",
  String(project.render.crf),
  "--pixel-format",
  project.render.pixelFormat,
  "--audio-codec",
  project.render.audioCodec,
  "--audio-bitrate",
  project.render.audioBitrate,
  "--concurrency",
  String(project.render.concurrency),
];
if (args.values.has("frames"))
  renderArgs.push("--frames=" + args.values.get("frames"));
if (args.values.has("scale"))
  renderArgs.push("--scale=" + args.values.get("scale"));

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
  `cover:      ${
    project.cover
      ? relativeToRoot(project.cover.outputPath)
      : "not configured"
  }`,
);
if (!project.cover) {
  console.warn(
    "WARN: cover is not configured; no 4:3 cover will be generated.",
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
