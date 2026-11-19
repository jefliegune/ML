import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {requireBinary} from "./lib/binaries.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputArg = process.argv[2];
const outputArg = process.argv[3];
const targetArg = process.argv[4] ?? "-16";

if (!inputArg || !outputArg) {
  console.error("Usage: node scripts/master-video.mjs <input> <output> [integratedLUFS]");
  process.exit(1);
}

const input = path.resolve(root, inputArg);
const output = path.resolve(root, outputArg);
const target = Number(targetArg);
const ffmpeg = requireBinary("ffmpeg", "FFMPEG_PATH");
const ffprobe = requireBinary("ffprobe", "FFPROBE_PATH");

if (!fs.existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}

if (!Number.isFinite(target) || target < -24 || target > -10) {
  console.error(`Invalid loudness target: ${targetArg}`);
  process.exit(1);
}

const probe = spawnSync(
  ffprobe,
  [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    input,
  ],
  {encoding: "utf8"},
);
const videoDuration = Number.parseFloat(probe.stdout.trim());
if (!Number.isFinite(videoDuration) || videoDuration <= 0) {
  console.error("Could not read input video duration");
  process.exit(1);
}

fs.mkdirSync(path.dirname(output), {recursive: true});

const result = spawnSync(
  ffmpeg,
  [
    "-y",
    "-hide_banner",
    "-i",
    input,
    "-map",
    "0:v:0",
    "-map",
    "0:a:0",
    "-c:v",
    "copy",
    "-af",
    `loudnorm=I=${target}:TP=-1.5:LRA=9:print_format=summary`,
    "-ar",
    "48000",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    "-t",
    videoDuration.toFixed(6),
    output,
  ],
  {encoding: "utf8"},
);

if (result.status !== 0) {
  console.error(result.stderr);
  process.exit(result.status ?? 1);
}

const summary = result.stderr
  .split(/\r?\n/)
  .filter((line) => /Input|Output|Normalization|Target/.test(line))
  .join("\n");

console.log(summary);
console.log(`\nMastered: ${output}`);
