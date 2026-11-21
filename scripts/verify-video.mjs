import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { requireBinary } from "./lib/binaries.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const readOption = (name) => {
  const prefix = "--" + name + "=";
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf("--" + name);
  return index >= 0 ? args[index + 1] : undefined;
};
const readNumber = (name) => {
  const value = readOption(name);
  return value == null ? null : Number(value);
};
const expected = {
  width: readNumber("width"),
  height: readNumber("height"),
  fps: readNumber("fps"),
  frames: readNumber("frames"),
};
const relativeFile =
  args.find((arg) => !arg.startsWith("--")) ??
  "local/out/video-project-final.mp4";
const filePath = path.resolve(root, relativeFile);
const ffprobe = requireBinary("ffprobe", "FFPROBE_PATH");
const ffmpeg = requireBinary("ffmpeg", "FFMPEG_PATH");

if (!fs.existsSync(filePath)) {
  console.error(`FAIL: file not found -> ${filePath}`);
  process.exit(1);
}

const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error) {
    throw result.error;
  }
  return result;
};

const probe = run(ffprobe, [
  "-v",
  "error",
  "-count_frames",
  "-show_entries",
  "format=duration,size",
  "-show_entries",
  "stream=index,codec_name,codec_type,width,height,r_frame_rate,sample_rate,channels,nb_read_frames",
  "-of",
  "json",
  filePath,
]);

if (probe.status !== 0) {
  console.error(probe.stderr);
  process.exit(1);
}

const probeData = JSON.parse(probe.stdout);
const video = probeData.streams.find((stream) => stream.codec_type === "video");
const audio = probeData.streams.find((stream) => stream.codec_type === "audio");
const duration = Number(probeData.format.duration);
const sizeMB = Number(probeData.format.size) / 1024 / 1024;
const fpsParts = String(video?.r_frame_rate ?? "0/1")
  .split("/")
  .map(Number);
const fps = fpsParts[0] / fpsParts[1];
const targetWidth = expected.width ?? 1920;
const targetHeight = expected.height ?? 1080;
const targetFps = expected.fps ?? 30;

const results = [];
const check = (name, pass, detail, severity = "FAIL") => {
  results.push({ name, pass, detail, severity: pass ? "PASS" : severity });
};

check("File exists", true, `${relativeFile} / ${sizeMB.toFixed(2)} MB`);
check("Duration", duration > 1, `${duration.toFixed(3)} s`);
check(
  "Video codec",
  video?.codec_name === "h264",
  video?.codec_name ?? "missing",
);
check(
  "Resolution",
  video?.width === targetWidth && video?.height === targetHeight,
  `${video?.width ?? 0}x${video?.height ?? 0} / expected ${targetWidth}x${targetHeight}`,
);
check(
  "Frame rate",
  Math.abs(fps - targetFps) < 0.001,
  `${fps.toFixed(3)} fps / expected ${targetFps}`,
);
check(
  "Audio codec",
  audio?.codec_name === "aac",
  audio?.codec_name ?? "missing",
);
check(
  "Audio sample rate",
  Number(audio?.sample_rate) === 48000,
  `${audio?.sample_rate ?? 0} Hz`,
);
check(
  "Audio channels",
  Number(audio?.channels) === 2,
  `${audio?.channels ?? 0} channels`,
);

if (video?.nb_read_frames) {
  const expectedFrames = expected.frames ?? Math.round(duration * targetFps);
  check(
    "Frame count",
    Math.abs(Number(video.nb_read_frames) - expectedFrames) <= 1,
    `${video.nb_read_frames} / expected ${expectedFrames}`,
  );
}

const loudness = run(ffmpeg, [
  "-hide_banner",
  "-i",
  filePath,
  "-vn",
  "-af",
  "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
  "-f",
  "null",
  process.platform === "win32" ? "NUL" : "/dev/null",
]);

let loudnessData = null;
const jsonStart = loudness.stderr.lastIndexOf("{");
const jsonEnd = loudness.stderr.lastIndexOf("}");
if (jsonStart >= 0 && jsonEnd > jsonStart) {
  try {
    loudnessData = JSON.parse(loudness.stderr.slice(jsonStart, jsonEnd + 1));
  } catch {
    loudnessData = null;
  }
}

if (loudnessData) {
  const integrated = Number(loudnessData.input_i);
  const truePeak = Number(loudnessData.input_tp);
  check(
    "Integrated loudness",
    integrated >= -17.5 && integrated <= -14.5,
    `${integrated.toFixed(2)} LUFS (target -16 ±1.5)`,
    "WARN",
  );
  check(
    "True peak",
    truePeak <= -1,
    `${truePeak.toFixed(2)} dBTP (target <= -1.0)`,
  );
} else {
  check("Loudness analysis", false, "could not parse loudnorm output", "WARN");
}

console.log(`\nVIDEO QC / ${relativeFile}\n`);
for (const item of results) {
  const marker = item.pass ? "PASS" : item.severity;
  console.log(`${marker.padEnd(4)}  ${item.name.padEnd(20)} ${item.detail}`);
}

const failed = results.some((item) => item.severity === "FAIL" && !item.pass);
const warned = results.some((item) => item.severity === "WARN" && !item.pass);
console.log(
  `\nRESULT: ${failed ? "FAIL" : warned ? "PASS WITH WARNINGS" : "PASS"}\n`,
);

process.exit(failed ? 1 : 0);
