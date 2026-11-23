import {createPaletteV2} from "../../color-system";

export const BRIGHT_DRAFTING_SEED = {
  bg: "#E9EEF0",
  surface: "#FFFFFF",
  ink: "#10181D",
  sub: "#53666F",
  accent: "#D9482B",
  accent2: "#2F6F7E",
} as const;

export const BRIGHT_DRAFTING = {
  ...BRIGHT_DRAFTING_SEED,
  paper: "#FFFFFF",
  muted: "#6A7B84",
  red: "#D9482B",
  redDeep: "#A8331D",
  redSoft: "#F7DED8",
  teal: "#2F6F7E",
  tealDeep: "#1E4B56",
  tealSoft: "#D9E9EC",
  gold: "#F0B429",
  goldSoft: "#FBEBC4",
  line: "rgba(16,24,29,0.16)",
  hair: "rgba(16,24,29,0.08)",
  font: '"Microsoft YaHei", "Noto Sans SC", "PingFang SC", sans-serif',
} as const;

export const BRIGHT_DRAFTING_PALETTE = createPaletteV2(BRIGHT_DRAFTING_SEED);
