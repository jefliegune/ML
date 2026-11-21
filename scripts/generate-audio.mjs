import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const audioDir = path.join(root, "public", "audio");
const sfxDir = path.join(root, "public", "sfx");

fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(sfxDir, { recursive: true });

const SAMPLE_RATE = 44_100;
const TAU = Math.PI * 2;

const midiToHz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const clamp = (value, min = -1, max = 1) =>
  Math.max(min, Math.min(max, value));

const makeRng = (seed = 1) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const writeWav = (filePath, left, right, sampleRate = SAMPLE_RATE) => {
  const frames = left.length;
  const buffer = Buffer.alloc(44 + frames * 4);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + frames * 4, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(2, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 4, 28);
  buffer.writeUInt16LE(4, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(frames * 4, 40);

  for (let i = 0; i < frames; i++) {
    const l = Math.round(clamp(left[i]) * 32767);
    const r = Math.round(clamp(right[i]) * 32767);
    buffer.writeInt16LE(l, 44 + i * 4);
    buffer.writeInt16LE(r, 44 + i * 4 + 2);
  }

  fs.writeFileSync(filePath, buffer);
};

const createStereo = (seconds) => {
  const frames = Math.ceil(seconds * SAMPLE_RATE);
  return {
    frames,
    left: new Float32Array(frames),
    right: new Float32Array(frames),
  };
};

const addSample = (buffer, index, value, pan = 0) => {
  if (index < 0 || index >= buffer.frames) {
    return;
  }
  const panAngle = ((pan + 1) * Math.PI) / 4;
  buffer.left[index] += value * Math.cos(panAngle);
  buffer.right[index] += value * Math.sin(panAngle);
};

const addKick = (buffer, start, level = 0.72) => {
  const startIndex = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor(0.34 * SAMPLE_RATE);
  let phase = 0;

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const frequency = 42 + 105 * Math.exp(-32 * t);
    phase += (TAU * frequency) / SAMPLE_RATE;
    const body =
      Math.sin(phase) *
      Math.exp(-10.5 * t) *
      (1 - Math.exp(-500 * t));
    const click = i < 180 ? (1 - i / 180) ** 6 * 0.15 : 0;
    addSample(buffer, startIndex + i, (body + click) * level, 0);
  }
};

const addClap = (buffer, start, level = 0.26, rng = Math.random) => {
  const startIndex = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor(0.2 * SAMPLE_RATE);
  let veryLow = 0;
  let low = 0;

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const noise = rng() * 2 - 1;
    veryLow += (noise - veryLow) * 0.08;
    low += (noise - low) * 0.28;
    const bright = noise - low;
    const body = low - veryLow;
    const burst =
      Math.exp(-42 * t) +
      0.7 * Math.exp(-48 * Math.max(0, t - 0.018)) +
      0.45 * Math.exp(-52 * Math.max(0, t - 0.038));
    addSample(
      buffer,
      startIndex + i,
      (bright * 0.55 + body * 0.5) * burst * level,
      0.02,
    );
  }
};

const addHat = (buffer, start, level = 0.08, open = false, pan = 0) => {
  const startIndex = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor((open ? 0.18 : 0.072) * SAMPLE_RATE);
  let low = 0;

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const noise = Math.random() * 2 - 1;
    low += (noise - low) * 0.22;
    const high = noise - low;
    const decay = open ? Math.exp(-18 * t) : Math.exp(-65 * t);
    addSample(buffer, startIndex + i, high * decay * level, pan);
  }
};

const addPluck = (buffer, start, midi, level = 0.15, pan = 0) => {
  const startIndex = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor(0.42 * SAMPLE_RATE);
  const frequency = midiToHz(midi);

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const attack = 1 - Math.exp(-500 * t);
    const envelope = attack * Math.exp(-8.5 * t);
    const tone =
      Math.sin(TAU * frequency * t) * 0.62 +
      Math.sin(TAU * frequency * 2.002 * t) * 0.2 +
      Math.sin(TAU * frequency * 3.998 * t) * 0.1 +
      Math.sin(TAU * frequency * 6.01 * t) * 0.035;
    addSample(buffer, startIndex + i, tone * envelope * level, pan);
  }
};

