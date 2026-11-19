import fs from "node:fs";
import path from "node:path";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";
import {requireBinary} from "./lib/binaries.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "local", "promo", "lines.json");
const propsPath = path.join(root, "local", "promo", "promo-props.json");
const markdownPath = path.join(root, "local", "promo", "timeline.md");
const audioDir = path.join(root, "public", "audio", "promo");
const localToolsDir = path.resolve(root, "..", ".tools");
const python = process.env.PYTHON ?? (process.platform === "win32" ? "python" : "python3");
const ffprobePath = requireBinary("ffprobe", "FFPROBE_PATH");
const fps = 30;
const totalFrames = 7200;

if (!fs.existsSync(manifestPath)) {
  throw new Error("Missing local/promo/lines.json");
}

fs.mkdirSync(audioDir, {recursive: true});
fs.mkdirSync(path.dirname(propsPath), {recursive: true});

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const force = process.env.FORCE_TTS === "1";

const run = (command, args, env = process.env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({stdout, stderr});
      } else {
        reject(new Error(command + " exited with " + code + "\n" + stderr));
      }
    });
  });

const getDuration = async (filePath) => {
  const {stdout} = await run(ffprobePath, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  return Number.parseFloat(stdout.trim());
};

const ensureLine = async (line) => {
  const relative = "audio/promo/" + line.id + ".mp3";
  const absolutePath = path.join(root, "public", relative);
  if (!force && fs.existsSync(absolutePath)) {
    return {relative, skipped: true};
  }
  const env = fs.existsSync(localToolsDir)
    ? {...process.env, PYTHONPATH: localToolsDir}
    : {...process.env};
  await run(
    python,
    [
      "-m",
      "edge_tts",
      "--voice",
      manifest.voice,
      "--rate=" + manifest.rate,
      "--text",
      line.text,
      "--write-media",
      absolutePath,
    ],
    env,
  );
  return {relative, skipped: false};
};

const missingLines = [];
for (const section of manifest.sections) {
  for (const line of section.lines) {
    const absolutePath = path.join(root, "public", "audio", "promo", line.id + ".mp3");
    if (force || !fs.existsSync(absolutePath)) {
      missingLines.push(line);
    }
  }
}

let cursor = 0;
const concurrency = 4;
while (cursor < missingLines.length) {
  const batch = missingLines.slice(cursor, cursor + concurrency);
  const results = await Promise.all(batch.map(ensureLine));
  for (const result of results) {
    console.log((result.skipped ? "keep " : "tts  ") + result.relative);
  }
  cursor += batch.length;
}

let sectionStartFrame = 0;
const sectionsOut = [];
const linesOut = [];

for (const section of manifest.sections) {
  const durations = [];
  for (const line of section.lines) {
    const absolutePath = path.join(root, "public", "audio", "promo", line.id + ".mp3");
    durations.push(await getDuration(absolutePath));
  }

  const targetFrames = section.targetFrames;
  const sectionEndFrame = sectionStartFrame + targetFrames;
  const totalAudioFrames = durations.reduce(
    (sum, duration) => sum + Math.ceil(duration * fps),
    0,
  );
  const lineCount = section.lines.length;
  const leadFrames = section.leadFrames ?? 8;
  const requestedGap = section.gapFrames ?? 8;
  const tailFrames = 14;
  let gapFrames = requestedGap;

  if (lineCount > 1) {
    const availableForGaps =
      targetFrames - leadFrames - tailFrames - totalAudioFrames;
    const maxGap = Math.floor(availableForGaps / (lineCount - 1));
    gapFrames = Math.max(0, Math.min(requestedGap, maxGap));
  }

  const required =
    totalAudioFrames +
    leadFrames +
    gapFrames * Math.max(0, lineCount - 1) +
    tailFrames;
  if (required > targetFrames) {
    throw new Error(
      section.id +
        " is over budget: need " +
        required +
        " frames, target " +
        targetFrames +
        ". Audio alone is " +
        totalAudioFrames +
        " frames.",
    );
  }

  let start = sectionStartFrame + leadFrames;
  const timing = [];
  for (let index = 0; index < section.lines.length; index++) {
    const durationFrames = Math.ceil(durations[index] * fps);
    const end = start + durationFrames;
    timing.push({
      start: Math.round(start),
      end: Math.round(end),
      captionStart: Math.max(sectionStartFrame, Math.round(start) - 2),
    });
    start = end + gapFrames;
  }

  for (let index = 0; index < section.lines.length; index++) {
    const line = section.lines[index];
    const current = timing[index];
    const next = timing[index + 1];
    const captionEnd = next
      ? Math.max(current.captionStart, next.captionStart - 1)
      : Math.min(sectionEndFrame, current.end + 10);
    linesOut.push({
      id: line.id,
      section: section.id,
      file: "audio/promo/" + line.id + ".mp3",
      text: line.text,
      highlights: line.highlights ?? [],
      durationSeconds: Number(durations[index].toFixed(3)),
      startFrame: current.start,
      endFrame: current.end,
      captionStartFrame: current.captionStart,
      captionEndFrame: Math.min(sectionEndFrame, captionEnd),
    });
  }

  const {lines: _lines, ...design} = section;
  const sectionLines = linesOut.filter((line) => line.section === section.id);
  sectionsOut.push({
    ...design,
    startFrame: sectionStartFrame,
    endFrame: sectionEndFrame,
    gapFrames,
    cues: sectionLines.map((line) => line.startFrame - sectionStartFrame),
    audioSeconds: Number(
      durations.reduce((sum, duration) => sum + duration, 0).toFixed(3),
    ),
  });

  console.log(
    section.id.padEnd(12) +
      " " +
      (sectionStartFrame / fps).toFixed(2).padStart(6) +
      "s -> " +
      (sectionEndFrame / fps).toFixed(2).padStart(6) +
      "s  audio=" +
      durations.reduce((sum, duration) => sum + duration, 0).toFixed(2) +
      "s",
  );

  sectionStartFrame = sectionEndFrame;
}

if (sectionStartFrame !== totalFrames) {
  throw new Error(
    "Timeline ends at " + sectionStartFrame + ", expected " + totalFrames,
  );
}

const props = {
  title: "ML Video System",
  subtitle: "把视频制作变成一套可复用的系统",
  repo: "github.com/jefliegune/ML",
  voice: manifest.voice,
  fps,
  durationInFrames: totalFrames,
  sections: sectionsOut,
  lines: linesOut,
};

fs.writeFileSync(propsPath, JSON.stringify(props, null, 2) + "\n");

const rows = linesOut
  .map(
    (line) =>
      "| " +
      (line.startFrame / fps).toFixed(2) +
      " | " +
      (line.endFrame / fps).toFixed(2) +
      " | " +
      line.section +
      " | " +
      line.text +
      " |",
  )
  .join("\n");
fs.writeFileSync(
  markdownPath,
  "# Promo timeline\n\n| in | out | section | text |\n|---:|---:|---|---|\n" + rows + "\n",
);

console.log("Wrote " + propsPath);
console.log("Wrote " + markdownPath);
