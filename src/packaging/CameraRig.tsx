import type {CSSProperties, FC, ReactNode} from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";

export type CameraMove =
  | "still"
  | "push"
  | "pull"
  | "pan-left"
  | "pan-right"
  | "snap";

const smooth = Easing.bezier(0.22, 1, 0.36, 1);
const snap = Easing.bezier(0.16, 1, 0.3, 1);

export interface CameraRigProps {
  children: ReactNode;
  move?: CameraMove;
  amount?: number;
  panPercent?: number;
  startFrame?: number;
  durationInFrames?: number;
  origin?: string;
  style?: CSSProperties;
}

export const CameraRig: FC<CameraRigProps> = ({
  children,
  move = "push",
  amount = 1.08,
  panPercent = 5,
  startFrame = 0,
  durationInFrames = 90,
  origin = "50% 50%",
  style,
}) => {
  const frame = useCurrentFrame();
  const isSnap = move === "snap";
  const end = startFrame + (isSnap ? 18 : durationInFrames);
  const raw = interpolate(frame, [startFrame, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const progress = (isSnap ? snap : smooth)(raw);

  let scale = 1;
  let translateX = 0;
  const translateY = 0;

  if (move === "push" || move === "snap") {
    scale = 1 + (amount - 1) * progress;
  }
  if (move === "pull") {
    scale = amount - (amount - 1) * progress;
  }
  if (move === "pan-left" || move === "pan-right") {
    scale = Math.max(1.02, amount * 0.94);
    const direction = move === "pan-left" ? -1 : 1;
    translateX = direction * panPercent * progress;
  }

  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          transform: `translate(${translateX}%, ${translateY}%) scale(${scale})`,
          transformOrigin: origin,
          ...style,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};