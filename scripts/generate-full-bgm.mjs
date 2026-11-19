import path from "node:path";
import {
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
} from "./generate-audio.mjs";

const addCrash = (buffer, start, level = 0.07) => {
  const startIndex = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor(1.15 * SAMPLE_RATE);
  let low = 0;

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const noise = Math.random() * 2 - 1;
    low += (noise - low) * 0.16;
    const high = noise - low;
    const envelope = Math.exp(-3.1 * t) * (1 - Math.exp(-260 * t));
    addSample(
      buffer,
      startIndex + i,
      high * envelope * level,
      Math.sin(t * 17) * 0.28,
    );
  }
};

const addMusicRiser = (buffer, start, duration, level = 0.06) => {
  const startIndex = Math.floor(start * SAMPLE_RATE);
  const length = Math.floor(duration * SAMPLE_RATE);
  let low = 0;
  let phase = 0;

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    const noise = Math.random() * 2 - 1;
    low += (noise - low) * (0.02 + 0.14 * progress);
    const high = noise - low;
    phase += (TAU * (160 + 1700 * progress ** 2)) / SAMPLE_RATE;
    const envelope = progress ** 1.35 * (1 - progress) ** 0.14;
    addSample(
      buffer,
      startIndex + i,
      (high * 0.25 + Math.sin(phase) * 0.1) * envelope * level,
      Math.sin(progress * Math.PI) * 0.16,
    );
  }
};

const sectionAt = (time) => {
  if (time < 10) return "intro";
  if (time < 28) return "rules";
  if (time < 44) return "pixels";
  if (time < 58) return "features";
  if (time < 76) return "model";
  if (time < 96) return "training";
  if (time < 110) return "generalize";
  return "outro";
};

