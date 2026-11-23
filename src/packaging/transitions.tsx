import type {CSSProperties, ReactNode} from "react";
import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {BRAND_TOKENS, RADIUS, SHADOW, STROKE, TYPE} from "./tokens";

export const SectionWipe: React.FC<{
  color?: string;
  durationInFrames?: number;
  direction?: 1 | -1;
  angle?: number;
  label?: string;
}> = ({
  color = BRAND_TOKENS.signal,
  durationInFrames = 16,
  direction = 1,
  angle = -5.5,
  label,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const from = direction === 1 ? -120 : 120;
  const to = direction === 1 ? 120 : -120;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 90,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "-24%",
          top: "-15%",
          width: "148%",
          height: "130%",
          backgroundColor: color,
          rotate: `${angle}deg`,
          translate: `${interpolate(progress, [0, 1], [from, to])}% 0px`,
          borderLeft: `20px solid ${BRAND_TOKENS.ink.primary}`,
          borderRight: `20px solid ${BRAND_TOKENS.ink.primary}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 86px, rgba(21,21,21,0.09) 86px 90px)",
          }}
        />
        {label ? (
          <div
            style={{
              position: "relative",
              ...TYPE.display,
              fontSize: 112,
              color: BRAND_TOKENS.ink.primary,
              opacity: 0.88,
            }}
          >
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const ImpactStamp: React.FC<{
  children: ReactNode;
  delay?: number;
  color?: string;
  rotate?: number;
  style?: CSSProperties;
}> = ({children, delay = 0, color = BRAND_TOKENS.support.base, rotate = -8, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: {damping: 9, stiffness: 200, mass: 0.7},
    durationInFrames: 18,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "fit-content",
        padding: "16px 20px 15px",
        border: `${STROKE.heavy}px solid ${BRAND_TOKENS.ink.primary}`,
        borderRadius: RADIUS.md,
        backgroundColor: color,
        color: BRAND_TOKENS.ink.primary,
        boxShadow: SHADOW.card,
        rotate: `${rotate}deg`,
        opacity: interpolate(enter, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(enter, [0, 1], [1.7, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        }),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const CutFlash: React.FC<{
  color?: string;
  durationInFrames?: number;
}> = ({color = "#FFFFFF", durationInFrames = 8}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 2, durationInFrames],
    [0, 0.42, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: color,
        opacity,
        pointerEvents: "none",
        zIndex: 92,
      }}
    />
  );
};
