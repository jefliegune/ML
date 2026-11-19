import type {CSSProperties} from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {SoundBars} from "../components/Design";
import {COLORS, FONT} from "../theme";

export type CaptionLine = {
  id: string;
  text: string;
  highlights: string[];
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildSegments = (text: string, highlights: string[]) => {
  const keywords = [...highlights]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (keywords.length === 0) {
    return [{text, highlight: false}];
  }

  const pattern = new RegExp(`(${keywords.map(escapeRegExp).join("|")})`, "g");
  return text
    .split(pattern)
    .filter((part) => part.length > 0)
    .map((part) => ({text: part, highlight: keywords.includes(part)}));
};

export const FullCaptionBar: React.FC<{
  line: CaptionLine;
  darkScene?: boolean;
}> = ({line, darkScene = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: {damping: 20, stiffness: 150, mass: 0.72},
    durationInFrames: 16,
  });
  const segments = buildSegments(line.text, line.highlights);
  const plateStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 17,
    maxWidth: 1640,
    minHeight: 80,
    padding: "12px 28px 13px 20px",
    borderRadius: 17,
    border: darkScene
      ? "2px solid rgba(255,255,255,0.28)"
      : "2px solid rgba(255,255,255,0.12)",
    backgroundColor: "rgba(12,12,12,0.94)",
    boxShadow: "0 14px 42px rgba(0,0,0,0.32)",
    color: COLORS.white,
    fontFamily: FONT,
    fontSize: 34,
    lineHeight: 1.33,
    fontWeight: 650,
    letterSpacing: 0.35,
    opacity: interpolate(enter, [0, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    translate: `0px ${interpolate(enter, [0, 1], [16, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })}px`,
    scale: interpolate(enter, [0, 1], [0.97, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 34,
        pointerEvents: "none",
      }}
    >
      <div style={plateStyle}>
        <SoundBars color={COLORS.lime} />
        <div
          style={{
            maxWidth: 1580,
            overflowWrap: "break-word",
          }}
        >
          {segments.map((segment, index) => (
            <span
              key={`${line.id}-${index}`}
              style={{
                color: segment.highlight ? COLORS.lime : COLORS.white,
                fontWeight: segment.highlight ? 900 : 650,
              }}
            >
              {segment.text}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
