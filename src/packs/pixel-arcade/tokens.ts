import {createPaletteV2} from "../../color-system";

export const PIXEL_ARCADE = {
  id: "pixel-arcade",
  name: "像素街机",
  bg: "#0D1020",
  bg2: "#151B30",
  panel: "#1D243D",
  panel2: "#27304D",
  cream: "#F6F1E3",
  ink: "#080A14",
  muted: "#8F98B3",
  yellow: "#FFC857",
  mint: "#3DDC97",
  coral: "#FF6B6B",
  blue: "#5B8CFF",
  white: "#FFFFFF",
} as const;

export const PIXEL_ARCADE_PALETTE = {
  id: "pixel-arcade",
  name: "像素街机",
  bestFor: "像素教程、游戏化界面、技术演示",
  colors: {
    bg: PIXEL_ARCADE.bg,
    surface: PIXEL_ARCADE.panel,
    ink: PIXEL_ARCADE.cream,
    sub: PIXEL_ARCADE.muted,
    accent: PIXEL_ARCADE.yellow,
    accent2: PIXEL_ARCADE.mint,
  },
  source: "original/pixel-arcade",
} as const;

export const PIXEL_ARCADE_V2 = createPaletteV2(PIXEL_ARCADE_PALETTE.colors);
export const PIXEL_ARCADE_TOKENS = PIXEL_ARCADE_V2.tokens;

export const PIXEL_FONT =
  '"Microsoft YaHei", "Noto Sans SC", "PingFang SC", sans-serif';
export const PIXEL_MONO = 'Consolas, "Courier New", monospace';

export const PIXEL_CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
