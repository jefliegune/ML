import fs from "node:fs";
import path from "node:path";
import {
  isInside,
  loadVideoProject,
  parseArgs,
  readJson,
  relativeToRoot,
} from "./lib/video-project.mjs";

const args = parseArgs();
const selector = args.values.get("project") ?? args.positionals[0];

if (!selector) {
  console.error("Usage: node scripts/check-timeline.mjs --project <id|path>");
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
  console.error(
    "Project does not declare a timeline: " +
      relativeToRoot(project.manifestPath),
  );
  process.exit(1);
}

let timeline;
try {
  timeline = readJson(project.timelinePath);
} catch (error) {
  console.error("Could not read timeline: " + error.message);
  process.exit(1);
}

const results = [];
const check = (pass, name, detail) => {
  results.push({ pass, name, detail });
};

const isInteger = (value) => Number.isInteger(value);
const isFrame = (value) => isInteger(value) && value >= 0;

check(
  timeline.project === project.manifest.id,
  "project id",
  timeline.project ?? "missing",
);
check(
  Number.isInteger(timeline.fps) && timeline.fps > 0,
  "fps",
  String(timeline.fps),
);
check(
  Number.isInteger(timeline.durationInFrames) && timeline.durationInFrames > 0,
  "duration",
  String(timeline.durationInFrames),
);

if (project.video) {
  check(
    timeline.fps === project.video.fps,
    "fps matches manifest",
    `${timeline.fps} / ${project.video.fps}`,
  );
  check(
    timeline.durationInFrames === project.video.durationInFrames,
    "duration matches manifest",
    `${timeline.durationInFrames} / ${project.video.durationInFrames}`,
  );
}

const sections = Array.isArray(timeline.sections) ? timeline.sections : [];
const lines = Array.isArray(timeline.lines) ? timeline.lines : [];
check(sections.length > 0, "sections present", `${sections.length}`);
check(lines.length > 0, "lines present", `${lines.length}`);

const sectionById = new Map();
let previousEnd = 0;
for (let index = 0; index < sections.length; index += 1) {
  const section = sections[index];
  const label = section?.id ?? `section#${index}`;
  check(
    typeof section?.id === "string" && section.id.length > 0,
    `${label} id`,
    "valid",
  );
  if (typeof section?.id === "string") {
    check(
      !sectionById.has(section.id),
      `${label} unique`,
      sectionById.has(section.id) ? "duplicate" : "unique",
    );
    sectionById.set(section.id, section);
  }
  check(
    isFrame(section?.startFrame),
    `${label} start`,
    String(section?.startFrame),
  );
  check(isFrame(section?.endFrame), `${label} end`, String(section?.endFrame));
  check(
    section?.endFrame > section?.startFrame,
    `${label} positive duration`,
    `${section?.endFrame - section?.startFrame}`,
  );
  check(
    section?.startFrame === previousEnd,
    `${label} contiguous`,
    `${section?.startFrame} / expected ${previousEnd}`,
  );
  check(
    Number.isFinite(section?.audioSeconds) && section.audioSeconds > 0,
    `${label} audio`,
    String(section?.audioSeconds),
  );
  check(
    isFrame(section?.gapFrames),
    `${label} gap`,
    String(section?.gapFrames),
  );
  previousEnd = section?.endFrame;
}

if (sections.length > 0) {
  check(
    sections[0]?.startFrame === 0,
    "timeline starts at zero",
    String(sections[0]?.startFrame),
  );
  check(
    previousEnd === timeline.durationInFrames,
    "sections fill duration",
    `${previousEnd} / ${timeline.durationInFrames}`,
  );
}

