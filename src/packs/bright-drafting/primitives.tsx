import type {CSSProperties, FC, ReactNode} from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
} from "remotion";
import {BRIGHT_DRAFTING as C} from "./tokens";

export type Point = [number, number];

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const mix = (
  frame: number,
  start: number,
  duration: number,
  from: number,
  to: number,
  easing: (value: number) => number = Easing.out(Easing.cubic),
) =>
  interpolate(frame, [start, start + duration], [from, to], {
    ...CLAMP,
    easing,
  });

export const springIn = (
  frame: number,
  start: number,
  duration = 18,
  damping = 15,
  stiffness = 180,
) =>
  spring({
    frame: frame - start,
    fps: 30,
    durationInFrames: duration,
    config: {damping, stiffness, mass: 0.7},
  });

export const punchIn = (frame: number, start: number) =>
  spring({
    frame: frame - start,
    fps: 30,
    durationInFrames: 14,
    config: {damping: 11, stiffness: 260, mass: 0.5},
  });

export const pointAlong = (points: Point[], progress: number): Point => {
  if (points.length === 0) return [0, 0];
  if (points.length === 1) return points[0];
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    const length = Math.hypot(dx, dy);
    lengths.push(length);
    total += length;
  }
  let target = clamp01(progress) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i]) {
      const t = lengths[i] === 0 ? 0 : target / lengths[i];
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * t,
        points[i][1] + (points[i + 1][1] - points[i][1]) * t,
      ];
    }
    target -= lengths[i];
  }
  return points[points.length - 1];
};

const roundedPath = (points: Point[], radius = 20) => {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const current = points[i];
    if (i === points.length - 1) {
      d += ` L ${current[0]} ${current[1]}`;
      break;
    }
    const next = points[i + 1];
    const v1x = current[0] - prev[0];
    const v1y = current[1] - prev[1];
    const v2x = next[0] - current[0];
    const v2y = next[1] - current[1];
    const l1 = Math.hypot(v1x, v1y) || 1;
    const l2 = Math.hypot(v2x, v2y) || 1;
    const r = Math.min(radius, l1 / 2, l2 / 2);
    const ax = current[0] - (v1x / l1) * r;
    const ay = current[1] - (v1y / l1) * r;
    const bx = current[0] + (v2x / l2) * r;
    const by = current[1] + (v2y / l2) * r;
    d += ` L ${ax} ${ay} Q ${current[0]} ${current[1]} ${bx} ${by}`;
  }
  return d;
};

export const DraftingCamera: FC<{
  scale?: number;
  origin?: string;
  children: ReactNode;
}> = ({
  scale = 1,
  origin = "50% 50%",
  children,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      transform: `scale(${scale})`,
      transformOrigin: origin,
      backfaceVisibility: "hidden",
    }}
  >
    {children}
  </div>
);

export const DraftingStage: FC<{
  accent: string;
  children: ReactNode;
  gridSize?: number;
}> = ({accent, children, gridSize = 48}) => (
  <AbsoluteFill
    style={{
      backgroundColor: C.bg,
      overflow: "hidden",
      fontFamily: C.font,
    }}
  >
    <AbsoluteFill
      style={{
        backgroundImage:
          `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        opacity: 0.55,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(118deg, rgba(255,253,247,0.26) 0%, rgba(255,253,247,0) 42%, rgba(232,212,156,0.22) 100%)",
        opacity: 0.55,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -220,
        top: -260,
        width: 760,
        height: 760,
        borderRadius: "50%",
        border: `2px solid ${C.hair}`,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -150,
        top: -190,
        width: 560,
        height: 560,
        borderRadius: "50%",
        background: accent,
        opacity: 0.055,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -120,
        bottom: 70,
        width: 380,
        height: 380,
        border: `2px solid ${C.hair}`,
        transform: "rotate(16deg)",
      }}
    />
    {children}
  </AbsoluteFill>
);

export const DraftingRoute: FC<{
  points: Point[];
  progress: number;
  color?: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
}> = ({
  points,
  progress,
  color = C.ink,
  width = 4,
  opacity = 1,
  dashed = false,
}) => (
  <path
    d={roundedPath(points)}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}
    pathLength={1}
    strokeDasharray={dashed ? "0.018 0.014" : "1 1"}
    strokeDashoffset={dashed ? 0 : 1 - clamp01(progress)}
  />
);

export const DraftingFlowDots: FC<{
  points: Point[];
  count?: number;
  speed?: number;
  color?: string;
  size?: number;
  progress?: number;
  phase?: number;
}> = ({
  points,
  count = 3,
  speed = 0.007,
  color = C.teal,
  size = 8,
  progress = 1,
  phase = 0,
}) => {
  const frame = useCurrentFrame();
  if (progress <= 0) return null;
  return (
    <>
      {Array.from({length: count}).map((_, index) => {
        const t = (frame * speed + phase + index / count) % 1;
        if (t > progress) return null;
        const [x, y] = pointAlong(points, t);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 0 2px ${C.paper}`,
            }}
          />
        );
      })}
    </>
  );
};

