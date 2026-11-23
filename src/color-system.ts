export interface PaletteSeed {
  bg: string;
  surface: string;
  ink: string;
  sub: string;
  accent: string;
  accent2: string;
}

export interface PaletteTokens {
  bg: {
    base: string;
    subtle: string;
    sunken: string;
  };
  surface: {
    base: string;
    raised: string;
    sunken: string;
    overlay: string;
  };
  ink: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  line: {
    subtle: string;
    strong: string;
  };
  accent: {
    base: string;
    soft: string;
    deep: string;
    ink: string;
  };
  support: {
    base: string;
    soft: string;
    deep: string;
    ink: string;
  };
  status: {
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
    dangerSoft: string;
    info: string;
    infoSoft: string;
  };
  shadow: {
    soft: string;
    hard: string;
  };
  highlight: string;
}

export interface PaletteV2 extends PaletteSeed {
  tokens: PaletteTokens;
}

type RGB = [number, number, number];

const parseHex = (hex: string): RGB => {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((part) => `${part}${part}`)
          .join("")
      : value;
  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    throw new Error(`Unsupported color: ${hex}`);
  }
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
};

const toHex = ([red, green, blue]: RGB) =>
  `#${[red, green, blue]
    .map((value) => Math.round(value).toString(16).padStart(2, "0"))
    .join("")}`;

export const mixHex = (from: string, to: string, weight: number): string => {
  const a = parseHex(from);
  const b = parseHex(to);
  const amount = Math.min(1, Math.max(0, weight));
  return toHex([
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ]);
};

export const alphaHex = (hex: string, alpha: number): string => {
  const [red, green, blue] = parseHex(hex);
  return `rgba(${red}, ${green}, ${blue}, ${Math.min(1, Math.max(0, alpha))})`;
};

const luminance = (hex: string): number => {
  const channels = parseHex(hex).map((value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

export const contrastInk = (background: string): string =>
  luminance(background) > 0.42 ? "#111318" : "#F7F5EF";

export const createPaletteTokens = (seed: PaletteSeed): PaletteTokens => {
  const dark = luminance(seed.bg) < 0.34;
  const surfaceRaised = dark
    ? mixHex(seed.surface, seed.ink, 0.07)
    : mixHex(seed.surface, "#FFFFFF", 0.46);
  const surfaceSunken = mixHex(seed.surface, seed.bg, 0.56);
  const accentSoft = mixHex(seed.accent, seed.bg, 0.82);
  const supportSoft = mixHex(seed.accent2, seed.bg, 0.82);
  const success = dark ? "#67D6A0" : "#327A55";
  const warning = dark ? "#F2C14E" : "#A86B18";
  const danger = dark ? "#FF8073" : "#A64036";
  const info = dark ? "#79B4E8" : "#356FA8";

  return {
    bg: {
      base: seed.bg,
      subtle: mixHex(seed.bg, seed.ink, dark ? 0.06 : 0.035),
      sunken: mixHex(seed.bg, seed.ink, dark ? 0.12 : 0.075),
    },
    surface: {
      base: seed.surface,
      raised: surfaceRaised,
      sunken: surfaceSunken,
      overlay: alphaHex(seed.surface, 0.88),
    },
    ink: {
      primary: seed.ink,
      secondary: seed.sub,
      tertiary: mixHex(seed.sub, seed.bg, 0.38),
      inverse: contrastInk(seed.bg),
    },
    line: {
      subtle: alphaHex(seed.ink, dark ? 0.18 : 0.14),
      strong: alphaHex(seed.ink, dark ? 0.32 : 0.28),
    },
    accent: {
      base: seed.accent,
      soft: accentSoft,
      deep: mixHex(seed.accent, dark ? "#000000" : seed.ink, 0.24),
      ink: contrastInk(seed.accent),
    },
    support: {
      base: seed.accent2,
      soft: supportSoft,
      deep: mixHex(seed.accent2, dark ? "#000000" : seed.ink, 0.24),
      ink: contrastInk(seed.accent2),
    },
    status: {
      success,
      successSoft: mixHex(success, seed.bg, 0.82),
      warning,
      warningSoft: mixHex(warning, seed.bg, 0.82),
      danger,
      dangerSoft: mixHex(danger, seed.bg, 0.82),
      info,
      infoSoft: mixHex(info, seed.bg, 0.82),
    },
    shadow: {
      soft: dark ? "rgba(0, 0, 0, 0.42)" : alphaHex(seed.ink, 0.16),
      hard: seed.ink,
    },
    highlight: dark ? "rgba(255, 255, 255, 0.09)" : "rgba(255, 255, 255, 0.66)",
  };
};

export const createPaletteV2 = (seed: PaletteSeed): PaletteV2 => ({
  ...seed,
  tokens: createPaletteTokens(seed),
});