const lineIds = new Set();
const linesBySection = new Map();
for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index];
  const label = line?.id ?? `line#${index}`;
  const section = sectionById.get(line?.section);
  check(
    typeof line?.id === "string" && line.id.length > 0,
    `${label} id`,
    "valid",
  );
  if (typeof line?.id === "string") {
    check(
      !lineIds.has(line.id),
      `${label} unique`,
      lineIds.has(line.id) ? "duplicate" : "unique",
    );
    lineIds.add(line.id);
  }
  check(Boolean(section), `${label} section`, String(line?.section));
  check(
    typeof line?.text === "string" && line.text.trim().length > 0,
    `${label} text`,
    "present",
  );
  check(Array.isArray(line?.highlights), `${label} highlights`, "array");
  check(isFrame(line?.startFrame), `${label} start`, String(line?.startFrame));
  check(isFrame(line?.endFrame), `${label} end`, String(line?.endFrame));
  check(
    line?.endFrame > line?.startFrame,
    `${label} positive duration`,
    `${line?.endFrame - line?.startFrame}`,
  );
  check(
    isFrame(line?.captionStartFrame),
    `${label} caption start`,
    String(line?.captionStartFrame),
  );
  check(
    isFrame(line?.captionEndFrame),
    `${label} caption end`,
    String(line?.captionEndFrame),
  );
  check(
    line?.captionEndFrame > line?.captionStartFrame,
    `${label} caption duration`,
    `${line?.captionEndFrame - line?.captionStartFrame}`,
  );

  if (section) {
    check(
      line.startFrame >= section.startFrame &&
        line.endFrame <= section.endFrame,
      `${label} inside section`,
      `${line.startFrame}-${line.endFrame} / ${section.startFrame}-${section.endFrame}`,
    );
    check(
      line.captionStartFrame >= section.startFrame &&
        line.captionEndFrame <= section.endFrame,
      `${label} caption inside section`,
      `${line.captionStartFrame}-${line.captionEndFrame} / ${section.startFrame}-${section.endFrame}`,
    );
    if (!linesBySection.has(line.section)) linesBySection.set(line.section, []);
    linesBySection.get(line.section).push(line);
  }

  check(
    typeof line?.file === "string" && line.file.length > 0,
    `${label} audio path`,
    String(line?.file),
  );
  if (typeof line?.file === "string" && line.file.length > 0) {
    const audioPath = path.resolve(project.publicRoot, line.file);
    check(
      isInside(project.publicRoot, audioPath),
      `${label} audio inside public`,
      line.file,
    );
    check(
      fs.existsSync(audioPath),
      `${label} audio exists`,
      relativeToRoot(audioPath),
    );
  }
}

for (const section of sections) {
  const sectionLines = (linesBySection.get(section.id) ?? [])
    .slice()
    .sort((a, b) => a.startFrame - b.startFrame);
  check(
    sectionLines.length > 0,
    `${section.id} has lines`,
    `${sectionLines.length}`,
  );
  for (let index = 1; index < sectionLines.length; index += 1) {
    const previous = sectionLines[index - 1];
    const current = sectionLines[index];
    check(
      current.startFrame >= previous.endFrame,
      `${section.id} audio does not overlap`,
      `${previous.id} -> ${current.id}`,
    );
    check(
      current.captionStartFrame >= previous.captionEndFrame,
      `${section.id} captions do not overlap`,
      `${previous.id} ends ${previous.captionEndFrame}, ${current.id} starts ${current.captionStartFrame}`,
    );
  }
}

const failures = results.filter((item) => !item.pass);
const width = Math.max(...results.map((item) => item.name.length), 16);
console.log(`TIMELINE CHECK / ${relativeToRoot(project.timelinePath)}\n`);
if (failures.length === 0) {
  console.log(
    `PASS  ${project.manifest.id.padEnd(width)}  ${timeline.durationInFrames} frames @ ${timeline.fps} fps`,
  );
  console.log(
    `PASS  ${"sections".padEnd(width)}  ${sections.length} contiguous sections`,
  );
  console.log(
    `PASS  ${"lines".padEnd(width)}  ${lines.length} audio files and caption windows`,
  );
  console.log(`PASS  ${"assertions".padEnd(width)}  ${results.length} checks`);
} else {
  for (const item of failures) {
    console.log(`FAIL  ${item.name.padEnd(width)}  ${item.detail}`);
  }
}
console.log(
  `\nRESULT: ${failures.length === 0 ? "PASS" : "FAIL"} (${sections.length} sections, ${lines.length} lines)\n`,
);
process.exit(failures.length === 0 ? 0 : 1);