export const DraftingToken: FC<{
  x: number;
  y: number;
  size?: number;
  color?: string;
}> = ({x, y, size = 48, color = C.gold}) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      background: color,
      border: `3px solid ${C.ink}`,
      borderRadius: 8,
      transform: "rotate(45deg)",
      boxShadow: `0 0 0 4px ${C.paper}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        width: size * 0.26,
        height: size * 0.26,
        borderRadius: "50%",
        background: C.ink,
        transform: "rotate(-45deg)",
      }}
    />
  </div>
);

export const DraftingChip: FC<{
  children: ReactNode;
  tone?:
    | "paper"
    | "red"
    | "coral"
    | "teal"
    | "blue"
    | "violet"
    | "green"
    | "pink"
    | "amber"
    | "gold"
    | "ink";
  size?: number;
  style?: CSSProperties;
  dashed?: boolean;
}> = ({children, tone = "paper", size = 38, style, dashed = false}) => {
  const tones: Record<string, {bg: string; fg: string; border: string}> = {
    paper: {bg: C.paper, fg: C.ink, border: C.ink},
    red: {bg: C.redSoft, fg: C.redDeep, border: C.red},
    coral: {bg: C.coralSoft, fg: C.coralDeep, border: C.coral},
    teal: {bg: C.tealSoft, fg: C.tealDeep, border: C.teal},
    blue: {bg: C.blueSoft, fg: C.blueDeep, border: C.blue},
    violet: {bg: C.violetSoft, fg: C.violetDeep, border: C.violet},
    green: {bg: C.greenSoft, fg: C.greenDeep, border: C.green},
    pink: {bg: C.pinkSoft, fg: C.pinkDeep, border: C.pink},
    amber: {bg: C.amberSoft, fg: C.amberDeep, border: C.amber},
    gold: {bg: C.goldSoft, fg: C.ink, border: C.ink},
    ink: {bg: C.ink, fg: C.paper, border: C.ink},
  };
  const toneStyle = tones[tone];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: `${size * 0.28}px ${size * 0.52}px`,
        borderRadius: 8,
        border: `3px ${dashed ? "dashed" : "solid"} ${toneStyle.border}`,
        background: toneStyle.bg,
        color: toneStyle.fg,
        fontSize: size,
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: 1,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const DraftingPanel: FC<{
  children: ReactNode;
  style?: CSSProperties;
  accent?: string;
  fill?: string;
  shadow?: boolean;
}> = ({children, style, accent = C.ink, fill = C.paper, shadow = true}) => (
  <div
    style={{
      position: "relative",
      background: fill,
      border: `4px solid ${accent}`,
      borderRadius: 10,
      overflow: "hidden",
      boxShadow: shadow ? `0 5px 0 ${C.hair}` : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

export const DraftingSectionTag: FC<{label: string; accent: string}> = ({
  label,
  accent,
}) => (
  <div
    style={{
      position: "absolute",
      left: 96,
      top: 42,
      display: "flex",
      alignItems: "center",
      gap: 18,
      zIndex: 30,
    }}
  >
    <div style={{width: 22, height: 22, background: accent}} />
    <div
      style={{
        fontSize: 38,
        fontWeight: 800,
        letterSpacing: 5,
        color: C.ink,
      }}
    >
      {label}
    </div>
    <div style={{width: 360, height: 2, background: C.line, marginLeft: 6}} />
  </div>
);

export const DraftingGlyph: FC<{
  kind: "split" | "dispatch" | "merge" | "shield" | "gate" | "flag" | "trace" | "loop" | "check";
  size?: number;
  color?: string;
}> = ({kind, size = 72, color = C.ink}) => {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {kind === "split" ? (
        <g {...common}>
          <path d="M 40 68 V 46" />
          <path d="M 40 46 L 18 22" />
          <path d="M 40 46 L 62 22" />
          <circle cx="16" cy="18" r="7" />
          <circle cx="64" cy="18" r="7" />
        </g>
      ) : null}
      {kind === "dispatch" ? (
        <g {...common}>
          <circle cx="40" cy="40" r="11" />
          <path d="M 40 29 V 12" />
          <path d="M 40 51 V 68" />
          <path d="M 29 40 H 12" />
          <path d="M 51 40 H 68" />
          <path d="M 32 32 L 20 20" />
          <path d="M 48 32 L 60 20" />
          <path d="M 32 48 L 20 60" />
          <path d="M 48 48 L 60 60" />
        </g>
      ) : null}
      {kind === "merge" ? (
        <g {...common}>
          <path d="M 16 16 L 40 46" />
          <path d="M 64 16 L 40 46" />
          <path d="M 40 46 V 68" />
          <circle cx="40" cy="72" r="5" />
        </g>
      ) : null}
      {kind === "shield" ? (
        <g {...common}>
          <path d="M 40 10 L 64 20 V 40 C 64 58 40 70 40 70 C 40 70 16 58 16 40 V 20 Z" />
          <path d="M 30 40 L 38 48 L 52 32" />
        </g>
      ) : null}
      {kind === "gate" ? (
        <g {...common}>
          <path d="M 20 68 V 14" />
          <path d="M 60 68 V 14" />
          <path d="M 20 34 H 60" />
          <path d="M 20 52 H 60" />
          <path d="M 40 34 V 52" />
        </g>
      ) : null}
      {kind === "flag" ? (
        <g {...common}>
          <path d="M 24 68 V 12" />
          <path d="M 24 16 H 60 L 50 28 L 60 40 H 24" />
        </g>
      ) : null}
      {kind === "trace" ? (
        <g {...common}>
          <circle cx="14" cy="58" r="7" />
          <circle cx="40" cy="30" r="7" />
          <circle cx="66" cy="50" r="7" />
          <path d="M 20 54 L 34 34" />
          <path d="M 46 33 L 60 46" />
        </g>
      ) : null}
      {kind === "loop" ? (
        <g {...common}>
          <path d="M 62 40 A 22 22 0 1 1 50 22" />
          <path d="M 50 10 V 24 H 64" />
        </g>
      ) : null}
      {kind === "check" ? (
        <g {...common}>
          <circle cx="40" cy="40" r="26" />
          <path d="M 28 41 L 37 50 L 54 30" />
        </g>
      ) : null}
    </svg>
  );
};
