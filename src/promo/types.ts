export type PromoTone = "paper" | "ink" | "signal";

export type PromoMetric = {
  value: string;
  label: string;
};

export type PromoItem = {
  label: string;
  title: string;
  body?: string;
  value?: string;
};

export type PromoStep = {
  label: string;
  note: string;
};

export type PromoCommand = {
  cmd: string;
  note: string;
};

export type PromoSection = {
  id: string;
  index: string;
  label: string;
  tone: PromoTone;
  startFrame: number;
  endFrame: number;
  title: string;
  subtitle?: string;
  metrics?: PromoMetric[];
  items?: PromoItem[];
  steps?: PromoStep[];
  commands?: PromoCommand[];
  cta?: string;
  cues?: number[];
};

export type PromoLine = {
  id: string;
  section: string;
  file: string;
  text: string;
  highlights: string[];
  startFrame: number;
  endFrame: number;
  captionStartFrame: number;
  captionEndFrame: number;
  durationSeconds: number;
};

export type PromoProps = {
  title: string;
  subtitle: string;
  repo: string;
  voice: string;
  fps: number;
  durationInFrames: number;
  sections: PromoSection[];
  lines: PromoLine[];
};