const addBass = (buffer, start, midi, level = 0.2) => {
  const startIndex = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor(0.28 * SAMPLE_RATE);
  const frequency = midiToHz(midi);

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const envelope = (1 - Math.exp(-300 * t)) * Math.exp(-7.8 * t);
    const fundamental = Math.sin(TAU * frequency * t);
    const second = Math.sin(TAU * frequency * 2 * t) * 0.22;
    const third = Math.sin(TAU * frequency * 3 * t) * 0.09;
    addSample(
      buffer,
      startIndex + i,
      (fundamental + second + third) * envelope * level,
      0,
    );
  }
};

const addPad = (buffer, start, midi, duration, level = 0.035, pan = 0) => {
  const startIndex = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor(duration * SAMPLE_RATE);
  const frequency = midiToHz(midi);

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, t / 0.12);
    const release = Math.min(1, (duration - t) / 0.32);
    const envelope = Math.max(0, Math.min(attack, release));
    const drift = 1 + Math.sin(TAU * 0.31 * t + midi) * 0.0018;
    const tone =
      Math.sin(TAU * frequency * drift * t) * 0.48 +
      Math.sin(TAU * frequency * 2.003 * t + 0.5) * 0.2 +
      Math.sin(TAU * frequency * 3.001 * t + 1.2) * 0.08;
    addSample(buffer, startIndex + i, tone * envelope * level, pan);
  }
};

const addBell = (buffer, start, midi, level = 0.09, pan = 0) => {
  const startIndex = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor(1.1 * SAMPLE_RATE);
  const frequency = midiToHz(midi);

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const envelope = Math.exp(-4.2 * t) * (1 - Math.exp(-800 * t));
    const tone =
      Math.sin(TAU * frequency * t) * 0.48 +
      Math.sin(TAU * frequency * 2.01 * t + 0.2) * 0.22 +
      Math.sin(TAU * frequency * 3.98 * t + 0.7) * 0.1;
    addSample(buffer, startIndex + i, tone * envelope * level, pan);
  }
};

const addTick = (buffer, start, level = 0.12, pan = 0) => {
  const startIndex = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor(0.08 * SAMPLE_RATE);

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const envelope = Math.exp(-90 * t);
    const tone =
      Math.sin(TAU * 1750 * t) * 0.55 +
      Math.sin(TAU * 3100 * t) * 0.22;
    addSample(buffer, startIndex + i, tone * envelope * level, pan);
  }
};

const addRoom = (left, right, amount = 0.16) => {
  const taps = [
    { delay: 0.031, gain: 0.52, cross: 0.08 },
    { delay: 0.047, gain: 0.38, cross: -0.12 },
    { delay: 0.071, gain: 0.28, cross: 0.18 },
    { delay: 0.113, gain: 0.18, cross: -0.16 },
  ];
  const sourceLeft = left.slice();
  const sourceRight = right.slice();

  for (const tap of taps) {
    const delayFrames = Math.floor(tap.delay * SAMPLE_RATE);
    for (let i = delayFrames; i < left.length; i++) {
      left[i] +=
        sourceLeft[i - delayFrames] * tap.gain * amount +
        sourceRight[i - delayFrames] * tap.cross * amount;
      right[i] +=
        sourceRight[i - delayFrames] * tap.gain * amount -
        sourceLeft[i - delayFrames] * tap.cross * amount;
    }
  }
};

const normalize = (left, right, peak = 0.9) => {
  let max = 0;
  for (let i = 0; i < left.length; i++) {
    max = Math.max(max, Math.abs(left[i]), Math.abs(right[i]));
  }
  const gain = max > 0 ? peak / max : 1;
  for (let i = 0; i < left.length; i++) {
    left[i] = Math.tanh(left[i] * gain * 1.08) * 0.94;
    right[i] = Math.tanh(right[i] * gain * 1.08) * 0.94;
  }
};

const applyFade = (left, right, fadeIn = 0.03, fadeOut = 0.12) => {
  const inFrames = Math.floor(fadeIn * SAMPLE_RATE);
  const outFrames = Math.floor(fadeOut * SAMPLE_RATE);
  for (let i = 0; i < inFrames; i++) {
    const gain = i / inFrames;
    left[i] *= gain;
    right[i] *= gain;
  }
  for (let i = 0; i < outFrames; i++) {
    const index = left.length - 1 - i;
    const gain = i / outFrames;
    left[index] *= gain;
    right[index] *= gain;
  }
};

