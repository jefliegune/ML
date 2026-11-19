import fs from "node:fs";
import path from "node:path";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";
import {requireBinary} from "./lib/binaries.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "scripts", "full-lines.json");
const generatedJsonPath = path.join(root, "scripts", "full-lines.generated.json");
const generatedTsPath = path.join(root, "src", "full", "voiceTimeline.generated.ts");
const audioDir = path.join(root, "public", "audio");
const fullAudioDir = path.join(root, "public", "audio", "full");
const localToolsDir = path.resolve(root, "..", ".tools");
const toolsDir =
  process.env.EDGE_TTS_PYTHONPATH ??
  (fs.existsSync(localToolsDir) ? localToolsDir : null);
const python =
  process.env.PYTHON ?? (process.platform === "win32" ? "python" : "python3");
const ffprobePath = requireBinary("ffprobe", "FFPROBE_PATH");

fs.mkdirSync(fullAudioDir, {recursive: true});
fs.mkdirSync(path.dirname(generatedTsPath), {recursive: true});

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
        reject(new Error(`${command} exited with ${code}\n${stderr}`));
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
  if (!line.file) {
    line.file = `audio/full/${line.id}.mp3`;
  }
  const absolutePath = path.join(root, "public", line.file);
  if (!force && fs.existsSync(absolutePath)) {
    return {line, skipped: true};
  }
  const env = toolsDir
    ? {...process.env, PYTHONPATH: toolsDir}
    : {...process.env};
  await run(
    python,
    [
      "-m",
      "edge_tts",
      "--voice",
      manifest.voice,
      `--rate=${manifest.rate}`,
      "--text",
      line.text,
      "--write-media",
      absolutePath,
    ],
    env,
  );
  return {line, skipped: false};
};

const missingLines = [];
for (const section of manifest.sections) {
  for (const line of section.lines) {
    if (!line.file) {
      line.file = `audio/full/${line.id}.mp3`;
    }
    const absolutePath = path.join(root, "public", line.file);
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
    console.log(`${result.skipped ? "keep" : "tts "} ${result.line.id}`);
  }
  cursor += batch.length;
}

const fps = 30;
let sectionStartFrame = 0;
const sectionsOut = [];
const linesOut = [];

for (const section of manifest.sections) {
  const durations = [];
  for (const line of section.lines) {
    const absolutePath = path.join(root, "public", line.file);
    const duration = await getDuration(absolutePath);
    durations.push(duration);
  }

  const targetFrames = section.targetFrames;
  const sectionEndFrame = sectionStartFrame + targetFrames;
  const totalAudioFrames = durations.reduce(
    (sum, duration) => sum + Math.ceil(duration * fps),
    0,
  );
  const lineCount = section.lines.length;
  const leadFrames = section.id === "opening" ? 0 : section.leadFrames;
  const requestedGap = section.gapFrames;
  const tailFrames = section.id === "opening" ? 0 : 14;
  let gapFrames = requestedGap;

  if (section.id !== "opening" && lineCount > 1) {
    const availableForGaps = targetFrames - leadFrames - tailFrames - totalAudioFrames;
    const maxGap = Math.floor(availableForGaps / (lineCount - 1));
    gapFrames = Math.max(0, Math.min(requestedGap, maxGap));
  }

  const required = totalAudioFrames + leadFrames + gapFrames * Math.max(0, lineCount - 1) + tailFrames;
  if (section.id !== "opening" && required > targetFrames) {
    throw new Error(
      `${section.id} is over budget: need ${required} frames, target ${targetFrames}. ` +
        `Audio alone is ${totalAudioFrames} frames.`,
    );
  }

  let start = sectionStartFrame + leadFrames;
  for (let index = 0; index < section.lines.length; index++) {
    const line = section.lines[index];
    const durationFrames = Math.ceil(durations[index] * fps);
    if (section.id === "opening") {
      start = sectionStartFrame + line.startFrame;
    }
    const end = start + durationFrames;
    const nextStart = section.id === "opening" ? null : end + gapFrames;
    const lineOut = {
      id: line.id,
      section: section.id,
      file: line.file,
      text: line.text,
      highlights: line.highlights ?? [],
      durationSeconds: Number(durations[index].toFixed(3)),
      startFrame: Math.round(start),
      endFrame: Math.round(end),
      captionStartFrame: Math.max(sectionStartFrame, Math.round(start) - 2),
      captionEndFrame:
        section.id === "opening"
          ? Math.round(end + 10)
          : Math.min(sectionEndFrame, Math.round(end + Math.max(10, gapFrames - 2))),
    };
    linesOut.push(lineOut);
    if (section.id !== "opening") {
      start = nextStart;
    }
  }

  sectionsOut.push({
    id: section.id,
    startFrame: sectionStartFrame,
    endFrame: sectionEndFrame,
    audioSeconds: Number(
      durations.reduce((sum, duration) => sum + duration, 0).toFixed(3),
    ),
    gapFrames,
  });

  console.log(
    `${section.id.padEnd(12)} ${(sectionStartFrame / fps)
      .toFixed(2)
      .padStart(6)}s -> ${(sectionEndFrame / fps)
      .toFixed(2)
      .padStart(6)}s  audio=${(
      durations.reduce((sum, duration) => sum + duration, 0)
    ).toFixed(2)}s`,
  );

  sectionStartFrame = sectionEndFrame;
}

if (sectionStartFrame !== 3600) {
  throw new Error(`Timeline ends at ${sectionStartFrame}, expected 3600`);
}

const generated = {sections: sectionsOut, lines: linesOut};
fs.writeFileSync(generatedJsonPath, `${JSON.stringify(generated, null, 2)}\n`);

const ts = `// Generated by scripts/generate-full-voiceover.mjs. Do not edit by hand.\nexport type VoiceLineTiming = {\n  id: string;\n  section: string;\n  file: string;\n  text: string;\n  highlights: string[];\n  durationSeconds: number;\n  startFrame: number;\n  endFrame: number;\n  captionStartFrame: number;\n  captionEndFrame: number;\n};\n\nexport const VOICE_LINES: VoiceLineTiming[] = ${JSON.stringify(
  linesOut,
  null,
  2,
)};\n\nexport const FULL_SECTIONS = ${JSON.stringify(sectionsOut, null, 2)};\n`;
fs.writeFileSync(generatedTsPath, ts);
console.log(`Wrote ${generatedTsPath}`);
