import fs from "node:fs";
import path from "node:path";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";
import {requireBinary} from "./lib/binaries.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

const readArg = (name) => {
  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  const prefixed = args.find((arg) => arg.startsWith(name + "="));
  return prefixed ? prefixed.slice(name.length + 1) : undefined;
};

const manifestArg = readArg("--manifest");
if (!manifestArg) {
  console.error("Usage: npm run voice -- --manifest local/projects/<name>/lines.json [--force]");
  process.exit(1);
}

const manifestPath = path.resolve(root, manifestArg);
if (!fs.existsSync(manifestPath)) {
  console.error("Manifest not found: " + manifestPath);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const project = manifest.project ?? path.basename(path.dirname(manifestPath));
if (!/^[a-zA-Z0-9_-]+$/.test(project)) {
  console.error("Invalid project name: " + project);
  process.exit(1);
}

const profilePath = path.join(root, "src", "audio", "voiceProfiles.json");
const profiles = JSON.parse(fs.readFileSync(profilePath, "utf8")).profiles;
const defaultProfile = profiles.find((profile) => profile.default) ?? profiles[0];
const fps = Number(manifest.fps ?? 30);
const voice = manifest.voice ?? defaultProfile.voice;
const rate = manifest.rate ?? defaultProfile.rate;
const pitch = manifest.pitch ?? defaultProfile.pitch ?? "+0Hz";
const force = args.includes("--force") || process.env.FORCE_TTS === "1";

if (!Number.isFinite(fps) || fps <= 0) {
  console.error("Invalid fps: " + manifest.fps);
  process.exit(1);
}

const publicRoot = path.join(root, "public");
const outDir = path.join(root, "local", "projects", project);
const timelineJsonPath = path.join(outDir, "timeline.generated.json");
const timelineTsPath = path.join(outDir, "timeline.generated.ts");

const run = (command, commandArgs, env = process.env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
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

const ffprobe = requireBinary("ffprobe", "FFPROBE_PATH");
const python = process.env.PYTHON ?? (process.platform === "win32" ? "python" : "python3");
const siblingTools = path.resolve(root, "..", ".tools");
const pythonPath =
  process.env.EDGE_TTS_PYTHONPATH ??
  (fs.existsSync(siblingTools) ? siblingTools : "");
const ttsEnv = pythonPath ? {...process.env, PYTHONPATH: pythonPath} : process.env;

const resolveAudioRel = (line) => {
  const relative = line.file ?? "projects/" + project + "/audio/" + line.id + ".mp3";
  const normalized = relative.replace(/\\/g, "/");
  const absolute = path.resolve(publicRoot, normalized);
  if (!absolute.startsWith(publicRoot + path.sep)) {
    throw new Error("Audio path escapes public/: " + relative);
  }
  return normalized;
};

const getDuration = async (filePath) => {
  const {stdout} = await run(ffprobe, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  const duration = Number.parseFloat(stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Could not read audio duration: " + filePath);
  }
  return duration;
};

const sections = manifest.sections ?? [];
if (!Array.isArray(sections) || sections.length === 0) {
  console.error("Manifest must contain at least one section.");
  process.exit(1);
}

const allLines = sections.flatMap((section) => section.lines ?? []);
if (allLines.length === 0) {
  console.error("Manifest must contain at least one line.");
  process.exit(1);
}

for (const line of allLines) {
  if (!line.id || !line.text) {
    console.error("Every line needs id and text.");
    process.exit(1);
  }
  line.file = resolveAudioRel(line);
}

const pending = allLines.filter((line) => {
  const absolute = path.join(publicRoot, line.file);
  return force || !fs.existsSync(absolute);
});

const ensureLine = async (line) => {
  const absolute = path.join(publicRoot, line.file);
  fs.mkdirSync(path.dirname(absolute), {recursive: true});
  const ttsArgs = [
    "-m",
    "edge_tts",
    "--voice",
    voice,
    "--rate=" + rate,
  ];
  if (pitch && pitch !== "+0Hz") {
    ttsArgs.push("--pitch=" + pitch);
  }
  ttsArgs.push("--text", line.text, "--write-media", absolute);
  await run(python, ttsArgs, ttsEnv);
  return {id: line.id, file: line.file};
};

for (let index = 0; index < pending.length; index += 3) {
  const batch = pending.slice(index, index + 3);
  const results = await Promise.all(batch.map(ensureLine));
  for (const result of results) {
    console.log("tts  " + result.id + " -> " + result.file);
  }
}
for (const line of allLines) {
  if (!pending.includes(line)) {
    console.log("keep " + line.id + " -> " + line.file);
  }
}

let cursor = 0;
const sectionsOut = [];
const linesOut = [];

for (const section of sections) {
  const sectionLines = section.lines ?? [];
  if (sectionLines.length === 0) continue;

  const durations = [];
  for (const line of sectionLines) {
    durations.push(await getDuration(path.join(publicRoot, line.file)));
  }

  const audioFrames = durations.reduce(
    (sum, duration) => sum + Math.ceil(duration * fps),
    0,
  );
  const leadFrames = Number(section.leadFrames ?? 0);
  const requestedGap = Number(section.gapFrames ?? 0);
  const tailFrames = Number(section.tailFrames ?? 14);
  const lineCount = sectionLines.length;
  let gapFrames = requestedGap;

  if (section.targetFrames != null && lineCount > 1) {
    const available =
      Number(section.targetFrames) - leadFrames - tailFrames - audioFrames;
    gapFrames = Math.max(
      0,
      Math.min(requestedGap, Math.floor(available / (lineCount - 1))),
    );
  }

  const required =
    audioFrames +
    leadFrames +
    gapFrames * Math.max(0, lineCount - 1) +
    tailFrames;
  const sectionFrames =
    section.targetFrames != null ? Number(section.targetFrames) : required;

  if (required > sectionFrames) {
    throw new Error(
      section.id +
        " is over budget: need " +
        required +
        " frames, target " +
        sectionFrames +
        ". Audio alone is " +
        audioFrames +
        " frames.",
    );
  }

  const sectionStart = cursor;
  const sectionEnd = sectionStart + sectionFrames;
  let start = sectionStart + leadFrames;

  for (let index = 0; index < lineCount; index++) {
    const line = sectionLines[index];
    if (line.startFrame != null) {
      start = sectionStart + Number(line.startFrame);
    }
    const durationFrames = Math.ceil(durations[index] * fps);
    const end = start + durationFrames;

    linesOut.push({
      id: line.id,
      section: section.id,
      file: line.file,
      text: line.text,
      highlights: line.highlights ?? [],
      durationSeconds: Number(durations[index].toFixed(3)),
      startFrame: Math.round(start),
      endFrame: Math.round(end),
      captionStartFrame: Math.max(sectionStart, Math.round(start) - 2),
      captionEndFrame: Math.min(
        sectionEnd,
        Math.round(end) + Math.max(10, Math.round(gapFrames) - 2),
      ),
    });

    start = end + gapFrames;
  }

  sectionsOut.push({
    id: section.id,
    startFrame: sectionStart,
    endFrame: sectionEnd,
    audioSeconds: Number(
      durations.reduce((sum, duration) => sum + duration, 0).toFixed(3),
    ),
    gapFrames: Math.round(gapFrames),
  });

  console.log(
    section.id.padEnd(14) +
      " " +
      (sectionStart / fps).toFixed(2).padStart(6) +
      "s -> " +
      (sectionEnd / fps).toFixed(2).padStart(6) +
      "s",
  );

  cursor = sectionEnd;
}

const generated = {
  project,
  fps,
  voice,
  rate,
  durationInFrames: cursor,
  sections: sectionsOut,
  lines: linesOut,
};

fs.mkdirSync(outDir, {recursive: true});
fs.writeFileSync(
  timelineJsonPath,
  JSON.stringify(generated, null, 2) + "\n",
);

const ts = `// Generated by scripts/generate-voiceover.mjs. Private local file.
export type VoiceLineTiming = {
  id: string;
  section: string;
  file: string;
  text: string;
  highlights: string[];
  durationSeconds: number;
  startFrame: number;
  endFrame: number;
  captionStartFrame: number;
  captionEndFrame: number;
};

export type VoiceSectionTiming = {
  id: string;
  startFrame: number;
  endFrame: number;
  audioSeconds: number;
  gapFrames: number;
};

export const VOICE_META = ${JSON.stringify(
  {project, fps, voice, rate, durationInFrames: cursor},
  null,
  2,
)} as const;

export const VOICE_LINES: VoiceLineTiming[] = ${JSON.stringify(
  linesOut,
  null,
  2,
)};

export const VOICE_SECTIONS: VoiceSectionTiming[] = ${JSON.stringify(
  sectionsOut,
  null,
  2,
)};
`;
fs.writeFileSync(timelineTsPath, ts);

console.log("");
console.log("project: " + project);
console.log("audio:   " + path.join(publicRoot, "projects", project, "audio"));
console.log("timeline:" + timelineJsonPath);
console.log("frames:  " + cursor + " (" + (cursor / fps).toFixed(2) + "s)");
