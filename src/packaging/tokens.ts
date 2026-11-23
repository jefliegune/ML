import type {CSSProperties} from "react";
import {COLORS, EDITORIAL_TOKENS, FONT, MONO} from "../theme";

export type BrandTone = "paper" | "ink" | "signal";

export const BRAND_TOKENS = {
  ...EDITORIAL_TOKENS,
  signal: COLORS.lime,
  info: COLORS.cyan,
} as const;

export const BRAND_COLORS = {
  ...COLORS,
  bg: EDITORIAL_TOKENS.bg.base,
  bgSubtle: EDITORIAL_TOKENS.bg.subtle,
  bgSunken: EDITORIAL_TOKENS.bg.sunken,
  surface: EDITORIAL_TOKENS.surface.base,
  surfaceRaised: EDITORIAL_TOKENS.surface.raised,
  surfaceSunken: EDITORIAL_TOKENS.surface.sunken,
  surfaceOverlay: EDITORIAL_TOKENS.surface.overlay,
  inkMuted: EDITORIAL_TOKENS.ink.secondary,
  inkFaint: EDITORIAL_TOKENS.ink.tertiary,
  line: EDITORIAL_TOKENS.line.subtle,
  lineStrong: EDITORIAL_TOKENS.line.strong,
  accent: EDITORIAL_TOKENS.accent.base,
  accentSoft: EDITORIAL_TOKENS.accent.soft,
  accentDeep: EDITORIAL_TOKENS.accent.deep,
  support: EDITORIAL_TOKENS.support.base,
  supportSoft: EDITORIAL_TOKENS.support.soft,
  supportDeep: EDITORIAL_TOKENS.support.deep,
  success: EDITORIAL_TOKENS.status.success,
  warning: EDITORIAL_TOKENS.status.warning,
  danger: EDITORIAL_TOKENS.status.danger,
  shadowSoft: EDITORIAL_TOKENS.shadow.soft,
  highlight: EDITORIAL_TOKENS.highlight,
  signal: COLORS.lime,
  info: COLORS.cyan,
  dim: "#2A2925",
  paperEdge: "#DED6C5",
  warmSignal: "#FF8A6B",
  grid: "rgba(21,21,21,0.12)",
  gridDark: "rgba(255,255,255,0.13)",
} as const;

export const TYPE: Record<string, CSSProperties> = {
  display: {
    fontFamily: FONT,
    fontSize: 136,
    lineHeight: 0.94,
    fontWeight: 900,
    letterSpacing: -7,
  },
  h1: {
    fontFamily: FONT,
    fontSize: 88,
    lineHeight: 1.02,
    fontWeight: 850,
    letterSpacing: -3.6,
  },
  h2: {
    fontFamily: FONT,
    fontSize: 64,
    lineHeight: 1.06,
    fontWeight: 800,
    letterSpacing: -2.2,
  },
  h3: {
    fontFamily: FONT,
    fontSize: 42,
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: -0.8,
  },
  body: {
    fontFamily: FONT,
    fontSize: 24,
    lineHeight: 1.45,
    fontWeight: 600,
    letterSpacing: 0,
  },
  small: {
    fontFamily: FONT,
    fontSize: 18,
    lineHeight: 1.35,
    fontWeight: 650,
    letterSpacing: 0,
  },
  label: {
    fontFamily: MONO,
    fontSize: 13,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: 1.5,
  },
  micro: {
    fontFamily: MONO,
    fontSize: 10,
    lineHeight: 1.1,
    fontWeight: 900,
    letterSpacing: 1.2,
  },
};

export const SPACE = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  huge: 86,
} as const;

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const STROKE = {
  hair: 1,
  base: 2,
  strong: 4,
  heavy: 6,
} as const;

export const SHADOW = {
  micro: `4px 5px 0 ${COLORS.ink}`,
  card: `9px 10px 0 ${COLORS.ink}`,
  hero: `14px 15px 0 ${COLORS.ink}`,
  float: "0 18px 50px rgba(0,0,0,0.24)",
  soft: `0 18px 48px ${EDITORIAL_TOKENS.shadow.soft}`,
  tinted: `0 18px 52px ${EDITORIAL_TOKENS.shadow.soft}`,
} as const;

export const SAFE_AREA = {
  top: 86,
  left: 86,
  right: 86,
  bottom: 48,
  caption: 34,
  headlineWidth: 1280,
} as const;

export const Z = {
  background: 0,
  pattern: 1,
  content: 10,
  chrome: 20,
  wipe: 90,
  stamp: 95,
} as const;
