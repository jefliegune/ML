import type {FC} from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame} from "remotion";
import {PIXEL_ARCADE as C, PIXEL_FONT, PIXEL_MONO} from "./tokens";

export type PixelStepKind = "assets" | "style" | "render";

export type PixelStep = {
  index: string;
  key: PixelStepKind;
  title: string;
  english: string;
  command: string;
  detail: string;
  accent: string;
};

export const PixelIcon: FC<{
  kind: PixelStepKind;
  accent: string;
  size?: number;
}> = ({kind, accent, size = 54}) => {
  if (kind === "assets") {
    return (
      <svg width={size} height={size} viewBox="0 0 9 9" shapeRendering="crispEdges">
        {[1, 4, 7].map((x) =>
          [1, 4, 7].map((y) => (
            <rect
              key={`${x}-${y}`}
              x={x - 1}
              y={y - 1}
              width={2.7}
              height={2.7}
              fill={x === 4 && y === 1 ? accent : C.panel2}
              stroke={C.cream}
              strokeWidth={0.34}
            />
          )),
        )}
      </svg>
    );
  }
  if (kind === "style") {
    return (
      <svg width={size} height={size} viewBox="0 0 9 9" shapeRendering="crispEdges">
        <rect x={1} y={1} width={3} height={3} fill={accent} />
        <rect x={5} y={1} width={3} height={3} fill={C.mint} />
        <rect x={1} y={5} width={3} height={3} fill={C.coral} />
        <rect x={5} y={5} width={3} height={3} fill={C.blue} />
        <rect x={2} y={6} width={1} height={1} fill={C.cream} />
        <rect x={6} y={2} width={1} height={1} fill={C.ink} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 9 9" shapeRendering="crispEdges">
      <rect x={1} y={2} width={7} height={5} fill={C.panel2} stroke={C.cream} strokeWidth={0.45} />
      <rect x={3} y={3.5} width={1} height={2} fill={accent} />
      <rect x={4} y={3} width={1} height={3} fill={accent} />
      <rect x={5} y={4} width={1} height={1} fill={accent} />
      <rect x={1} y={7.4} width={5} height={0.8} fill={accent} />
      <rect x={6.2} y={7.4} width={1.8} height={0.8} fill={C.mint} />
    </svg>
  );
};

export const PixelMiniStep: FC<{
  step: PixelStep;
  active?: boolean;
  delay?: number;
}> = ({step, active = false, delay = 0}) => {
  const frame = useCurrentFrame();
  const enter = spring({
    frame: frame - delay,
    fps: 30,
    config: {damping: 18, stiffness: 220, mass: 0.6},
    durationInFrames: 15,
  });

  return (
    <div
      style={{
        width: 330,
        height: 108,
        padding: "14px 17px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        backgroundColor: active ? C.panel2 : C.panel,
        border: `3px solid ${active ? step.accent : C.cream + "33"}`,
        boxShadow: active ? `5px 5px 0 ${step.accent}` : `5px 5px 0 ${C.ink}`,
        opacity: enter,
        translate: `0px ${(1 - enter) * 18}px`,
      }}
    >
      <PixelIcon kind={step.key} accent={step.accent} size={48} />
      <div>
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <span
            style={{
              color: step.accent,
              fontFamily: PIXEL_MONO,
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {step.index}
          </span>
          <span style={{fontFamily: PIXEL_FONT, fontSize: 27, fontWeight: 900}}>
            {step.title}
          </span>
        </div>
        <div
          style={{
            marginTop: 4,
            color: C.muted,
            fontFamily: PIXEL_MONO,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.8,
          }}
        >
          {step.command}
        </div>
      </div>
    </div>
  );
};

export const PixelStepCard: FC<{
  step: PixelStep;
  left: number;
  active: boolean;
  progress: number;
}> = ({step, left, active, progress}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 258,
        width: 540,
        height: 448,
        backgroundColor: active ? C.panel2 : C.panel,
        border: `4px solid ${active ? step.accent : C.cream + "36"}`,
        boxShadow: active ? `10px 10px 0 ${step.accent}` : `8px 8px 0 ${C.ink}`,
        opacity: active ? 1 : 0.75,
        scale: active ? 1.025 : 0.985,
        translate: active ? "0px -8px" : "0px 3px",
      }}
    >
      <div
        style={{
          height: 55,
          padding: "0 17px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: active ? step.accent : C.panel,
          borderBottom: `3px solid ${active ? step.accent : C.cream + "24"}`,
          color: active ? C.ink : C.muted,
          fontFamily: PIXEL_MONO,
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: 1.6,
        }}
      >
        <span>STEP_{step.index}</span>
        <span>{active ? "ACTIVE" : "QUEUED"}</span>
      </div>

      {active ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 55,
            height: 4,
            width: `${Math.min(1, progress) * 100}%`,
            backgroundColor: step.accent,
          }}
        />
      ) : null}

      <div style={{padding: "28px 32px 0"}}>
        <div
          style={{
            width: 98,
            height: 98,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: active ? C.ink : C.bg2,
            border: `3px solid ${active ? step.accent : C.cream + "2D"}`,
            boxShadow: active ? `5px 5px 0 ${C.ink}` : "none",
          }}
        >
          <PixelIcon kind={step.key} accent={step.accent} size={72} />
        </div>

        <div
          style={{
            marginTop: 25,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{fontFamily: PIXEL_FONT, fontSize: 48, fontWeight: 900, letterSpacing: 0.6}}>
            {step.title}
          </div>
          <div
            style={{
              marginTop: 5,
              fontFamily: PIXEL_MONO,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1.6,
              color: step.accent,
            }}
          >
            {step.english}
          </div>
        </div>

        <div
          style={{
            marginTop: 13,
            fontFamily: PIXEL_FONT,
            fontSize: 19,
            lineHeight: 1.55,
            fontWeight: 650,
            color: active ? C.cream : C.muted,
          }}
        >
          {step.detail}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 20,
          height: 48,
          padding: "0 13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: C.ink,
          border: `2px solid ${C.cream}30`,
          fontFamily: PIXEL_MONO,
          fontSize: 13,
          fontWeight: 900,
          color: C.cream,
        }}
      >
        <span>
          <span style={{color: step.accent}}>$ </span>
          {step.command}
        </span>
        <span
          style={{
            width: 8,
            height: 16,
            backgroundColor: step.accent,
            opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0.1,
          }}
        />
      </div>
    </div>
  );
};