const makeMusic = () => {
  const buffer = createStereo(10);
  const beat = 0.5;
  const bar = beat * 4;
  const bars = [
    { root: 48, chord: [60, 64, 67, 71] },
    { root: 45, chord: [57, 60, 64, 67] },
    { root: 41, chord: [53, 57, 60, 64] },
    { root: 43, chord: [55, 59, 62, 65] },
    { root: 48, chord: [60, 64, 67, 71] },
  ];
  const arpPattern = [0, 1, 2, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 0, 1, 2];
  const kickPattern = [1, 0.56, 0.86, 0.62];

  for (let barIndex = 0; barIndex < bars.length; barIndex++) {
    const { root, chord } = bars[barIndex];
    const barStart = barIndex * bar;

    for (let step = 0; step < 16; step++) {
      const time = barStart + step * 0.125;
      const chordNote = chord[arpPattern[step] % chord.length];
      const octave = step % 8 >= 4 ? 12 : 0;
      const pan = ((step % 4) - 1.5) * 0.18;
      addPluck(
        buffer,
        time,
        chordNote + octave,
        step % 4 === 0 ? 0.135 : 0.085,
        pan,
      );
      if (step % 2 === 0) {
        const bassNote = root + (step === 6 || step === 12 ? 12 : 0);
        addBass(buffer, time, bassNote - 12, step === 0 ? 0.22 : 0.17);
      }
    }

    for (let step = 0; step < 8; step++) {
      const time = barStart + step * 0.25;
      addHat(
        buffer,
        time,
        step % 2 === 0 ? 0.075 : 0.045,
        step === 7,
        step % 2 === 0 ? -0.12 : 0.12,
      );
    }

    for (let beatIndex = 0; beatIndex < 4; beatIndex++) {
      const time = barStart + beatIndex * beat;
      addKick(buffer, time, kickPattern[beatIndex]);
      if (beatIndex === 1 || beatIndex === 3) {
        addClap(buffer, time, 0.22);
      }
    }

    addPad(buffer, barStart, chord[0] - 12, bar - 0.08, 0.032, -0.35);
    addPad(buffer, barStart, chord[1], bar - 0.08, 0.028, 0.18);
    addPad(buffer, barStart, chord[2], bar - 0.08, 0.025, -0.1);
    addPad(buffer, barStart, chord[3], bar - 0.08, 0.021, 0.38);

    addBell(buffer, barStart + 0.04, chord[2] + 12, 0.05, -0.15);
    addTick(buffer, barStart + 1.75, 0.075, 0.25);
    addTick(buffer, barStart + 1.875, 0.055, -0.25);
  }

  addBell(buffer, 2.0, 84, 0.055, 0.15);
  addBell(buffer, 4.0, 81, 0.05, -0.18);
  addBell(buffer, 6.0, 79, 0.05, 0.18);
  addBell(buffer, 8.0, 88, 0.075, -0.08);

  addRoom(buffer.left, buffer.right, 0.14);
  normalize(buffer.left, buffer.right, 0.88);
  applyFade(buffer.left, buffer.right, 0.025, 0.08);
  writeWav(path.join(audioDir, "bgm-preview.wav"), buffer.left, buffer.right);
};

