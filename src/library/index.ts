import catalogJson from "./catalog.json";

export type StyleFamily = "mg" | "huashu";

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

export const catalog = catalogJson;

export const PALETTES = catalogJson.palettes as LibraryPalette[];
export const STYLES = catalogJson.styles as LibraryStyle[];
export const GRAMMARS = catalogJson.grammars as LibraryGrammar[];
export const SOURCES = catalogJson.sources as LibrarySource[];
export const CUE_SCHEMA = catalogJson.cueSchema;

export const getPalette = (id: string | null | undefined): LibraryPalette =>
  PALETTES.find((palette) => palette.id === id) ?? PALETTES[0];

export const getStyle = (id: string): LibraryStyle | undefined =>
  STYLES.find((style) => style.id === id);

export const getGrammar = (id: string): LibraryGrammar | undefined =>
  GRAMMARS.find((grammar) => grammar.id === id);

export const STYLE_COUNTS = {
  mg: STYLES.filter((style) => style.family === "mg").length,
  huashu: STYLES.filter((style) => style.family === "huashu").length,
  palettes: PALETTES.length,
  grammars: GRAMMARS.length,
};