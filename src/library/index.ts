import catalogJson from "./catalog.json";
import huashuJson from "./huashu.json";
import originalPacksJson from "./original-packs.json";
import {createPaletteV2, type PaletteTokens} from "../color-system";

export * from "./HuashuFonts";

export type StyleFamily = "huashu" | "original";

export interface LibraryPalette {
  id: string;
  name: string;
  bestFor: string;
  colors: {
    bg: string;
    surface: string;
    ink: string;
    sub: string;
    accent: string;
    accent2: string;
  };
  tokens?: PaletteTokens;
  docPath?: string;
  source: string;
}

export interface LibraryStyle {
  id: string;
  name: string;
  family: StyleFamily;
  quality: number;
  palette: string | null;
  technique: string;
  motion: string;
  transition: string;
  weakness: string;
  cardPath?: string;
  source: string;
  english?: string;
  original?: string;
  summary?: string;
  visual?: string;
  techniques?: string[];
  demo?: string;
  order?: number;
}

export interface LibraryGrammar {
  id: string;
  name: string;
  oneLiner: string;
  cardPath?: string;
  source: string;
}

export interface LibrarySource {
  id: string;
  name: string;
  author: string;
  repo: string;
  license: string;
  usage: string;
  note: string;
}

export interface LibraryPack {
  id: string;
  name: string;
  entry: string;
  manifest: string;
  previewComposition: string;
  palette: string;
  status: string;
}

export const catalog = catalogJson;

const withPaletteTokens = (palette: LibraryPalette): LibraryPalette => ({
  ...palette,
  tokens: palette.tokens ?? createPaletteV2(palette.colors).tokens,
});

export const PALETTES = [
  ...(catalogJson.palettes as LibraryPalette[]),
  ...(originalPacksJson.palettes as LibraryPalette[]),
].map(withPaletteTokens);
export const STYLES = [
  ...(catalogJson.styles as LibraryStyle[]),
  ...(originalPacksJson.styles as LibraryStyle[]),
];
export const GRAMMARS = [
  ...(catalogJson.grammars as LibraryGrammar[]),
  ...(originalPacksJson.grammars as LibraryGrammar[]),
];
export const SOURCES = [
  ...(catalogJson.sources as LibrarySource[]),
  ...(originalPacksJson.sources as LibrarySource[]),
];
export const PACKS = originalPacksJson.packs as LibraryPack[];
export const HUASHU_LIBRARY = huashuJson;

export const getPalette = (id: string | null | undefined): LibraryPalette =>
  PALETTES.find((palette) => palette.id === id) ?? PALETTES[0];

export const getStyle = (id: string): LibraryStyle | undefined =>
  STYLES.find((style) => style.id === id);

export const getGrammar = (id: string): LibraryGrammar | undefined =>
  GRAMMARS.find((grammar) => grammar.id === id);

export const getHuashuStyleCard = (id: string) =>
  HUASHU_LIBRARY.styles.find((style) => style.id === id);

export const getHuashuGrammarCard = (id: string) =>
  HUASHU_LIBRARY.grammars.find((grammar) => grammar.id === id);

export const getHuashuFont = (family: string) =>
  HUASHU_LIBRARY.fonts.find((font) => font.family === family);

export const STYLE_COUNTS = {
  huashu: STYLES.filter((style) => style.family === "huashu").length,
  original: STYLES.filter((style) => style.family === "original").length,
  palettes: PALETTES.length,
  grammars: GRAMMARS.length,
  packs: PACKS.length,
};
