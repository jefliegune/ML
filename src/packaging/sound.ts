export const SFX_LIBRARY = {
  click: "sfx/click.wav",
  pop: "sfx/pop.wav",
  whoosh: "sfx/whoosh.wav",
  riser: "sfx/riser.wav",
  impact: "sfx/impact.wav",
  ding: "sfx/ding.wav",
} as const;

export type SfxName = keyof typeof SFX_LIBRARY;

export type SoundCue = {
  frame: number;
  file: (typeof SFX_LIBRARY)[SfxName];
  volume: number;
};

export const cue = (
  frame: number,
  name: SfxName,
  volume: number,
): SoundCue => ({
  frame,
  file: SFX_LIBRARY[name],
  volume,
});

export const SOUND_RULES = {
  cut: "whoosh",
  reveal: "pop",
  confirm: "ding",
  error: "impact",
  build: "riser",
  micro: "click",
} as const;