export const PixelWorkflowScene: FC<{
  steps: PixelStep[];
  tag: string;
  heading: string;
  stepDuration?: number;
  footer?: string;
}> = ({steps, tag, heading, stepDuration = 29, footer = "CHOOSE ONE STEP AT A TIME"}) => {
  const frame = useCurrentFrame();
  const active = Math.min(steps.length - 1, Math.floor(frame / stepDuration));
  const totalWidth = steps.length * 540 + Math.max(0, steps.length - 1) * 30;
  const startX = (1920 - totalWidth) / 2;
  const headingOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 94,
          top: 146,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: headingOpacity,
          translate: `0px ${(1 - headingOpacity) * 28}px`,
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: C.yellow,
            color: C.ink,
            fontFamily: PIXEL_MONO,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1.6,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          {tag}
        </div>
        <div style={{fontFamily: PIXEL_FONT, fontSize: 31, fontWeight: 900, color: C.cream}}>
          {heading}
        </div>
      </div>

      {steps.map((step, index) => {
        const localStart = index * stepDuration;
        const progress = interpolate(frame, [localStart + 2, localStart + 24], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <PixelStepCard
            key={step.key}
            step={step}
            left={startX + index * 570}
            active={active === index}
            progress={progress}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 94,
          top: 728,
          right: 86,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: PIXEL_MONO,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1.5,
          color: C.muted,
        }}
      >
        <span>{footer}</span>
        <span style={{color: steps[active]?.accent ?? C.mint}}>
          {steps[active]?.index} / {steps[active]?.english}
        </span>
      </div>
    </AbsoluteFill>
  );
};