const makeSfx = () => {
  const rng = makeRng(42);

  {
    const buffer = createStereo(0.18);
    let phase = 0;
    for (let i = 0; i < buffer.frames; i++) {
      const t = i / SAMPLE_RATE;
      const frequency = 520 + 680 * Math.exp(-26 * t);
      phase += (TAU * frequency) / SAMPLE_RATE;
      const envelope = Math.exp(-24 * t) * (1 - Math.exp(-800 * t));
      addSample(buffer, i, Math.sin(phase) * envelope * 0.8, 0.15);
    }
    normalize(buffer.left, buffer.right, 0.72);
    writeWav(path.join(sfxDir, "pop.wav"), buffer.left, buffer.right);
  }

  {
    const buffer = createStereo(0.12);
    for (let i = 0; i < buffer.frames; i++) {
      const t = i / SAMPLE_RATE;
      const envelope = Math.exp(-62 * t);
      const value =
        (rng() * 2 - 1) * 0.38 * envelope +
        Math.sin(TAU * 2200 * t) * 0.26 * envelope;
      addSample(buffer, i, value, -0.1);
    }
    normalize(buffer.left, buffer.right, 0.55);
    writeWav(path.join(sfxDir, "click.wav"), buffer.left, buffer.right);
  }

  {
    const buffer = createStereo(0.52);
    let low = 0;
    let phase = 0;
    for (let i = 0; i < buffer.frames; i++) {
      const t = i / SAMPLE_RATE;
      const progress = t / 0.52;
      const noise = rng() * 2 - 1;
      low += (noise - low) * (0.015 + 0.11 * progress);
      const high = noise - low;
      phase += (TAU * (240 + 2800 * progress ** 1.8)) / SAMPLE_RATE;
      const envelope = Math.sin(Math.PI * progress) ** 2;
      const value =
        high * 0.34 * envelope + Math.sin(phase) * 0.08 * envelope;
      addSample(buffer, i, value, -0.35 + progress * 0.7);
    }
    addRoom(buffer.left, buffer.right, 0.1);
    normalize(buffer.left, buffer.right, 0.52);
    applyFade(buffer.left, buffer.right, 0.01, 0.08);
    writeWav(path.join(sfxDir, "whoosh.wav"), buffer.left, buffer.right);
  }

  {
    const buffer = createStereo(0.55);
    let phase = 0;
    for (let i = 0; i < buffer.frames; i++) {
      const t = i / SAMPLE_RATE;
      const frequency = 40 + 80 * Math.exp(-18 * t);
      phase += (TAU * frequency) / SAMPLE_RATE;
      const envelope = Math.exp(-7 * t) * (1 - Math.exp(-250 * t));
      const body = Math.sin(phase) * envelope * 0.85;
      const click = i < 260 ? (1 - i / 260) ** 5 * 0.18 : 0;
      addSample(buffer, i, body + click, 0);
    }
    normalize(buffer.left, buffer.right, 0.74);
    applyFade(buffer.left, buffer.right, 0.005, 0.14);
    writeWav(path.join(sfxDir, "impact.wav"), buffer.left, buffer.right);
  }

  {
    const buffer = createStereo(1.1);
    const frequencies = [1046.5, 1568, 2093, 3136];
    for (let i = 0; i < buffer.frames; i++) {
      const t = i / SAMPLE_RATE;
      const envelope = Math.exp(-4.5 * t) * (1 - Math.exp(-900 * t));
      let value = 0;
      for (let p = 0; p < frequencies.length; p++) {
        value +=
          Math.sin(TAU * frequencies[p] * t + p * 0.35) *
          (0.25 / (p + 1));
      }
      addSample(buffer, i, value * envelope, 0.08);
    }
    addRoom(buffer.left, buffer.right, 0.18);
    normalize(buffer.left, buffer.right, 0.58);
    applyFade(buffer.left, buffer.right, 0.005, 0.2);
    writeWav(path.join(sfxDir, "ding.wav"), buffer.left, buffer.right);
  }

  {
    const buffer = createStereo(0.72);
    let low = 0;
    let phase = 0;
    for (let i = 0; i < buffer.frames; i++) {
      const t = i / SAMPLE_RATE;
      const progress = t / 0.72;
      const noise = rng() * 2 - 1;
      low += (noise - low) * (0.04 + 0.16 * progress);
      const high = noise - low;
      phase += (TAU * (180 + 1900 * progress ** 2.2)) / SAMPLE_RATE;
      const envelope = progress ** 1.5 * (1 - progress) ** 0.18;
      const value =
        (high * 0.24 + Math.sin(phase) * 0.14) * envelope;
      addSample(buffer, i, value, -0.2 + progress * 0.4);
    }
    normalize(buffer.left, buffer.right, 0.48);
    applyFade(buffer.left, buffer.right, 0.01, 0.06);
    writeWav(path.join(sfxDir, "riser.wav"), buffer.left, buffer.right);
  }
};

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  makeMusic();
  makeSfx();
  console.log("Generated original BGM and SFX in public/audio and public/sfx.");
}
export {
  SAMPLE_RATE,
  TAU,
  audioDir,
  createStereo,
  addSample,
  addKick,
  addClap,
  addHat,
  addPluck,
  addBass,
  addPad,
  addBell,
  addTick,
  addRoom,
  normalize,
  applyFade,
  writeWav,
};

