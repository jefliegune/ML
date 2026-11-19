import type {CSSProperties, FC} from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface KineticTypeProps {
  tokens: string[];
  accent?: number[];
  startFrame?: number;
  stagger?: number;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  accentColor?: string;
  accentTextColor?: string;
  align?: CSSProperties["textAlign"];
  highlight?: "marker" | "block" | "none";
  style?: CSSProperties;
}

export const KineticType: FC<KineticTypeProps> = ({
  tokens,
  accent = [],
  startFrame = 0,
  stagger = 3,
  fontSize = 96,
  lineHeight = 1.15,
  color = "#151515",
  accentColor = "#D8FF43",
  accentTextColor = "#151515",
  align = "left",
  highlight = "marker",
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const accentSet = new Set(accent);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent:
          align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        alignItems: "baseline",
        gap: "0 0.28em",
        fontFamily:
          '"HarmonyOS Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
        fontSize,
        fontWeight: 900,
        lineHeight,
        letterSpacing: "-0.03em",
        color,
        textAlign: align,
        ...style,
      }}
    >
      {tokens.map((token, index) => {
        const local = Math.max(0, frame - startFrame - index * stagger);
        const enter = spring({
          frame: local,
          fps,
          config: {damping: 15, mass: 0.6, stiffness: 150},
        });
        const lift = interpolate(enter, [0, 1], [34, 0]);
        const opacity = interpolate(enter, [0, 0.55], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isAccent = accentSet.has(index);
        const marker = interpolate(
          local,
          [10, 18],
          [0, 1],
          {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
        );

        return (
          <span
            key={`${token}-${index}`}
            style={{
              position: "relative",
              display: "inline-block",
              transform: `translateY(${lift}px)`,
              opacity,
              color: isAccent ? accentTextColor : color,
              whiteSpace: "pre",
            }}
          >
            {isAccent && highlight === "block" ? (
              <span
                style={{
                  position: "absolute",
                  inset: "0.04em -0.08em",
                  background: accentColor,
                  transform: `scaleX(${marker})`,
                  transformOrigin: "left center",
                  zIndex: 0,
                }}
              />
            ) : null}
            {isAccent && highlight === "marker" ? (
              <span
                style={{
                  position: "absolute",
                  left: "-0.04em",
                  right: "-0.04em",
                  bottom: "0.08em",
                  height: "0.22em",
                  background: accentColor,
                  transform: `scaleX(${marker})`,
                  transformOrigin: "left center",
                  zIndex: 0,
                }}
              />
            ) : null}
            <span style={{position: "relative", zIndex: 1}}>{token}</span>
          </span>
        );
      })}
    </div>
  );
};