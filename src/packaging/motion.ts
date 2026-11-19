import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

export type SpringConfig = {
  damping: number;
  stiffness: number;
  mass: number;
};

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  snap: Easing.bezier(0.2, 1.25, 0.35, 1),
} as const;

export const SPRINGS = {
  smooth: {damping: 19, stiffness: 120, mass: 0.85},
  snappy: {damping: 15, stiffness: 190, mass: 0.66},
  pop: {damping: 11, stiffness: 210, mass: 0.58},
  soft: {damping: 22, stiffness: 90, mass: 1},
} as const satisfies Record<string, SpringConfig>;

export const useReveal = ({
  delay = 0,
  distance = 46,
  fromScale = 0.97,
  durationInFrames = 26,
  springConfig = SPRINGS.smooth,
}: {
  delay?: number;
  distance?: number;
  fromScale?: number;
  durationInFrames?: number;
  springConfig?: SpringConfig;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: springConfig,
    durationInFrames,
  });

  return {
    progress,
    opacity: interpolate(progress, [0, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    translateY: interpolate(progress, [0, 1], [distance, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    scale: interpolate(progress, [0, 1], [fromScale, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      output: "perceptual-scale",
    }),
  };
};

export const usePop = ({
  delay = 0,
  fromScale = 0.2,
  durationInFrames = 18,
}: {
  delay?: number;
  fromScale?: number;
  durationInFrames?: number;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: SPRINGS.pop,
    durationInFrames,
  });

  return {
    progress,
    opacity: interpolate(progress, [0, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    scale: interpolate(progress, [0, 1], [fromScale, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      output: "perceptual-scale",
    }),
  };
};

export const useFloat = (amplitude = 10, speed = 36, phase = 0) => {
  const frame = useCurrentFrame();
  return {
    x: Math.sin(frame / speed + phase) * amplitude,
    y: Math.cos(frame / (speed * 1.13) + phase) * amplitude * 0.72,
    rotate: Math.sin(frame / (speed * 1.5) + phase) * amplitude * 0.16,
  };
};
