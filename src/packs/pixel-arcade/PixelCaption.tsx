import type {FC} from "react";
import {spring, useCurrentFrame} from "remotion";
import {PIXEL_ARCADE as C, PIXEL_FONT, PIXEL_MONO} from "./tokens";
import {PixelSpeechBars} from "./PixelChrome";

export type PixelCaptionCue = {
  from: number;
  to: number;
  text: string;
  highlights?: readonly string[];
  label?: string;
};

const tokenizeCaption = (text: string, highlights: readonly string[]) => {
  if (highlights.length === 0) return [{text, highlight: false}];
  const escaped = highlights
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const split = text.split(new RegExp(`(${escaped.join("|")})`, "g"));
  return split
    .filter(Boolean)
    .map((part) => ({text: part, highlight: highlights.includes(part)}));
};

export const PixelCaptionBar: FC<{
  cues: readonly PixelCaptionCue[];
  accent?: string;
  left?: number;
  bottom?: number;
}> = ({cues, accent = C.mint, left = 340, bottom = 38}) => {
  const frame = useCurrentFrame();
  const line = cues.find((item) => frame >= item.from && frame < item.to) ?? cues[cues.length - 1];
  if (!line) return null;

  const enter = spring({
    frame: frame - line.from,
    fps: 30,
    config: {damping: 18, stiffness: 220, mass: 0.55},
    durationInFrames: 12,
  });
  const parts = tokenizeCaption(line.text, line.highlights ?? []);

  return (
    <div
      style={{
        position: "absolute",
        left,
        right: 56,
        bottom,
        height: 132,
        display: "flex",
        backgroundColor: C.ink,
        border: `4px solid ${C.cream}`,
        boxShadow: `8px 8px 0 ${accent}, 14px 14px 0 ${C.ink}`,
        zIndex: 40,
        opacity: enter,
        translate: `0px ${(1 - enter) * 18}px`,
      }}
    >
      <div
        style={{
          width: 112,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          backgroundColor: C.panel2,
          borderRight: `2px solid ${C.cream}2E`,
          color: C.yellow,
          fontFamily: PIXEL_MONO,
          fontWeight: 900,
          letterSpacing: 1,
        }}
      >
        <span style={{fontSize: 19}}>CC</span>
        <PixelSpeechBars color={accent} />
        <span style={{fontSize: 9, color: C.muted}}>
          {line.label ?? "CAPTION"}
        </span>
      </div>

      <div
        style={{
          flex: 1,
          padding: "0 27px",
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            fontFamily: PIXEL_FONT,
            fontSize: 40,
            lineHeight: 1.25,
            fontWeight: 850,
            letterSpacing: 0.3,
            color: C.cream,
            textShadow: `3px 3px 0 ${C.bg}`,
          }}
        >
          {parts.map((part, index) =>
            part.highlight ? (
              <span
                key={`${part.text}-${index}`}
                style={{
                  display: "inline-block",
                  margin: "0 3px",
                  padding: "0 7px 2px",
                  backgroundColor: C.yellow,
                  color: C.ink,
                  textShadow: "none",
                  boxShadow: `3px 3px 0 ${accent}`,
                }}
              >
                {part.text}
              </span>
            ) : (
              <span key={`${part.text}-${index}`}>{part.text}</span>
            ),
          )}
        </div>
        <div
          style={{
            position: "absolute",
            right: 16,
            top: 11,
            fontFamily: PIXEL_MONO,
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: 1.5,
            color: accent,
          }}
        >
          AUTO CAPTION
        </div>
      </div>
    </div>
  );
};
