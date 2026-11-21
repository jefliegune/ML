import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export const toPosix = (value) => value.split(path.sep).join("/");

export const relativeToRoot = (value) => toPosix(path.relative(root, value));

export const isInside = (parent, child) => {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
};

export const readJson = (filePath) =>
  JSON.parse(fs.readFileSync(filePath, "utf8"));

export const parseArgs = (argv = process.argv.slice(2)) => {
  const values = new Map();
  const flags = new Set();
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }

    const separator = arg.indexOf("=");
    if (separator >= 0) {
      values.set(arg.slice(2, separator), arg.slice(separator + 1));
      continue;
    }

    const name = arg.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      values.set(name, next);
      index += 1;
    } else {
      flags.add(name);
    }
  }

  return { values, flags, positionals };
};

const resolveProjectFile = (selector) => {
  const direct = path.resolve(root, selector);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) {
    return path.join(direct, "video.project.json");
  }

  const candidates = [
    path.join(root, "projects", selector + ".json"),
    path.join(root, "projects", selector, "video.project.json"),
    path.join(root, "local", "projects", selector, "video.project.json"),
  ];
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (found) return found;

  throw new Error(
    "Project manifest not found: " +
      selector +
      "\nTried:\n  " +
      [direct, ...candidates].map(toPosix).join("\n  "),
  );
};

const requireString = (manifest, field, errors) => {
  if (typeof manifest[field] !== "string" || manifest[field].trim() === "") {
    errors.push(field + " must be a non-empty string");
  }
};

const positiveInteger = (value) => Number.isInteger(value) && value > 0;

export const loadVideoProject = (selector) => {
  if (!selector) {
    throw new Error("Missing project selector. Use --project <id|path>.");
  }

  const manifestPath = resolveProjectFile(selector);
  const manifest = readJson(manifestPath);
  const errors = [];

  for (const field of ["id", "root", "entry", "composition", "output"]) {
    requireString(manifest, field, errors);
  }

  if (
    typeof manifest.id === "string" &&
    !/^[a-zA-Z0-9_-]+$/.test(manifest.id)
  ) {
    errors.push("id may only contain letters, digits, hyphen and underscore");
  }

  if (errors.length > 0) {
    throw new Error(
      "Invalid project manifest: " +
        toPosix(manifestPath) +
        "\n- " +
        errors.join("\n- "),
    );
  }

  const projectRoot = path.resolve(root, manifest.root);
  if (!isInside(root, projectRoot)) {
    errors.push("root must stay inside the repository");
  }
  if (!fs.existsSync(projectRoot) || !fs.statSync(projectRoot).isDirectory()) {
    errors.push("root directory does not exist: " + toPosix(projectRoot));
  }

  const entryPath = path.resolve(projectRoot, manifest.entry);
  if (!isInside(projectRoot, entryPath)) {
    errors.push("entry must stay inside root");
  }
  if (!fs.existsSync(entryPath)) {
    errors.push("entry does not exist: " + toPosix(entryPath));
  }
  if (!/\.(ts|tsx)$/.test(manifest.entry)) {
    errors.push("entry must be a TypeScript or TSX file");
  }

  let timelinePath = null;
  if (manifest.timeline != null) {
    if (
      typeof manifest.timeline !== "string" ||
      manifest.timeline.trim() === ""
    ) {
      errors.push("timeline must be a non-empty string when provided");
    } else {
      timelinePath = path.resolve(projectRoot, manifest.timeline);
      if (!isInside(projectRoot, timelinePath)) {
        errors.push("timeline must stay inside root");
      }
      if (!fs.existsSync(timelinePath)) {
        errors.push("timeline does not exist: " + toPosix(timelinePath));
      }
    }
  }

  let timelineTypesPath = null;
  if (manifest.timelineTypes != null) {
    if (
      typeof manifest.timelineTypes !== "string" ||
      manifest.timelineTypes.trim() === ""
    ) {
      errors.push("timelineTypes must be a non-empty string when provided");
    } else {
      timelineTypesPath = path.resolve(projectRoot, manifest.timelineTypes);
      if (!isInside(projectRoot, timelineTypesPath)) {
        errors.push("timelineTypes must stay inside root");
      }
      if (!fs.existsSync(timelineTypesPath)) {
        errors.push(
          "timelineTypes does not exist: " + toPosix(timelineTypesPath),
        );
      }
    }
  }

  const outputPath = path.resolve(root, manifest.output);
  if (!/\.mp4$/i.test(manifest.output)) {
    errors.push("output must use the .mp4 extension");
  }
  if (!isInside(root, outputPath)) {
    errors.push("output must stay inside the repository");
  }
  const outputRoots = [path.join(root, "local", "out"), path.join(root, "out")];
  if (!outputRoots.some((outputRoot) => isInside(outputRoot, outputPath))) {
    errors.push("output must be under local/out/ or out/");
  }

  const masterValue =
    manifest.master ?? manifest.output.replace(/\.mp4$/i, "-final.mp4");
  const masterPath = path.resolve(root, masterValue);
  if (!/\.mp4$/i.test(masterValue)) {
    errors.push("master must use the .mp4 extension");
  }
  if (!isInside(root, masterPath)) {
    errors.push("master must stay inside the repository");
  }
  if (!outputRoots.some((outputRoot) => isInside(outputRoot, masterPath))) {
    errors.push("master must be under local/out/ or out/");
  }
  if (masterPath === outputPath) {
    errors.push("master must be different from output");
  }

  const render = {
    codec: manifest.render?.codec ?? "h264",
    crf: manifest.render?.crf ?? 18,
    pixelFormat: manifest.render?.pixelFormat ?? "yuv420p",
    audioCodec: manifest.render?.audioCodec ?? "aac",
    audioBitrate: manifest.render?.audioBitrate ?? "192k",
    concurrency: manifest.render?.concurrency ?? 8,
  };
  if (!Number.isInteger(render.crf) || render.crf < 0 || render.crf > 51) {
    errors.push("render.crf must be an integer from 0 to 51");
  }
  if (!positiveInteger(render.concurrency)) {
    errors.push("render.concurrency must be a positive integer");
  }

  const targetLufs = manifest.audio?.targetLufs ?? -16;
  if (!Number.isFinite(targetLufs) || targetLufs < -24 || targetLufs > -10) {
    errors.push("audio.targetLufs must be between -24 and -10");
  }

  let video = null;
  if (manifest.video != null) {
    for (const field of ["width", "height", "fps", "durationInFrames"]) {
      if (!positiveInteger(manifest.video[field])) {
        errors.push("video." + field + " must be a positive integer");
      }
    }
    video = {
      width: manifest.video.width,
      height: manifest.video.height,
      fps: manifest.video.fps,
      durationInFrames: manifest.video.durationInFrames,
    };
  }

  if (errors.length > 0) {
    throw new Error(
      "Invalid project manifest: " +
        toPosix(manifestPath) +
        "\n- " +
        errors.join("\n- "),
    );
  }

  return {
    manifest,
    manifestPath,
    projectRoot,
    entryPath,
    timelinePath,
    timelineTypesPath,
    outputPath,
    masterPath,
    publicRoot: path.join(root, "public"),
    configPath: path.join(root, "remotion.config.ts"),
    render,
    audio: { targetLufs },
    video,
  };
};
