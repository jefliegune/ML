import {createPaletteV2} from "./color-system";

export const COLORS = {
  cream: "#F4F0E5",
  paper: "#FFFDF4",
  ink: "#151515",
  muted: "#68645B",
  lime: "#D8FF43",
  blue: "#3355FF",
  coral: "#FF5B48",
  cyan: "#4ED8D2",
  white: "#FFFFFF",
};

export const FONT =
  '"HarmonyOS Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif';
export const MONO = '"Arial Narrow", "Arial", sans-serif';

export const EDITORIAL_SEED = {
  bg: COLORS.cream,
  surface: COLORS.paper,
  ink: COLORS.ink,
  sub: COLORS.muted,
  accent: COLORS.blue,
  accent2: COLORS.coral,
} as const;

export const EDITORIAL_PALETTE = createPaletteV2(EDITORIAL_SEED);
export const EDITORIAL_TOKENS = EDITORIAL_PALETTE.tokens;

export const SCENE_CUTS = [0, 72, 153, 234, 300];
export const TOTAL_FRAMES = 300;
export const FPS = 30;