const makeFullMusic = () => {
  const buffer = createStereo(120);
  const beat = 0.5;
  const bar = beat * 4;
  const chords = [
    {root: 48, chord: [60, 64, 67, 71]},
    {root: 45, chord: [57, 60, 64, 67]},
    {root: 41, chord: [53, 57, 60, 64]},
    {root: 43, chord: [55, 59, 62, 65]},
  ];
  const arpPattern = [0, 1, 2, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 0, 1, 2];
  const leadPattern = [
    72, 76, 79, 76, 71, 74, 79, 74, 69, 72, 76, 72, 67, 71, 74, 71,
  ];
  const energyBySection = {
    intro: 0.9,
    rules: 1,
    pixels: 1.04,
    features: 1.06,
    model: 1.1,
    training: 1.14,
    generalize: 0.76,
    outro: 1.08,
  };

  for (let barIndex = 0; barIndex < 60; barIndex++) {
    const barStart = barIndex * bar;
    const section = sectionAt(barStart);
    const energy = energyBySection[section];
    const {root, chord} = chords[barIndex % 4];
    const isIntro = section === "intro";
    const isGeneralize = section === "generalize";
    const isOutro = section === "outro";
    const isTraining = section === "training";

    for (let step = 0; step < 16; step++) {
      const time = barStart + step * 0.125;
      const chordNote = chord[arpPattern[step] % chord.length];
      const octave =
        (step % 8 >= 4 ? 12 : 0) +
        (section === "pixels" || section === "model" ? 12 : 0);
      const pan = ((step % 4) - 1.5) * 0.18;
      let level = step % 4 === 0 ? 0.13 : 0.078;
      if (isGeneralize) level *= 0.62;
      if (isOutro) level *= 1.08;
      if (isTraining) level *= 1.12;
      addPluck(buffer, time, chordNote + octave, level * energy, pan);

      if (step % 2 === 0) {
        const bassNote = root + (step === 6 || step === 12 ? 12 : 0);
        const bassLevel = isGeneralize ? 0.12 : isTraining ? 0.21 : 0.17;
        if (!isGeneralize || step === 0 || step === 8) {
          addBass(buffer, time, bassNote - 12, bassLevel * energy);
        }
      }
    }

    for (let step = 0; step < 8; step++) {
      const time = barStart + step * 0.25;
      const dense =
        section === "pixels" || section === "model" || isTraining;
      addHat(
        buffer,
        time,
        (step % 2 === 0 ? 0.073 : 0.042) * (dense ? 1.08 : 0.92),
        step === 7 || (isTraining && step === 5),
        step % 2 === 0 ? -0.12 : 0.12,
      );
      if (dense) {
        addHat(
          buffer,
          time + 0.125,
          0.023,
          false,
          step % 2 === 0 ? 0.2 : -0.2,
        );
      }
    }

    for (let beatIndex = 0; beatIndex < 4; beatIndex++) {
      const time = barStart + beatIndex * beat;
      if (!isGeneralize || beatIndex === 0 || beatIndex === 2) {
        const kickLevel = isTraining ? 0.9 : isOutro ? 0.72 : 0.7;
        addKick(buffer, time, kickLevel * energy);
      }
      if (!isGeneralize && (beatIndex === 1 || beatIndex === 3)) {
        addClap(
          buffer,
          time,
          (isTraining ? 0.27 : 0.22) * Math.min(1, energy),
        );
      }
    }

    if (!isGeneralize) {
      addPad(buffer, barStart, chord[0] - 12, bar - 0.06, 0.03 * energy, -0.34);
      addPad(buffer, barStart, chord[1], bar - 0.06, 0.025 * energy, 0.18);
      addPad(buffer, barStart, chord[2], bar - 0.06, 0.022 * energy, -0.1);
      addPad(buffer, barStart, chord[3], bar - 0.06, 0.018 * energy, 0.36);
    } else {
      addPad(buffer, barStart, chord[0] - 12, bar - 0.02, 0.036, -0.3);
      addPad(buffer, barStart, chord[1], bar - 0.02, 0.03, 0.16);
      addPad(buffer, barStart, chord[2], bar - 0.02, 0.026, -0.06);
    }

    if (!isIntro && !isGeneralize) {
      for (let beatIndex = 0; beatIndex < 4; beatIndex++) {
        const leadNote =
          leadPattern[(barIndex * 4 + beatIndex) % leadPattern.length];
        const leadLevel = isTraining ? 0.055 : isOutro ? 0.072 : 0.045;
        addPluck(buffer, barStart + beatIndex * beat, leadNote, leadLevel, 0.38);
      }
    }

    if (isGeneralize) {
      const bellNotes = [72, 76, 79, 76];
      addBell(
        buffer,
        barStart + 0.04,
        bellNotes[barIndex % bellNotes.length] + 12,
        0.06,
        0.24,
      );
    }

    addTick(buffer, barStart + 1.75, 0.068, 0.25);
    addTick(buffer, barStart + 1.875, 0.047, -0.25);
  }

  for (const boundary of [10, 28, 44, 58, 76, 96, 110]) {
    addCrash(buffer, boundary, 0.055);
    addKick(buffer, boundary, 0.72);
  }

  addMusicRiser(buffer, 54.2, 3.6, 0.055);
  addMusicRiser(buffer, 92.4, 3.4, 0.065);
  addMusicRiser(buffer, 106.4, 3.2, 0.05);

  addBell(buffer, 110.05, 88, 0.08, -0.08);
  addBell(buffer, 112.0, 84, 0.065, 0.2);
  addBell(buffer, 114.0, 79, 0.06, -0.14);
  addBell(buffer, 116.0, 84, 0.055, 0.16);

  addRoom(buffer.left, buffer.right, 0.13);
  normalize(buffer.left, buffer.right, 0.86);
  applyFade(buffer.left, buffer.right, 0.04, 1.8);
  writeWav(path.join(audioDir, "bgm-full.wav"), buffer.left, buffer.right);
};

makeFullMusic();
console.log("Generated 120-second BGM at public/audio/bgm-full.wav.");
